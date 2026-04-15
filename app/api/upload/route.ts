import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'
import { addDays } from 'date-fns'
import { supabaseAdmin } from '@/lib/supabase'
import { UploadConfig } from '@/types'



const MAX_SIZE = 2 * 1024 * 1024 * 1024 // 2GB
const MAX_FILES = 20

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const files = formData.getAll('files') as File[]
    const configRaw = formData.get('config') as string
    const uploadConfig: UploadConfig = JSON.parse(configRaw)

    // Validation
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'Nessun file ricevuto' }, { status: 400 })
    }
    if (files.length > MAX_FILES) {
      return NextResponse.json({ error: `Massimo ${MAX_FILES} file per trasferimento` }, { status: 400 })
    }

    const totalSize = files.reduce((acc, f) => acc + f.size, 0)
    if (totalSize > MAX_SIZE) {
      return NextResponse.json({ error: 'Dimensione totale supera 2GB' }, { status: 400 })
    }

    const supabase = supabaseAdmin()
    const token = uuidv4()
    const transferId = uuidv4()
    const expiresAt = addDays(new Date(), parseInt(uploadConfig.expiry)).toISOString()

    // Hash password if provided
    let passwordHash: string | null = null
    if (uploadConfig.password && uploadConfig.password.trim()) {
      passwordHash = await bcrypt.hash(uploadConfig.password, 12)
    }

    // Insert transfer record
    const { error: transferError } = await supabase.from('transfers').insert({
      id: transferId,
      token,
      expires_at: expiresAt,
      password_hash: passwordHash,
      max_downloads: uploadConfig.maxDownloads,
      download_count: 0,
      message: uploadConfig.message || null,
      sender_email: uploadConfig.senderEmail || null,
      total_size: totalSize,
    })

    if (transferError) {
      console.error('Transfer insert error:', transferError)
      return NextResponse.json({ error: 'Errore nel database' }, { status: 500 })
    }

    // Upload each file to Supabase Storage
    const fileRecords = []
    for (const file of files) {
      const fileId = uuidv4()
      const storagePath = `transfers/${transferId}/${fileId}_${file.name}`

      const arrayBuffer = await file.arrayBuffer()
      const buffer = new Uint8Array(arrayBuffer)

      const { error: storageError } = await supabase.storage
        .from('filedrop')
        .upload(storagePath, buffer, {
          contentType: file.type || 'application/octet-stream',
          upsert: false,
        })

      if (storageError) {
        console.error('Storage upload error:', storageError)
        // Cleanup: delete transfer record
        await supabase.from('transfers').delete().eq('id', transferId)
        return NextResponse.json({ error: `Errore upload file: ${file.name}` }, { status: 500 })
      }

      fileRecords.push({
        id: fileId,
        transfer_id: transferId,
        filename: file.name,
        size: file.size,
        mime_type: file.type || 'application/octet-stream',
        storage_path: storagePath,
      })
    }

    // Insert file records
    const { error: filesError } = await supabase.from('transfer_files').insert(fileRecords)
    if (filesError) {
      console.error('Files insert error:', filesError)
      return NextResponse.json({ error: 'Errore nel salvataggio dei file' }, { status: 500 })
    }

    return NextResponse.json({ token, expiresAt }, { status: 201 })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

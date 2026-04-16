import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { addDays } from 'date-fns'
import { v4 as uuidv4 } from 'uuid'

async function verifyApiKey(req: NextRequest) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer vt_live_')) return null

  const rawKey = authHeader.replace('Bearer ', '')
  const supabase = supabaseAdmin()

  // Trova tutte le key attive e verifica con bcrypt
  const { data: keys } = await supabase
    .from('api_keys')
    .select('id, user_id, key_hash')
    .eq('is_active', true)

  for (const key of keys || []) {
    const match = await bcrypt.compare(rawKey, key.key_hash)
    if (match) {
      // Aggiorna last_used_at
      await supabase.from('api_keys').update({ last_used_at: new Date().toISOString() }).eq('id', key.id)
      return key.user_id
    }
  }
  return null
}

// POST /api/v1/upload — crea un transfer con file già caricati su Storage
export async function POST(req: NextRequest) {
  const userId = await verifyApiKey(req)
  if (!userId) {
    return NextResponse.json({ error: 'API key non valida o mancante' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { files, expiry = '7', maxDownloads, password, message } = body

    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json({ error: 'Parametro "files" richiesto' }, { status: 400 })
    }

    const supabase = supabaseAdmin()
    const transferId = uuidv4()
    const expiresAt = addDays(new Date(), parseInt(expiry)).toISOString()
    const totalSize = files.reduce((acc: number, f: any) => acc + (f.size || 0), 0)

    let passwordHash = null
    if (password) passwordHash = await bcrypt.hash(password, 12)

    await supabase.from('transfers').insert({
      id: transferId,
      token: transferId,
      expires_at: expiresAt,
      password_hash: passwordHash,
      max_downloads: maxDownloads || null,
      download_count: 0,
      message: message || null,
      user_id: userId,
      total_size: totalSize,
    })

    const fileRecords = files.map((f: any) => ({
      id: uuidv4(),
      transfer_id: transferId,
      filename: f.filename,
      size: f.size,
      mime_type: f.mimeType || 'application/octet-stream',
      storage_path: f.storagePath,
    }))

    await supabase.from('transfer_files').insert(fileRecords)

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vaultransfer.com'

    return NextResponse.json({
      token: transferId,
      downloadUrl: `${appUrl}/download/${transferId}`,
      expiresAt,
    }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
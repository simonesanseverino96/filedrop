import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { addDays } from 'date-fns'
import { isBlockedFile } from '@/lib/blocklist'
import { sendUploadConfirmation } from '@/lib/email'
import { v4 as uuidv4 } from 'uuid'

export interface UploadFile {
  id?: string
  filename: string
  size: number
  mimeType?: string
  storagePath?: string
}

export interface FinalizeTransferOptions {
  transferId?: string
  files: UploadFile[]
  expiry?: string | number
  password?: string
  message?: string
  senderEmail?: string
  maxDownloads?: number | null
  userId?: string | null
  locale?: string
}

export async function finalizeTransfer(options: FinalizeTransferOptions) {
  const {
    files,
    expiry = '7',
    password,
    message,
    senderEmail,
    maxDownloads = null,
    userId = null,
    locale = 'en',
  } = options

  if (!files || files.length === 0) {
    throw new Error('ERR_MISSING_FILES')
  }

  const blockedFile = files.find((f) => isBlockedFile(f.filename))
  if (blockedFile) {
    throw new Error(`ERR_FILE_NOT_ALLOWED:${blockedFile.filename}`)
  }

  const transferId = options.transferId || uuidv4()
  const expiresAt = addDays(new Date(), parseInt(expiry.toString())).toISOString()

  const supabase = supabaseAdmin()

  let storageFiles: any[] = []
  // Se options.transferId è stato fornito, significa che il client ha già caricato i file
  // tramite i signed URLs di /api/upload/init. Validiamo quindi le dimensioni reali.
  if (options.transferId) {
    const { data, error } = await supabase.storage
      .from('filedrop')
      .list(`transfers/${transferId}`)
    
    if (error) {
      console.error('Storage list error:', error)
      throw new Error('ERR_STORAGE')
    }
    storageFiles = data || []
  }

  const validFiles = files.map((f) => {
    const fileId = f.id || uuidv4()
    const expectedName = `${fileId}_${f.filename}`
    
    let finalSize = f.size
    
    if (options.transferId) {
      const storageFile = storageFiles.find(sf => sf.name === expectedName)
      if (!storageFile) {
        throw new Error(`ERR_FILE_NOT_UPLOADED:${f.filename}`)
      }
      finalSize = storageFile.metadata?.size || 0
    }

    return {
      ...f,
      id: fileId,
      size: finalSize,
      storagePath: f.storagePath || `transfers/${transferId}/${expectedName}`,
    }
  })

  const totalSize = validFiles.reduce((acc, f) => acc + (f.size || 0), 0)

  let passwordHash: string | null = null
  if (password?.trim()) {
    passwordHash = await bcrypt.hash(password.trim(), 12)
  }

  const { error: transferError } = await supabase.from('transfers').insert({
    id: transferId,
    token: transferId,
    expires_at: expiresAt,
    password_hash: passwordHash,
    max_downloads: maxDownloads,
    download_count: 0,
    message: message || null,
    sender_email: senderEmail || null,
    total_size: totalSize,
    user_id: userId,
  })

  if (transferError) {
    console.error('Transfer insert error:', transferError)
    throw new Error('ERR_DATABASE')
  }

  const fileRecords = validFiles.map((f) => {
    return {
      id: f.id,
      transfer_id: transferId,
      filename: f.filename,
      size: f.size,
      mime_type: f.mimeType || 'application/octet-stream',
      storage_path: f.storagePath,
    }
  })

  const { error: filesError } = await supabase.from('transfer_files').insert(fileRecords)
  if (filesError) {
    console.error('Files insert error:', filesError)
    await supabase.from('transfers').delete().eq('id', transferId)
    throw new Error('ERR_SAVING_FILES')
  }

  if (senderEmail?.trim()) {
    try {
      await sendUploadConfirmation({
        senderEmail,
        fileCount: validFiles.length,
        totalSize,
        expiresAt,
        token: transferId,
        hasPassword: !!password?.trim(),
        locale,
      })
    } catch (emailErr) {
      console.error('Email error:', emailErr)
    }
  }

  return {
    transferId,
    expiresAt,
  }
}

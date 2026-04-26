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
  
  // NOTE: In Task 3, we will validate the file size via Supabase storage.
  // For now, we trust the client's sizes to complete Task 2.
  const totalSize = files.reduce((acc, f) => acc + (f.size || 0), 0)

  let passwordHash: string | null = null
  if (password?.trim()) {
    passwordHash = await bcrypt.hash(password.trim(), 12)
  }

  const supabase = supabaseAdmin()

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

  const fileRecords = files.map((f) => {
    const fileId = f.id || uuidv4()
    return {
      id: fileId,
      transfer_id: transferId,
      filename: f.filename,
      size: f.size,
      mime_type: f.mimeType || 'application/octet-stream',
      storage_path: f.storagePath || `transfers/${transferId}/${fileId}_${f.filename}`,
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
        fileCount: files.length,
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

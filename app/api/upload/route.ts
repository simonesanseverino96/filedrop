import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { addDays } from 'date-fns'
import { supabaseAdmin } from '@/lib/supabase'
import { UploadConfig } from '@/types'
import { uploadRatelimit } from '@/lib/ratelimit'
import { sendUploadConfirmation } from '@/lib/email'
import { isBlockedFile } from '@/lib/blocklist'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'anonymous'
  const { success, limit, remaining } = await uploadRatelimit.limit(ip)

  if (!success) {
    return NextResponse.json(
      { error: 'Too many uploads. Please try again in a few minutes.' },
      { status: 429, headers: { 'X-RateLimit-Limit': limit.toString(), 'X-RateLimit-Remaining': remaining.toString() } }
    )
  }

  try {
    const { transferId, files, config, totalSize, accessToken } = await req.json() as {
      transferId: string
      files: Array<{
        id: string
        filename: string
        size: number
        mimeType: string
        storagePath: string
      }>
      config: UploadConfig
      totalSize: number
      accessToken?: string
    }

    // Leggi la lingua dell'utente dal cookie
    const locale = req.cookies.get('NEXT_LOCALE')?.value ?? 'en'

    // Recupera l'utente loggato se presente
    let userId: string | null = null
    if (accessToken) {
      const { data: { user } } = await supabaseAdmin().auth.getUser(accessToken)
      if (user) userId = user.id
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files received' }, { status: 400 })
    }

    const blockedFile = files.find((f: any) => isBlockedFile(f.filename))
    if (blockedFile) {
      return NextResponse.json({ error: `File not allowed: ${blockedFile.filename}` }, { status: 400 })
    }

    const supabase = supabaseAdmin()
    const expiresAt = addDays(new Date(), parseInt(config.expiry)).toISOString()

    let passwordHash: string | null = null
    if (config.password?.trim()) {
      passwordHash = await bcrypt.hash(config.password, 12)
    }

    const { error: transferError } = await supabase.from('transfers').insert({
      id: transferId,
      token: transferId,
      expires_at: expiresAt,
      password_hash: passwordHash,
      max_downloads: config.maxDownloads,
      download_count: 0,
      message: config.message || null,
      sender_email: config.senderEmail || null,
      total_size: totalSize,
      user_id: userId,
    })

    if (transferError) {
      console.error('Transfer insert error:', transferError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    const fileRecords = files.map(f => ({
      id: f.id,
      transfer_id: transferId,
      filename: f.filename,
      size: f.size,
      mime_type: f.mimeType,
      storage_path: `transfers/${transferId}/${f.id}_${f.filename}`,
    }))

    const { error: filesError } = await supabase.from('transfer_files').insert(fileRecords)
    if (filesError) {
      console.error('Files insert error:', filesError)
      await supabase.from('transfers').delete().eq('id', transferId)
      return NextResponse.json({ error: 'Error saving files' }, { status: 500 })
    }

    if (config.senderEmail?.trim()) {
      try {
        await sendUploadConfirmation({
          senderEmail: config.senderEmail,
          fileCount: files.length,
          totalSize,
          expiresAt,
          token: transferId,
          hasPassword: !!config.password?.trim(),
          locale, // ← passa la lingua
        })
      } catch (emailErr) {
        console.error('Email error:', emailErr)
      }
    }

    return NextResponse.json({ token: transferId, expiresAt }, { status: 201 })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabase'
import { sendDownloadNotification } from '@/lib/email'
import { downloadRatelimit } from '@/lib/ratelimit'

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'anonymous'
  const { success, limit, remaining } = await downloadRatelimit.limit(ip)

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'X-RateLimit-Limit': limit.toString(), 'X-RateLimit-Remaining': remaining.toString() } }
    )
  }

  try {
    const { token } = await params
    const body = await req.json()
    const { password, fileId } = body

    // Leggi la lingua dell'utente dal cookie
    const locale = req.cookies.get('NEXT_LOCALE')?.value ?? 'en'

    const supabase = supabaseAdmin()

    const { data: transfer, error } = await supabase
      .from('transfers')
      .select('*, transfer_files(*)')
      .eq('token', token)
      .single()

    if (error || !transfer) {
      return NextResponse.json({ error: 'Transfer not found' }, { status: 404 })
    }

    if (new Date(transfer.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Transfer expired' }, { status: 410 })
    }

    if (transfer.max_downloads !== null && transfer.download_count >= transfer.max_downloads) {
      return NextResponse.json({ error: 'Download limit reached' }, { status: 410 })
    }

    if (transfer.password_hash) {
      if (!password) {
        return NextResponse.json({ error: 'Password required', requiresPassword: true }, { status: 401 })
      }
      const valid = await bcrypt.compare(password, transfer.password_hash)
      if (!valid) {
        return NextResponse.json({ error: 'Wrong password', requiresPassword: true }, { status: 401 })
      }
    }

    const file = transfer.transfer_files.find((f: any) => f.id === fileId)
    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    const { data: signed, error: signError } = await supabase.storage
      .from('filedrop')
      .createSignedUrl(file.storage_path, 60)

    if (signError || !signed) {
      console.error('Signed URL error:', signError)
      return NextResponse.json({ error: 'Error generating download link' }, { status: 500 })
    }

    if (fileId === transfer.transfer_files[0]?.id) {
      const newCount = transfer.download_count + 1
      await supabase
        .from('transfers')
        .update({ download_count: newCount })
        .eq('id', transfer.id)

      if (transfer.sender_email) {
        try {
          await sendDownloadNotification({
            senderEmail: transfer.sender_email,
            filename: transfer.transfer_files.length === 1
              ? transfer.transfer_files[0].filename
              : `${transfer.transfer_files.length} files`,
            downloadCount: newCount,
            maxDownloads: transfer.max_downloads,
            token: transfer.token,
            locale, // ← passa la lingua
          })
        } catch (emailErr) {
          console.error('Email notification error:', emailErr)
        }
      }
    }

    return NextResponse.json({ url: signed.signedUrl, filename: file.filename })
  } catch (err) {
    console.error('Download error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
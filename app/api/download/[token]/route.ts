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
      { error: 'ERR_TOO_MANY_REQUESTS' },
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
      return NextResponse.json({ error: 'ERR_TRANSFER_NOT_FOUND' }, { status: 404 })
    }

    if (new Date(transfer.expires_at) < new Date()) {
      return NextResponse.json({ error: 'ERR_TRANSFER_EXPIRED' }, { status: 410 })
    }

    if (transfer.max_downloads !== null && transfer.download_count >= transfer.max_downloads) {
      return NextResponse.json({ error: 'ERR_DOWNLOAD_LIMIT' }, { status: 410 })
    }

    if (transfer.password_hash) {
      if (!password) {
        return NextResponse.json({ error: 'ERR_PASSWORD_REQUIRED', requiresPassword: true }, { status: 401 })
      }
      const valid = await bcrypt.compare(password, transfer.password_hash)
      if (!valid) {
        return NextResponse.json({ error: 'ERR_WRONG_PASSWORD', requiresPassword: true }, { status: 401 })
      }
    }

    const file = transfer.transfer_files.find((f: any) => f.id === fileId)
    if (!file) {
      return NextResponse.json({ error: 'ERR_FILE_NOT_FOUND' }, { status: 404 })
    }

    if (transfer.user_id) {
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { data: userTransfers, error: userTransfersError } = await supabase
        .from('transfers')
        .select('total_size, download_count')
        .eq('user_id', transfer.user_id)
        .gte('created_at', startOfMonth.toISOString())

      if (!userTransfersError && userTransfers) {
        const totalEgress = userTransfers.reduce((acc: number, t: any) => acc + ((t.total_size || 0) * (t.download_count || 0)), 0)
        const MAX_MONTHLY_EGRESS = 2.5 * 1024 * 1024 * 1024 // 2.5 GB

        if (totalEgress + file.size > MAX_MONTHLY_EGRESS) {
          return NextResponse.json({ error: 'Download blocked. The monthly egress limit of 2.5 GB has been reached.' }, { status: 403 })
        }
      }
    }

    const { data: signed, error: signError } = await supabase.storage
      .from('filedrop')
      .createSignedUrl(file.storage_path, 60)

    if (signError || !signed) {
      console.error('Signed URL error:', signError)
      return NextResponse.json({ error: 'ERR_GENERATING_LINK' }, { status: 500 })
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
    return NextResponse.json({ error: 'ERR_INTERNAL' }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { UploadConfig } from '@/types'
import { uploadRatelimit } from '@/lib/ratelimit'
import { finalizeTransfer } from '@/lib/transfers'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'anonymous'
  const { success, limit, remaining } = await uploadRatelimit.limit(ip)

  if (!success) {
    return NextResponse.json(
      { error: 'ERR_TOO_MANY_REQUESTS' },
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

    const locale = req.cookies.get('NEXT_LOCALE')?.value ?? 'en'

    let userId: string | null = null
    if (accessToken) {
      const { data: { user } } = await supabaseAdmin().auth.getUser(accessToken)
      if (user) userId = user.id
    }

    const { expiresAt } = await finalizeTransfer({
      transferId,
      files,
      expiry: config.expiry,
      password: config.password,
      message: config.message,
      senderEmail: config.senderEmail,
      maxDownloads: config.maxDownloads,
      userId,
      locale,
    })

    return NextResponse.json({ token: transferId, expiresAt }, { status: 201 })
  } catch (err: any) {
    console.error('Upload error:', err)
    
    if (err.message === 'ERR_MISSING_FILES') {
      return NextResponse.json({ error: 'ERR_NO_FILES_PROVIDED' }, { status: 400 })
    }
    if (err.message.startsWith('ERR_FILE_NOT_ALLOWED')) {
      const filename = err.message.split(':')[1]
      return NextResponse.json({ error: 'ERR_FILE_NOT_ALLOWED', filename }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'ERR_INTERNAL' }, { status: 500 })
  }
}
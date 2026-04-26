import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { supabaseAdmin } from '@/lib/supabase'
import { uploadRatelimit } from '@/lib/ratelimit'
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
    const { files } = await req.json() as {
      files: Array<{ filename: string, size: number, mimeType: string }>
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    const blockedFile = files.find((f: any) => isBlockedFile(f.filename))
    if (blockedFile) {
      return NextResponse.json({ error: `File not allowed: ${blockedFile.filename}` }, { status: 400 })
    }

    const transferId = uuidv4()
    const supabase = supabaseAdmin()

    const signedFiles = await Promise.all(
      files.map(async (file) => {
        const fileId = uuidv4()
        const storagePath = `transfers/${transferId}/${fileId}_${file.filename}`
        
        const { data, error } = await supabase.storage
          .from('filedrop')
          .createSignedUploadUrl(storagePath)

        if (error || !data) {
          throw new Error(`Failed to create signed URL for ${file.filename}`)
        }

        return {
          clientFileId: (file as any).clientFileId, // Per fare match sul client
          id: fileId,
          filename: file.filename,
          size: file.size,
          mimeType: file.mimeType,
          storagePath,
          signedUrl: data.signedUrl
        }
      })
    )

    return NextResponse.json({ transferId, files: signedFiles }, { status: 200 })
  } catch (err: any) {
    console.error('Init upload error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}

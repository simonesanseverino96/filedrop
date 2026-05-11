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
      { error: 'ERR_TOO_MANY_REQUESTS' },
      { status: 429, headers: { 'X-RateLimit-Limit': limit.toString(), 'X-RateLimit-Remaining': remaining.toString() } }
    )
  }

  try {
    const { files } = await req.json() as {
      files: Array<{ filename: string, size: number, mimeType: string }>
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'ERR_NO_FILES_PROVIDED' }, { status: 400 })
    }

    const totalSize = files.reduce((acc, file) => acc + file.size, 0)
    const MAX_UPLOAD_SIZE = 12.5 * 1024 * 1024 // 12.5 MB

    if (totalSize > MAX_UPLOAD_SIZE) {
      return NextResponse.json({ error: 'Upload exceeds the maximum allowed size of 12.5 MB.' }, { status: 400 })
    }

    const blockedFile = files.find((f: any) => isBlockedFile(f.filename))
    if (blockedFile) {
      return NextResponse.json({ error: 'ERR_FILE_NOT_ALLOWED', filename: blockedFile.filename }, { status: 400 })
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

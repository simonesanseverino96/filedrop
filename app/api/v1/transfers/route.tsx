import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

async function verifyApiKey(req: NextRequest) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer vt_live_')) return null

  const rawKey = authHeader.replace('Bearer ', '')
  const supabase = supabaseAdmin()

  const { data: keys } = await supabase
    .from('api_keys')
    .select('id, user_id, key_hash')
    .eq('is_active', true)

  for (const key of keys || []) {
    const match = await bcrypt.compare(rawKey, key.key_hash)
    if (match) {
      await supabase.from('api_keys').update({ last_used_at: new Date().toISOString() }).eq('id', key.id)
      return key.user_id
    }
  }
  return null
}

// GET /api/v1/transfers — lista trasferimenti dell'utente
export async function GET(req: NextRequest) {
  const userId = await verifyApiKey(req)
  if (!userId) {
    return NextResponse.json({ error: 'API key non valida o mancante' }, { status: 401 })
  }

  const supabase = supabaseAdmin()
  const { searchParams } = new URL(req.url)
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
  const page = parseInt(searchParams.get('page') || '1')
  const offset = (page - 1) * limit

  const { data: transfers } = await supabase
    .from('transfers')
    .select('*, transfer_files(id, filename, size, mime_type)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vaultransfer.com'

  return NextResponse.json({
    transfers: (transfers || []).map(t => ({
      token: t.token,
      downloadUrl: `${appUrl}/download/${t.token}`,
      expiresAt: t.expires_at,
      downloadCount: t.download_count,
      maxDownloads: t.max_downloads,
      totalSize: t.total_size,
      hasPassword: !!t.password_hash,
      files: t.transfer_files?.map((f: any) => ({
        filename: f.filename,
        size: f.size,
        mimeType: f.mime_type,
      })),
    })),
    page,
    limit,
  })
}
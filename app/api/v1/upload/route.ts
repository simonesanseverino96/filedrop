import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { finalizeTransfer } from '@/lib/transfers'

async function verifyApiKey(req: NextRequest) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer vt_live_')) return null

  const rawKey = authHeader.replace('Bearer vt_live_', '')
  const parts = rawKey.split('_')
  
  // Retrocompatibilità: se non c'è il formato nuovo, logica fallback o skip.
  // Siccome chiedi di implementare il formato sicuro per mitigare il DoS,
  // accettiamo solo il nuovo formato: vt_live_<id>_<secret>
  if (parts.length !== 2) return null
  
  const [keyId, secret] = parts
  const supabase = supabaseAdmin()

  const { data: key } = await supabase
    .from('api_keys')
    .select('id, user_id, key_hash')
    .eq('id', keyId)
    .eq('is_active', true)
    .single()

  if (!key) return null

  const match = await bcrypt.compare(secret, key.key_hash)
  if (match) {
    await supabase.from('api_keys').update({ last_used_at: new Date().toISOString() }).eq('id', key.id)
    return key.user_id
  }
  
  return null
}

// POST /api/v1/upload — crea un transfer con file già caricati su Storage
export async function POST(req: NextRequest) {
  const userId = await verifyApiKey(req)
  if (!userId) {
    return NextResponse.json({ error: 'ERR_UNAUTHORIZED' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { files, expiry = '7', maxDownloads, password, message } = body

    const locale = req.cookies.get('NEXT_LOCALE')?.value ?? 'en'

    const { transferId, expiresAt } = await finalizeTransfer({
      files,
      expiry,
      password,
      message,
      maxDownloads,
      userId,
      locale,
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vaultransfer.com'

    return NextResponse.json({
      token: transferId,
      downloadUrl: `${appUrl}/download/${transferId}`,
      expiresAt,
    }, { status: 201 })
  } catch (err: any) {
    if (err.message === 'ERR_MISSING_FILES') {
      return NextResponse.json({ error: 'ERR_MISSING_FILES' }, { status: 400 })
    }
    if (err.message.startsWith('ERR_FILE_NOT_ALLOWED')) {
      const filename = err.message.split(':')[1]
      return NextResponse.json({ error: 'ERR_FILE_NOT_ALLOWED', filename }, { status: 400 })
    }
    return NextResponse.json({ error: 'ERR_INTERNAL' }, { status: 500 })
  }
}
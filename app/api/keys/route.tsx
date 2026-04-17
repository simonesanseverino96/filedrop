import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

async function getUserFromRequest(req: NextRequest) {
  // Prova prima dall'header Authorization
  const authHeader = req.headers.get('Authorization')
  if (authHeader?.startsWith('Bearer ') && !authHeader.includes('vt_live_')) {
    const token = authHeader.replace('Bearer ', '')
    const supabase = supabaseAdmin()
    const { data: { user } } = await supabase.auth.getUser(token)
    return user
  }
  return null
}

// GET — lista API keys
export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })

  const supabase = supabaseAdmin()
  const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
  if (profile?.plan !== 'business') {
    return NextResponse.json({ error: 'Solo piano Business' }, { status: 403 })
  }

  const { data: keys } = await supabase
    .from('api_keys')
    .select('id, name, key_prefix, created_at, last_used_at, is_active')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  return NextResponse.json({ keys: keys || [] })
}

// POST — crea API key
export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })

  const supabase = supabaseAdmin()
  const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
  if (profile?.plan !== 'business') {
    return NextResponse.json({ error: 'Solo piano Business' }, { status: 403 })
  }

  const { name } = await req.json()
  const rawKey = `vt_live_${uuidv4().replace(/-/g, '')}`
  const keyHash = await bcrypt.hash(rawKey, 10)
  const keyPrefix = rawKey.substring(0, 16) + '...'

  const { error } = await supabase.from('api_keys').insert({
    user_id: user.id,
    name: name || 'Default',
    key_hash: keyHash,
    key_prefix: keyPrefix,
  })

  if (error) return NextResponse.json({ error: 'Errore creazione' }, { status: 500 })
  return NextResponse.json({ key: rawKey, prefix: keyPrefix }, { status: 201 })
}

// DELETE — revoca API key
export async function DELETE(req: NextRequest) {
  const { id, accessToken } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID mancante' }, { status: 400 })

  const supabase = supabaseAdmin()
  const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
  if (authError || !user) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })

  const { error } = await supabase
    .from('api_keys')
    .update({ is_active: false })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: 'Errore revoca' }, { status: 500 })
  return NextResponse.json({ success: true })
}
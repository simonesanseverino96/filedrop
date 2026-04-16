import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

async function getUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// GET — lista API keys dell'utente
export async function GET() {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })

  const supabase = supabaseAdmin()

  // Verifica piano Business
  const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
  if (profile?.plan !== 'business') {
    return NextResponse.json({ error: 'API access disponibile solo nel piano Business' }, { status: 403 })
  }

  const { data: keys } = await supabase
    .from('api_keys')
    .select('id, name, key_prefix, created_at, last_used_at, is_active')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return NextResponse.json({ keys: keys || [] })
}

// POST — crea nuova API key
export async function POST(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })

  const supabase = supabaseAdmin()

  // Verifica piano Business
  const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
  if (profile?.plan !== 'business') {
    return NextResponse.json({ error: 'API access disponibile solo nel piano Business' }, { status: 403 })
  }

  const { name } = await req.json()

  // Genera API key: vt_live_XXXXXXXXXXXXXXXXXXXX
  const rawKey = `vt_live_${uuidv4().replace(/-/g, '')}`
  const keyHash = await bcrypt.hash(rawKey, 10)
  const keyPrefix = rawKey.substring(0, 16) + '...'

  const { error } = await supabase.from('api_keys').insert({
    user_id: user.id,
    name: name || 'Default',
    key_hash: keyHash,
    key_prefix: keyPrefix,
  })

  if (error) return NextResponse.json({ error: 'Errore creazione API key' }, { status: 500 })

  // Restituisce la key completa SOLO questa volta
  return NextResponse.json({ key: rawKey, prefix: keyPrefix }, { status: 201 })
}

// DELETE — revoca API key
export async function DELETE(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })

  const { id } = await req.json()
  const supabase = supabaseAdmin()

  await supabase.from('api_keys').update({ is_active: false }).eq('id', id).eq('user_id', user.id)

  return NextResponse.json({ success: true })
}
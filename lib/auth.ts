import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseAdmin } from './supabase'
import { PlanType } from './plans'

export async function getServerSession() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
            cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getUserPlan(userId: string): Promise<PlanType> {
  const supabase = supabaseAdmin()
  const { data } = await supabase
    .from('profiles')
    .select('plan, subscription_status, subscription_ends_at')
    .eq('id', userId)
    .single()

  if (!data) return 'free'

  // Verifica che l'abbonamento sia attivo
  if (data.plan !== 'free') {
    if (data.subscription_status === 'active') return data.plan as PlanType
    if (data.subscription_ends_at && new Date(data.subscription_ends_at) > new Date()) {
      return data.plan as PlanType
    }
    // Abbonamento scaduto → downgrade a free
    await supabase.from('profiles').update({ plan: 'free' }).eq('id', userId)
    return 'free'
  }

  return 'free'
}

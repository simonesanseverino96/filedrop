import { createClient } from '@supabase/supabase-js'
import { createBrowserClient as _createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase (limited permissions via RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Singleton browser client — evita multiple istanze GoTrueClient
let browserClientInstance: ReturnType<typeof _createBrowserClient> | null = null

export function getBrowserClient() {
  if (!browserClientInstance) {
    browserClientInstance = _createBrowserClient(supabaseUrl, supabaseAnonKey)
  }
  return browserClientInstance
}

// Server-side Supabase (full permissions, server only)
export const supabaseAdmin = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY not set')
  return createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
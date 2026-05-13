import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase'
import DashboardClient from './DashboardClient'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
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
  if (!user) {
    redirect('/login')
  }

  const admin = supabaseAdmin()
  const { data: transfers } = await admin
    .from('transfers')
    .select('total_size, download_count')
    .eq('user_id', user.id)

  let totalFiles = 0
  let totalSize = 0
  let totalDownloads = 0

  if (transfers) {
    totalFiles = transfers.length
    for (const t of transfers) {
      totalSize += t.total_size || 0
      totalDownloads += t.download_count || 0
    }
  }

  const serverStats = {
    totalFiles,
    totalSize,
    totalDownloads
  }

  return <DashboardClient serverStats={serverStats} />
}

'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { formatBytes, formatExpiry } from '@/lib/utils'
import { PLANS, PlanType } from '@/lib/plans'
import ApiKeysSection from '@/components/ApiKeysSection'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Profile {
  email: string
  plan: PlanType
  subscription_status: string
  subscription_ends_at: string | null
}

interface Transfer {
  id: string
  token: string
  created_at: string
  expires_at: string
  download_count: number
  max_downloads: number | null
  total_size: number
  message: string | null
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/login'; return }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    const { data: transfersData } = await supabase
      .from('transfers')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    setProfile(profileData)
    setTransfers(transfersData || [])
    setLoading(false)
  }

  const handleCheckout = async (plan: string) => {
    setCheckoutLoading(plan)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { window.location.href = '/login'; return }

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, accessToken: session.access_token }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert(data.error || 'Errore nel checkout')
    } catch {
      alert('Errore di connessione')
    } finally {
      setCheckoutLoading(null)
    }
  }

  const handleManageSubscription = async () => {
    const res = await fetch('/api/stripe/portal', { method: 'POST' })
    const data = await res.json()
    if (data.url) window.location.href = data.url
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
      </div>
    )
  }

  const plan = profile?.plan || 'free'
  const planConfig = PLANS[plan]

  return (
    <main className="min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* Piano attuale */}
        <div className="bg-surface border border-white/5 rounded-2xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted uppercase tracking-widest font-body mb-1">Piano attuale</p>
              <div className="flex items-center gap-3">
                <h2 className="font-display text-2xl font-700 text-paper">{planConfig.name}</h2>
                <span className={`px-2 py-0.5 rounded-full text-xs font-body ${
                  plan === 'free' ? 'bg-white/10 text-muted' : 'bg-accent/15 text-accent'
                }`}>
                  {plan === 'free' ? 'Gratuito' : `${planConfig.price}€/mese`}
                </span>
              </div>
              <p className="text-sm text-muted font-body mt-1">{profile?.email}</p>
            </div>
            <div className="flex gap-2">
              {plan === 'free' ? (
                <button
                  onClick={() => handleCheckout('pro')}
                  disabled={checkoutLoading === 'pro'}
                  className="px-4 py-2 bg-accent text-ink rounded-lg text-sm font-display font-600 hover:bg-accent-dim transition-colors disabled:opacity-50"
                >
                  {checkoutLoading === 'pro' ? 'Caricamento...' : 'Passa a Pro →'}
                </button>
              ) : (
                <button
                  onClick={handleManageSubscription}
                  className="px-4 py-2 bg-surface-2 text-muted hover:text-paper border border-white/5 rounded-lg text-sm font-body transition-colors"
                >
                  Gestisci abbonamento
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/5">
            {[
              { label: 'Max upload', value: formatBytes(planConfig.maxTotalSizeMB * 1024 * 1024) },
              { label: 'Scadenza max', value: `${planConfig.maxDaysExpiry} giorni` },
              { label: 'Download max', value: planConfig.maxDownloads === null ? 'Illimitati' : String(planConfig.maxDownloads) },
              { label: 'Pubblicità', value: planConfig.hasAds ? 'Sì' : 'No' },
            ].map((item, i) => (
              <div key={i}>
                <p className="text-xs text-muted font-body mb-1">{item.label}</p>
                <p className="text-sm font-display font-600 text-paper">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Upgrade a Business se Pro */}
          {plan === 'pro' && (
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
              <p className="text-sm text-muted font-body">Vuoi più spazio e API access?</p>
              <button
                onClick={() => handleCheckout('business')}
                disabled={checkoutLoading === 'business'}
                className="px-4 py-2 bg-surface-2 text-paper hover:bg-white/10 border border-white/10 rounded-lg text-sm font-display font-600 transition-colors disabled:opacity-50"
              >
                {checkoutLoading === 'business' ? 'Caricamento...' : 'Passa a Business →'}
              </button>
            </div>
          )}
        </div>

        {/* Storico trasferimenti */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-700 text-paper">I tuoi trasferimenti</h3>
            <a href="/" className="px-4 py-2 bg-accent text-ink rounded-lg text-sm font-display font-600 hover:bg-accent-dim transition-colors">
              + Nuovo
            </a>
          </div>

          {plan === 'free' ? (
            <div className="bg-surface border border-white/5 rounded-2xl p-8 text-center">
              <p className="text-muted font-body text-sm mb-4">
                Lo storico dei trasferimenti è disponibile dal piano Pro.
              </p>
              <button
                onClick={() => handleCheckout('pro')}
                disabled={checkoutLoading === 'pro'}
                className="inline-block px-5 py-2.5 bg-accent text-ink rounded-xl text-sm font-display font-600 hover:bg-accent-dim transition-colors disabled:opacity-50"
              >
                {checkoutLoading === 'pro' ? 'Caricamento...' : 'Passa a Pro — 4.99€/mese →'}
              </button>
            </div>
          ) : transfers.length === 0 ? (
            <div className="bg-surface border border-white/5 rounded-2xl p-8 text-center">
              <p className="text-muted font-body text-sm">Nessun trasferimento ancora. Inizia a condividere!</p>
              <a href="/" className="inline-block mt-4 px-5 py-2.5 bg-accent text-ink rounded-xl text-sm font-display font-600 hover:bg-accent-dim transition-colors">
                Carica il primo file →
              </a>
            </div>
          ) : (
            <div className="space-y-2">
              {transfers.map(t => (
                <div key={t.id} className="stagger-item flex items-center gap-4 bg-surface border border-white/5 rounded-xl px-5 py-4 hover:border-accent/20 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-body text-paper truncate">
                        {t.message || `Trasferimento del ${new Date(t.created_at).toLocaleDateString('it-IT')}`}
                      </p>
                      {new Date(t.expires_at) < new Date() && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-body bg-red-500/10 text-red-400">Scaduto</span>
                      )}
                    </div>
                    <p className="text-xs text-muted font-body mt-0.5">
                      {formatBytes(t.total_size)} · {t.download_count} download · scade in {formatExpiry(t.expires_at)}
                    </p>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(`${window.location.origin}/download/${t.token}`)}
                    className="flex-shrink-0 px-3 py-1.5 bg-accent/10 hover:bg-accent text-accent hover:text-ink border border-accent/20 hover:border-accent rounded-lg text-xs font-display font-600 transition-all"
                  >
                    Copia link
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* API Keys — solo piano Business */}
        {plan === 'business' && <ApiKeysSection />}

      </div>
    </main>
  )
}
'use client'

import { useEffect, useState } from 'react'
import { getBrowserClient } from '@/lib/supabase'
import { useTranslations } from 'next-intl'
import { formatBytes, formatExpiry } from '@/lib/utils'
import { PLANS, PlanType } from '@/lib/plans'
import ApiKeysSection from '@/components/ApiKeysSection'

const supabase = getBrowserClient()

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
  const t = useTranslations('dashboard')
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

    const transfersRes = await fetch('/api/auth/transfers', { cache: 'no-store' })
    const transfersJson = await transfersRes.json()

    setProfile(profileData)
    setTransfers(transfersJson.transfers || [])
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
      else alert(data.error || 'Error during checkout')
    } catch {
      alert('Connection error')
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
              <p className="text-xs text-muted uppercase tracking-widest font-body mb-1">{t('currentPlan')}</p>
              <div className="flex items-center gap-3">
                <h2 className="font-display text-2xl font-700 text-paper">{planConfig.name}</h2>
                <span className={`px-2 py-0.5 rounded-full text-xs font-body ${
                  plan === 'free' ? 'bg-white/10 text-muted' : 'bg-accent/15 text-accent'
                }`}>
                  {plan === 'free' ? t('free') : `${planConfig.price}${t('perMonth')}`}
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
                  {checkoutLoading === 'pro' ? t('loading') : t('upgradePro')}
                </button>
              ) : (
                <button
                  onClick={handleManageSubscription}
                  className="px-4 py-2 bg-surface-2 text-muted hover:text-paper border border-white/5 rounded-lg text-sm font-body transition-colors"
                >
                  {t('manageSubscription')}
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/5">
            {[
              { label: t('maxUpload'), value: formatBytes(planConfig.maxTotalSizeMB * 1024 * 1024) },
              { label: t('maxExpiry'), value: t('days', { count: planConfig.maxDaysExpiry }) },
              { label: t('maxDownloads'), value: planConfig.maxDownloads === null ? t('unlimited') : String(planConfig.maxDownloads) },
              { label: t('ads'), value: planConfig.hasAds ? t('yes') : t('no') },
            ].map((item, i) => (
              <div key={i}>
                <p className="text-xs text-muted font-body mb-1">{item.label}</p>
                <p className="text-sm font-display font-600 text-paper">{item.value}</p>
              </div>
            ))}
          </div>

          {plan === 'pro' && (
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
              <p className="text-sm text-muted font-body">{t('wantMore')}</p>
              <button
                onClick={() => handleCheckout('business')}
                disabled={checkoutLoading === 'business'}
                className="px-4 py-2 bg-surface-2 text-paper hover:bg-white/10 border border-white/10 rounded-lg text-sm font-display font-600 transition-colors disabled:opacity-50"
              >
                {checkoutLoading === 'business' ? t('loading') : t('upgradeBusiness')}
              </button>
            </div>
          )}
        </div>

        {/* Storico trasferimenti */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-700 text-paper">{t('transfers')}</h3>
            <a href="/" className="px-4 py-2 bg-accent text-ink rounded-lg text-sm font-display font-600 hover:bg-accent-dim transition-colors">
              {t('newTransfer')}
            </a>
          </div>

          {plan === 'free' ? (
            <div className="bg-surface border border-white/5 rounded-2xl p-8 text-center">
              <p className="text-muted font-body text-sm mb-4">{t('transfersProOnly')}</p>
              <button
                onClick={() => handleCheckout('pro')}
                disabled={checkoutLoading === 'pro'}
                className="inline-block px-5 py-2.5 bg-accent text-ink rounded-xl text-sm font-display font-600 hover:bg-accent-dim transition-colors disabled:opacity-50"
              >
                {checkoutLoading === 'pro' ? t('loading') : t('upgradeProPrice')}
              </button>
            </div>
          ) : transfers.length === 0 ? (
            <div className="bg-surface border border-white/5 rounded-2xl p-8 text-center">
              <p className="text-muted font-body text-sm">{t('noTransfers')}</p>
              <a href="/" className="inline-block mt-4 px-5 py-2.5 bg-accent text-ink rounded-xl text-sm font-display font-600 hover:bg-accent-dim transition-colors">
                {t('uploadFirst')}
              </a>
            </div>
          ) : (
            <div className="space-y-2">
              {transfers.map(tr => (
                <div key={tr.id} className="stagger-item flex items-center gap-4 bg-surface border border-white/5 rounded-xl px-5 py-4 hover:border-accent/20 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-body text-paper truncate">
                        {tr.message || t('transferDate', { date: new Date(tr.created_at).toLocaleDateString() })}
                      </p>
                      {new Date(tr.expires_at) < new Date() && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-body bg-red-500/10 text-red-400">{t('expired')}</span>
                      )}
                    </div>
                    <p className="text-xs text-muted font-body mt-0.5">
                      {t('transferMeta', {
                        size: formatBytes(tr.total_size),
                        downloads: tr.download_count,
                        expiry: formatExpiry(tr.expires_at),
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(`${window.location.origin}/download/${tr.token}`)}
                    className="flex-shrink-0 px-3 py-1.5 bg-accent/10 hover:bg-accent text-accent hover:text-ink border border-accent/20 hover:border-accent rounded-lg text-xs font-display font-600 transition-all"
                  >
                    {t('copyLink')}
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
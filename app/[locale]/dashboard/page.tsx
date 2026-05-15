'use client'

import { useEffect, useState } from 'react'
import { getBrowserClient } from '@/lib/supabase'
import { useTranslations } from 'next-intl'
import { formatBytes, formatExpiry } from '@/lib/utils'
import { PLANS, PlanType } from '@/lib/plans'
import ApiKeysSection from '@/components/ApiKeysSection'
import AnalyticsSection from '@/components/dashboard/AnalyticsSection'
import SubscriptionCard from '@/components/dashboard/SubscriptionCard'
import NotificationPreferences from '@/components/dashboard/NotificationPreferences'
import ReferralSection from '@/components/dashboard/ReferralSection'
import TransferStatsModal from '@/components/dashboard/TransferStatsModal'
import { Link } from '@/i18n/routing'
import ErrorBoundary from '@/components/ErrorBoundary'
import { useToast } from '@/components/Toast'

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
  const { toast } = useToast()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [transferPage, setTransferPage] = useState(0)
  const [hasMoreTransfers, setHasMoreTransfers] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [statsTransfer, setStatsTransfer] = useState<Transfer | null>(null)

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

    const transfersRes = await fetch('/api/auth/transfers?page=0', { cache: 'no-store' })
    const transfersJson = await transfersRes.json()

    setProfile(profileData)
    setTransfers(transfersJson.transfers || [])
    setHasMoreTransfers(transfersJson.hasMore ?? false)
    setTransferPage(0)
    setLoading(false)
  }

  const loadMoreTransfers = async () => {
    setLoadingMore(true)
    try {
      const nextPage = transferPage + 1
      const res = await fetch(`/api/auth/transfers?page=${nextPage}`, { cache: 'no-store' })
      const json = await res.json()
      setTransfers(prev => [...prev, ...(json.transfers || [])])
      setHasMoreTransfers(json.hasMore ?? false)
      setTransferPage(nextPage)
    } finally {
      setLoadingMore(false)
    }
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
      else toast(data.error ? t(`errors.${data.error}`) : 'Error during checkout', 'error')
    } catch {
      toast('Connection error', 'error')
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
      <ErrorBoundary>
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">

        <SubscriptionCard
          plan={plan}
          email={profile?.email ?? ''}
          subscriptionStatus={profile?.subscription_status ?? 'free'}
          subscriptionEndsAt={profile?.subscription_ends_at ?? null}
          checkoutLoading={checkoutLoading}
          onUpgrade={handleCheckout}
          onManage={handleManageSubscription}
        />

        {/* Analytics Section */}
        <AnalyticsSection plan={plan} onUpgrade={handleCheckout} />

        {/* Storico trasferimenti */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-700 text-paper">{t('transfers')}</h3>
            <Link href="/" className="px-4 py-2 bg-accent text-ink rounded-lg text-sm font-display font-600 hover:bg-accent-dim transition-colors">
              {t('newTransfer')}
            </Link>
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
              <Link href="/" className="inline-block mt-4 px-5 py-2.5 bg-accent text-ink rounded-xl text-sm font-display font-600 hover:bg-accent-dim transition-colors">
                {t('uploadFirst')}
              </Link>
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
                    onClick={() => setStatsTransfer(tr)}
                    className="flex-shrink-0 px-3 py-1.5 bg-surface-2 hover:bg-white/10 text-muted hover:text-paper border border-white/5 rounded-lg text-xs font-body transition-all"
                    title="View analytics"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                    </svg>
                  </button>
                  <button
                    onClick={async () => {
                      await navigator.clipboard.writeText(`${window.location.origin}/download/${tr.token}`)
                      toast('Link copied!')
                    }}
                    className="flex-shrink-0 px-3 py-1.5 bg-accent/10 hover:bg-accent text-accent hover:text-ink border border-accent/20 hover:border-accent rounded-lg text-xs font-display font-600 transition-all"
                  >
                    {t('copyLink')}
                  </button>
                </div>
              ))}
              {hasMoreTransfers && (
                <div className="pt-2 text-center">
                  <button
                    onClick={loadMoreTransfers}
                    disabled={loadingMore}
                    className="px-5 py-2 bg-surface border border-white/5 hover:border-accent/20 text-muted hover:text-paper rounded-lg text-sm font-body transition-all disabled:opacity-50"
                  >
                    {loadingMore ? t('loading') : t('loadMore', { defaultValue: 'Load more' })}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Email notification preferences */}
        <NotificationPreferences />

        {/* Referral system */}
        <ReferralSection />

        {/* API Keys — solo piano Business */}
        {plan === 'business' && <ApiKeysSection />}

      </div>
      </ErrorBoundary>

      {statsTransfer && (
        <TransferStatsModal transfer={statsTransfer} onClose={() => setStatsTransfer(null)} />
      )}
    </main>
  )
}
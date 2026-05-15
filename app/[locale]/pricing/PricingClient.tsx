'use client'

import { useState } from 'react'
import { useRouter, Link } from '@/i18n/routing'
import { getBrowserClient } from '@/lib/supabase'
import { useTranslations } from 'next-intl'

const COMPARISON_ROWS = [
  { label: 'Max upload size',         free: '2 GB',       pro: '50 GB',      business: '200 GB' },
  { label: 'Link expiry',             free: '7 days',     pro: '30 days',    business: 'No limit' },
  { label: 'Max downloads per link',  free: 'Unlimited',  pro: 'Unlimited',  business: 'Unlimited' },
  { label: 'Ads',                     free: true,         pro: false,        business: false },
  { label: 'Password-protected links',free: false,        pro: false,        business: true },
  { label: 'Download statistics',     free: false,        pro: true,         business: true },
  { label: 'Custom expiry dates',     free: false,        pro: true,         business: true },
  { label: 'Priority support',        free: false,        pro: false,        business: true },
  { label: 'Public API access',       free: false,        pro: false,        business: true },
  { label: 'API key management',      free: false,        pro: false,        business: true },
]

const FAQS = [
  {
    q: 'Can I cancel my subscription at any time?',
    a: 'Yes — cancel any time from your dashboard. You keep access until the end of the current billing period, with no penalties.',
  },
  {
    q: 'What happens to my files after they expire?',
    a: 'Expired transfers and their files are automatically deleted from our servers. Make sure your recipients download before the expiry date.',
  },
  {
    q: 'Is there a free trial for paid plans?',
    a: 'We offer a 30-day money-back guarantee on all paid plans. If you\'re not satisfied, contact support for a full refund.',
  },
  {
    q: 'How is the 2 GB limit calculated on the free plan?',
    a: 'The 2 GB limit applies per transfer, not per account. You can create multiple transfers as a free user.',
  },
  {
    q: 'Can I use VaultTransfer for commercial purposes?',
    a: 'Absolutely. All plans, including free, allow commercial use. The Business plan adds API access and higher limits for professional workflows.',
  },
  {
    q: 'Are my files encrypted?',
    a: 'All transfers are sent over HTTPS (TLS). Files are stored encrypted at rest on Supabase-managed infrastructure. Password-protected links add an extra layer for the download step.',
  },
]

function ComparisonTable() {
  const Check = () => (
    <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-violet-400 mx-auto" aria-label="Yes">
      <path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
  const Cross = () => (
    <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-white/15 mx-auto" aria-label="No">
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )

  const Cell = ({ val }: { val: string | boolean }) =>
    typeof val === 'boolean' ? (val ? <Check /> : <Cross />) : (
      <span className="text-sm text-white/70">{val}</span>
    )

  return (
    <div className="overflow-x-auto mb-16">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left py-3 pr-4 text-xs text-white/30 font-body uppercase tracking-widest w-1/2">Feature</th>
            <th className="text-center py-3 px-4 text-sm text-white/50 font-body w-[16.6%]">Free</th>
            <th className="text-center py-3 px-4 text-sm text-violet-400 font-body w-[16.6%]">Pro</th>
            <th className="text-center py-3 px-4 text-sm text-amber-400 font-body w-[16.6%]">Business</th>
          </tr>
        </thead>
        <tbody>
          {COMPARISON_ROWS.map((row, i) => (
            <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
              <td className="py-3 pr-4 text-sm text-white/60 font-body">{row.label}</td>
              <td className="py-3 px-4 text-center"><Cell val={row.free} /></td>
              <td className="py-3 px-4 text-center"><Cell val={row.pro} /></td>
              <td className="py-3 px-4 text-center"><Cell val={row.business} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div className="max-w-2xl mx-auto mb-16">
      <h2 className="text-2xl font-bold tracking-tight text-center mb-8">Frequently asked questions</h2>
      <div className="space-y-2">
        {FAQS.map((faq, i) => (
          <div key={i} className="border border-white/10 rounded-xl overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left text-sm text-white/80 hover:text-white transition-colors font-body"
              aria-expanded={open === i}
            >
              <span>{faq.q}</span>
              <svg
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className={`flex-shrink-0 ml-4 transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`}
                aria-hidden="true"
              >
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            {open === i && (
              <div className="px-5 pb-4 text-sm text-white/40 font-body leading-relaxed border-t border-white/5">
                <p className="pt-3">{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function PricingClient() {
  const supabase = getBrowserClient()
  const t = useTranslations('pricing')
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isAnnual, setIsAnnual] = useState(false)

  const annualTotals: Record<number, number> = {
    4.99: 45,
    14.99: 120,
  }

  const getDisplayPrice = (monthlyPrice: number) => {
    if (monthlyPrice === 0) return '0'
    if (isAnnual) return (annualTotals[monthlyPrice] / 12).toFixed(2)
    return monthlyPrice.toFixed(2)
  }

  const getAnnualTotal = (monthlyPrice: number) => {
    return annualTotals[monthlyPrice]?.toFixed(2) ?? '0'
  }

  const plans = [
    {
      key: 'free',
      name: t('plans.free.name'),
      monthlyPrice: 0,
      color: 'from-white/5 to-white/[0.02]',
      border: 'border-white/10',
      badge: null,
      features: [
        { text: t('features.upload2gb'), included: true },
        { text: t('features.link7days'), included: true },
        { text: t('features.ads'), included: true },
        { text: t('features.unlimitedDownloads'), included: true },
        { text: t('features.customLinks'), included: false },
        { text: t('features.downloadStats'), included: false },
        { text: t('features.passwordLinks'), included: false },
        { text: t('features.prioritySupport'), included: false },
      ],
      cta: t('plans.free.cta'),
      priceId: null,
      annualPriceId: null,
    },
    {
      key: 'pro',
      name: t('plans.pro.name'),
      monthlyPrice: 4.99,
      color: 'from-violet-900/30 to-indigo-900/20',
      border: 'border-violet-500/30',
      badge: t('plans.pro.badge'),
      features: [
        { text: t('features.upload50gb'), included: true },
        { text: t('features.link30days'), included: true },
        { text: t('features.noAds'), included: true },
        { text: t('features.unlimitedDownloads'), included: true },
        { text: t('features.customLinks'), included: true },
        { text: t('features.downloadStats'), included: true },
        { text: t('features.passwordLinks'), included: false },
        { text: t('features.prioritySupport'), included: false },
      ],
      cta: t('plans.pro.cta'),
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
      annualPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL,
    },
    {
      key: 'business',
      name: t('plans.business.name'),
      monthlyPrice: 14.99,
      color: 'from-amber-900/20 to-orange-900/10',
      border: 'border-amber-500/20',
      badge: null,
      features: [
        { text: t('features.upload200gb'), included: true },
        { text: t('features.linkNoExpiry'), included: true },
        { text: t('features.noAds'), included: true },
        { text: t('features.unlimitedDownloads'), included: true },
        { text: t('features.customLinks'), included: true },
        { text: t('features.downloadStats'), included: true },
        { text: t('features.passwordLinks'), included: true },
        { text: t('features.prioritySupport'), included: true },
      ],
      cta: t('plans.business.cta'),
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS,
      annualPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS_ANNUAL,
    },
  ]

  const handleUpgrade = async (plan: typeof plans[0]) => {
    if (!plan.priceId && !plan.annualPriceId) {
      router.push('/login')
      return
    }
    setLoading(plan.key)
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      const priceId = isAnnual ? plan.annualPriceId : plan.priceId
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, userId: session.user.id, accessToken: session.access_token }),
      })
      const data = await response.json()
      if (data.url) window.location.href = data.url
      else setError(data.error ? t(`errors.${data.error}`) : t('error'))
    } catch {
      setError(t('error'))
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] dark:bg-[#0a0a0f] text-white flex flex-col">
      <main className="flex-1 max-w-5xl mx-auto px-6 py-20 w-full">

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs text-white/50 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
            {t('badge')}
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">{t('title')}</h1>
          <p className="text-white/40 dark:text-white/40 text-lg max-w-md mx-auto">{t('subtitle')}</p>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 mb-12">
          <div className="flex items-center gap-4">
            <span className={`text-sm transition-colors ${!isAnnual ? 'text-white' : 'text-white/40'}`}>
              {t('monthly')}
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative w-12 h-6 rounded-full transition-colors ${isAnnual ? 'bg-violet-600' : 'bg-white/10'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${isAnnual ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
            <span className={`text-sm transition-colors ${isAnnual ? 'text-white' : 'text-white/40'}`}>
              {t('annual')}
            </span>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-opacity ${isAnnual ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20 opacity-100' : 'opacity-0 pointer-events-none bg-emerald-500/20 text-emerald-400 border-emerald-500/20'}`}>
            {t('saveBadge', { amount: (14.99 * 12 - 120).toFixed(0) })}
          </span>
        </div>

        {error && (
          <div className="mb-8 text-center text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.key}
              className={`relative bg-gradient-to-b ${plan.color} border ${plan.border} rounded-2xl p-6 flex flex-col ${plan.badge ? 'ring-1 ring-violet-500/30' : ''}`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-violet-600 text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-base font-semibold text-white/80 mb-4">{plan.name}</h3>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-bold tracking-tight">
                    {plan.monthlyPrice === 0 ? t('free') : `€${getDisplayPrice(plan.monthlyPrice)}`}
                  </span>
                  {plan.monthlyPrice > 0 && (
                    <span className="text-white/30 text-sm mb-1.5">{t('perMonth')}</span>
                  )}
                </div>
                {plan.monthlyPrice > 0 && isAnnual && (
                  <p className="text-xs text-white/30 mt-1">
                    {t('billedAnnually', { amount: getAnnualTotal(plan.monthlyPrice) })}
                  </p>
                )}
                {plan.monthlyPrice > 0 && !isAnnual && (
                  <p className="text-xs text-emerald-400/70 mt-1">
                    {t('saveWithAnnual', { amount: (plan.monthlyPrice * 12 - (annualTotals[plan.monthlyPrice] ?? 0)).toFixed(2) })}
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    {f.included ? (
                      <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5">
                        <path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-white/15 flex-shrink-0 mt-0.5">
                        <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    )}
                    <span className={`text-sm ${f.included ? 'text-white/70' : 'text-white/20'}`}>{f.text}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(plan)}
                disabled={loading === plan.key}
                className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all ${
                  plan.key === 'pro'
                    ? 'bg-violet-600 hover:bg-violet-500 text-white'
                    : plan.key === 'business'
                    ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/20'
                    : 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/10'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading === plan.key ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25"/>
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                    {t('loading')}
                  </span>
                ) : plan.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-center mb-8">Compare plans</h2>
          <ComparisonTable />
        </div>

        <FaqAccordion />

        <div className="text-center text-white/30 text-sm flex items-center justify-center gap-6 flex-wrap">
          <span className="flex items-center gap-2">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-white/20">
              <path d="M8 2l1.5 3 3.5.5-2.5 2.5.5 3.5L8 10l-3 1.5.5-3.5L3 5.5l3.5-.5z" strokeLinejoin="round"/>
            </svg>
            {t('trust.refund')}
          </span>
          <span className="flex items-center gap-2">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-white/20">
              <rect x="2" y="5" width="12" height="9" rx="1.5" strokeLinejoin="round"/>
              <path d="M5 5V3.5a3 3 0 0 1 6 0V5" strokeLinecap="round"/>
            </svg>
            {t('trust.stripe')}
          </span>
          <span className="flex items-center gap-2">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-white/20">
              <circle cx="8" cy="8" r="6"/>
              <path d="M8 5v3.5l2 1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {t('trust.cancel')}
          </span>
          <Link href="/faq" className="hover:text-white/60 transition-colors underline underline-offset-2">
            {t('trust.faq')}
          </Link>
        </div>
      </main>
    </div>
  )
}

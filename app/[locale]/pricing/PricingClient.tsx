'use client'

import { useState } from 'react'
import { useRouter, Link } from '@/i18n/routing'
import { getBrowserClient } from '@/lib/supabase'
import { useTranslations } from 'next-intl'

// ─── Sub-components ──────────────────────────────────────────────────────────

function Check({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={`w-4 h-4 ${className}`} aria-hidden="true">
      <path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function Cross() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-white/15 mx-auto" aria-hidden="true">
      <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

type CellVal = string | boolean
function TableCell({ val }: { val: CellVal }) {
  if (val === true)  return <Check className="text-accent mx-auto" />
  if (val === false) return <Cross />
  return <span className="text-sm text-white/70 font-body">{val}</span>
}

type ComparisonSection = {
  title: string
  rows: Array<{ label: string; free: CellVal; pro: CellVal; business: CellVal; enterprise: CellVal }>
}

function ComparisonTable({ sections, colHeaders }: {
  sections: ComparisonSection[]
  colHeaders: [string, string, string, string]
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse min-w-[600px]">
        <thead className="sticky top-0 z-10 bg-[#0a0a0f]">
          <tr>
            <th className="text-left py-4 pr-6 text-xs text-white/30 font-body uppercase tracking-widest w-[40%]" />
            {colHeaders.map((col, i) => (
              <th key={col} className={`py-4 px-3 text-center text-sm font-display font-600 w-[15%] ${
                i === 1 ? 'text-violet-400' : i === 2 ? 'text-accent' : i === 3 ? 'text-amber-400' : 'text-white/40'
              }`}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sections.map((section) => (
            <>
              <tr key={section.title}>
                <td colSpan={5} className="pt-6 pb-2">
                  <span className="text-xs text-white/30 font-body uppercase tracking-widest">{section.title}</span>
                </td>
              </tr>
              {section.rows.map((row, ri) => (
                <tr key={ri} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 pr-6 text-sm text-white/60 font-body">{row.label}</td>
                  <td className="py-3 px-3 text-center"><TableCell val={row.free} /></td>
                  <td className="py-3 px-3 text-center bg-violet-500/[0.04]"><TableCell val={row.pro} /></td>
                  <td className="py-3 px-3 text-center"><TableCell val={row.business} /></td>
                  <td className="py-3 px-3 text-center"><TableCell val={row.enterprise} /></td>
                </tr>
              ))}
            </>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function PricingClient() {
  const supabase = getBrowserClient()
  const t = useTranslations('pricing')
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isAnnual, setIsAnnual] = useState(false)

  const annualTotals: Record<number, number> = { 4.99: 45, 14.99: 120 }

  const getDisplayPrice = (monthly: number) => {
    if (monthly === 0) return '0'
    if (isAnnual) return (annualTotals[monthly] / 12).toFixed(2)
    return monthly.toFixed(2)
  }

  const handleUpgrade = async (key: string, priceId?: string | null, annualPriceId?: string | null) => {
    if (key === 'enterprise') {
      window.location.href = 'mailto:enterprise@vaultransfer.com?subject=Enterprise plan inquiry'
      return
    }
    if (!priceId && !annualPriceId) {
      router.push('/login')
      return
    }
    setLoading(key)
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      const selectedPriceId = isAnnual ? annualPriceId : priceId
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: selectedPriceId, userId: session.user.id, accessToken: session.access_token }),
      })
      const data = await response.json()
      if (data.url) window.location.href = data.url
      else setError(data.error ? t(`errors.${data.error}` as never) : t('error'))
    } catch {
      setError(t('error'))
    } finally {
      setLoading(null)
    }
  }

  // Build translated comparison data
  const v = (key: string) => t(`comparison.val.${key}` as never)
  const r = (key: string) => t(`comparison.row.${key}` as never)

  const comparisonSections: ComparisonSection[] = [
    {
      title: t('comparison.sec.storage'),
      rows: [
        { label: r('maxUpload'),    free: v('2gb'),       pro: v('50gb'),      business: v('200gb'),     enterprise: v('custom') },
        { label: r('linkExpiry'),   free: v('7days'),     pro: v('30days'),    business: v('noLimit'),   enterprise: v('noLimit') },
        { label: r('maxDownloads'), free: v('unlimited'), pro: v('unlimited'), business: v('unlimited'), enterprise: v('unlimited') },
        { label: r('simultaneous'), free: v('unlimited'), pro: v('unlimited'), business: v('unlimited'), enterprise: v('unlimited') },
      ],
    },
    {
      title: t('comparison.sec.features'),
      rows: [
        { label: r('adsFree'),       free: false, pro: true,  business: true,  enterprise: true },
        { label: r('passwordLinks'), free: false, pro: false, business: true,  enterprise: true },
        { label: r('downloadStats'), free: false, pro: true,  business: true,  enterprise: true },
        { label: r('customExpiry'),  free: false, pro: true,  business: true,  enterprise: true },
        { label: r('transferNotes'), free: true,  pro: true,  business: true,  enterprise: true },
        { label: r('emailDownload'), free: true,  pro: true,  business: true,  enterprise: true },
      ],
    },
    {
      title: t('comparison.sec.developer'),
      rows: [
        { label: r('restApi'),      free: false, pro: false, business: true,  enterprise: true },
        { label: r('apiKeys'),      free: false, pro: false, business: true,  enterprise: true },
        { label: r('webhooks'),     free: false, pro: false, business: false, enterprise: true },
        { label: r('customDomain'), free: false, pro: false, business: false, enterprise: true },
      ],
    },
    {
      title: t('comparison.sec.support'),
      rows: [
        { label: r('community'),    free: true,  pro: true,  business: true,  enterprise: true },
        { label: r('emailSupport'), free: false, pro: true,  business: true,  enterprise: true },
        { label: r('priority'),     free: false, pro: false, business: true,  enterprise: true },
        { label: r('dedicated'),    free: false, pro: false, business: false, enterprise: true },
        { label: r('sla'),          free: false, pro: false, business: false, enterprise: true },
        { label: r('sso'),          free: false, pro: false, business: false, enterprise: true },
      ],
    },
  ]

  const colHeaders: [string, string, string, string] = [
    t('comparison.col.free'),
    t('comparison.col.pro'),
    t('comparison.col.business'),
    t('comparison.col.enterprise'),
  ]

  const plans = [
    {
      key: 'free',
      name: t('plans.free.name'),
      desc: t('plans.free.desc'),
      monthlyPrice: 0,
      priceLabel: '€0',
      priceSub: t('forever'),
      highlight: false,
      badge: null as string | null,
      cta: t('plans.free.cta'),
      ctaStyle: 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/10',
      features: Array.from({ length: 5 }, (_, i) => t(`plans.free.feature${i}` as never)),
      priceId: null as string | null | undefined,
      annualPriceId: null as string | null | undefined,
    },
    {
      key: 'pro',
      name: t('plans.pro.name'),
      desc: t('plans.pro.desc'),
      monthlyPrice: 4.99,
      priceLabel: `€${getDisplayPrice(4.99)}`,
      priceSub: isAnnual ? t('billedAnnually', { amount: annualTotals[4.99] }) : t('perMonthLabel'),
      highlight: true,
      badge: t('plans.pro.badge') as string | null,
      cta: t('plans.pro.cta'),
      ctaStyle: 'bg-violet-600 hover:bg-violet-500 text-white',
      features: Array.from({ length: 6 }, (_, i) => t(`plans.pro.feature${i}` as never)),
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
      annualPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL,
    },
    {
      key: 'business',
      name: t('plans.business.name'),
      desc: t('plans.business.desc'),
      monthlyPrice: 14.99,
      priceLabel: `€${getDisplayPrice(14.99)}`,
      priceSub: isAnnual ? t('billedAnnually', { amount: annualTotals[14.99] }) : t('perMonthLabel'),
      highlight: false,
      badge: null as string | null,
      cta: t('plans.business.cta'),
      ctaStyle: 'bg-accent hover:bg-accent-dim text-ink',
      features: Array.from({ length: 6 }, (_, i) => t(`plans.business.feature${i}` as never)),
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS,
      annualPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS_ANNUAL,
    },
    {
      key: 'enterprise',
      name: t('plans.enterprise.name'),
      desc: t('plans.enterprise.desc'),
      monthlyPrice: -1,
      priceLabel: t('custom'),
      priceSub: t('volumePricing'),
      highlight: false,
      badge: null as string | null,
      cta: t('plans.enterprise.cta'),
      ctaStyle: 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/20',
      features: Array.from({ length: 6 }, (_, i) => t(`plans.enterprise.feature${i}` as never)),
      priceId: null as string | null | undefined,
      annualPriceId: null as string | null | undefined,
    },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <main className="max-w-6xl mx-auto px-6 py-24">

        {/* ── Header ── */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs text-white/40 mb-6 font-body">
            <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
            {t('badge')}
          </div>
          <h1 className="text-5xl font-display font-700 tracking-tight mb-4">
            {t('title')}
          </h1>
          <p className="text-white/40 text-lg max-w-md mx-auto font-body">
            {t('subtitle')}
          </p>
        </div>

        {/* ── Billing toggle ── */}
        <div className="flex flex-col items-center gap-3 mb-14">
          <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-full px-5 py-2">
            <button
              onClick={() => setIsAnnual(false)}
              className={`text-sm font-body transition-colors px-2 py-0.5 rounded-full ${!isAnnual ? 'text-white' : 'text-white/40 hover:text-white/60'}`}
            >
              {t('monthly')}
            </button>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${isAnnual ? 'bg-accent' : 'bg-white/15'}`}
              aria-label="Toggle annual billing"
              role="switch"
              aria-checked={isAnnual}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${isAnnual ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`text-sm font-body transition-colors px-2 py-0.5 rounded-full flex items-center gap-2 ${isAnnual ? 'text-white' : 'text-white/40 hover:text-white/60'}`}
            >
              {t('annual')}
              <span className="text-xs font-body px-2 py-0.5 rounded-full bg-accent/20 text-accent border border-accent/20">
                {t('savePercent')}
              </span>
            </button>
          </div>
          {isAnnual && (
            <p className="text-xs text-white/30 font-body animate-fade-up">
              {t('annualSavings', { proSave: (4.99 * 12 - 45).toFixed(2), bizSave: (14.99 * 12 - 120).toFixed(2) })}
            </p>
          )}
        </div>

        {error && (
          <div className="mb-10 text-center text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-4 font-body">
            {error}
          </div>
        )}

        {/* ── Plan cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-24">
          {plans.map((plan) => (
            <div
              key={plan.key}
              className={`relative flex flex-col rounded-2xl border p-6 transition-all ${
                plan.highlight
                  ? 'bg-gradient-to-b from-violet-900/40 to-violet-900/10 border-violet-500/40 ring-1 ring-violet-500/20 shadow-xl shadow-violet-900/20'
                  : 'bg-white/[0.03] border-white/8 hover:border-white/15'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-violet-600 text-white text-xs font-display font-600 px-3 py-1 rounded-full whitespace-nowrap">
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Plan name & desc */}
              <div className="mb-5">
                <p className={`text-xs font-body uppercase tracking-widest mb-1 ${
                  plan.key === 'pro' ? 'text-violet-400' :
                  plan.key === 'business' ? 'text-accent' :
                  plan.key === 'enterprise' ? 'text-amber-400' : 'text-white/30'
                }`}>{plan.name}</p>
                <p className="text-xs text-white/40 font-body leading-relaxed">{plan.desc}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-end gap-1.5">
                  <span className="text-4xl font-display font-700 tracking-tight text-white leading-none">
                    {plan.monthlyPrice === -1 ? t('custom') : plan.priceLabel}
                  </span>
                  {plan.monthlyPrice > 0 && (
                    <span className="text-white/30 text-xs font-body mb-1">{t('perMonth')}</span>
                  )}
                </div>
                <p className="text-xs text-white/25 font-body mt-1">{plan.priceSub}</p>
              </div>

              {/* CTA */}
              <button
                onClick={() => handleUpgrade(plan.key, plan.priceId, plan.annualPriceId)}
                disabled={loading === plan.key}
                className={`w-full py-2.5 rounded-xl text-sm font-display font-600 transition-all mb-6 disabled:opacity-50 disabled:cursor-not-allowed ${plan.ctaStyle}`}
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

              {/* Feature list */}
              <ul className="space-y-2.5 flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Check className={`flex-shrink-0 mt-0.5 ${
                      plan.key === 'pro' ? 'text-violet-400' :
                      plan.key === 'business' ? 'text-accent' :
                      plan.key === 'enterprise' ? 'text-amber-400' : 'text-white/30'
                    }`} />
                    <span className="text-sm text-white/60 font-body">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Comparison table ── */}
        <div className="mb-24">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-display font-700 tracking-tight mb-3">{t('comparison.title')}</h2>
            <p className="text-white/40 text-sm font-body">{t('comparison.subtitle')}</p>
          </div>
          <div className="bg-white/[0.02] border border-white/8 rounded-2xl px-6 py-4">
            <ComparisonTable sections={comparisonSections} colHeaders={colHeaders} />
          </div>
        </div>

        {/* ── Trust bar ── */}
        <div className="border-t border-white/8 pt-10 flex flex-wrap items-center justify-center gap-8 text-sm text-white/25 font-body">
          <span className="flex items-center gap-2">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-white/20" aria-hidden="true">
              <rect x="2" y="5" width="12" height="9" rx="1.5" strokeLinejoin="round"/>
              <path d="M5 5V3.5a3 3 0 0 1 6 0V5" strokeLinecap="round"/>
            </svg>
            {t('trust.stripe')}
          </span>
          <span className="flex items-center gap-2">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-white/20" aria-hidden="true">
              <path d="M8 2l1.5 3 3.5.5-2.5 2.5.5 3.5L8 10l-3 1.5.5-3.5L3 5.5l3.5-.5z" strokeLinejoin="round"/>
            </svg>
            {t('trust.guarantee')}
          </span>
          <span className="flex items-center gap-2">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-white/20" aria-hidden="true">
              <circle cx="8" cy="8" r="6"/>
              <path d="M8 5v3.5l2 1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {t('trust.cancel')}
          </span>
          <Link href="/faq" className="hover:text-white/50 transition-colors underline underline-offset-2">
            {t('trust.fullFaq')}
          </Link>
        </div>

      </main>
    </div>
  )
}

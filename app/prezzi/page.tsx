'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import Footer from '@/components/Footer'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)


const plans = [
  {
    name: 'Free',
    monthlyPrice: 0,
    color: 'from-white/5 to-white/[0.02]',
    border: 'border-white/10',
    badge: null,
    features: [
      { text: 'Upload fino a 2 GB per file', included: true },
      { text: 'Link validi 7 giorni', included: true },
      { text: 'Banner pubblicitari', included: true },
      { text: 'Download illimitati', included: true },
      { text: 'Link personalizzati', included: false },
      { text: 'Statistiche download', included: false },
      { text: 'Password sui link', included: false },
      { text: 'Supporto prioritario', included: false },
    ],
    cta: 'Inizia gratis',
    priceId: null,
    annualPriceId: null,
  },
  {
    name: 'Pro',
    monthlyPrice: 4.99,
    color: 'from-violet-900/30 to-indigo-900/20',
    border: 'border-violet-500/30',
    badge: 'Più popolare',
    features: [
      { text: 'Upload fino a 50 GB per file', included: true },
      { text: 'Link validi 30 giorni', included: true },
      { text: 'Nessun banner pubblicitario', included: true },
      { text: 'Download illimitati', included: true },
      { text: 'Link personalizzati', included: true },
      { text: 'Statistiche download', included: true },
      { text: 'Password sui link', included: false },
      { text: 'Supporto prioritario', included: false },
    ],
    cta: 'Passa a Pro',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
    annualPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL,
  },
  {
    name: 'Business',
    monthlyPrice: 14.99,
    color: 'from-amber-900/20 to-orange-900/10',
    border: 'border-amber-500/20',
    badge: null,
    features: [
      { text: 'Upload fino a 200 GB per file', included: true },
      { text: 'Link senza scadenza', included: true },
      { text: 'Nessun banner pubblicitario', included: true },
      { text: 'Download illimitati', included: true },
      { text: 'Link personalizzati', included: true },
      { text: 'Statistiche download', included: true },
      { text: 'Password sui link', included: true },
      { text: 'Supporto prioritario', included: true },
    ],
    cta: 'Passa a Business',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS,
    annualPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS_ANNUAL,
  },
]

export default function PricingPage() {
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
  

  const handleUpgrade = async (plan: typeof plans[0]) => {
    if (!plan.priceId && !plan.annualPriceId) {
      router.push('/login')
      return
    }

    setLoading(plan.name)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

      const priceId = isAnnual ? plan.annualPriceId : plan.priceId

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          userId: session.user.id,
          accessToken: session.access_token,
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Errore durante il checkout')
      }
    } catch {
      setError('Errore di rete. Riprova.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      {/* Nav */}
      <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <svg viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.5" className="w-4 h-4">
              <path d="M8 2v5M5 5h6M4 10c0 2.2 1.8 4 4 4s4-1.8 4-4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-bold tracking-tight">VaultTransfer</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/prezzi" className="text-sm text-white transition-colors">Prezzi</Link>
          <Link href="/faq" className="text-sm text-white/50 hover:text-white transition-colors">FAQ</Link>
          <Link href="/login" className="text-sm bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-1.5 rounded-lg transition-colors">
            Accedi
          </Link>
        </div>
      </nav>

      <main className="flex-1 max-w-5xl mx-auto px-6 py-20 w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs text-white/50 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 inline-block" />
            Semplice e trasparente
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">Scegli il tuo piano</h1>
          <p className="text-white/40 text-lg max-w-md mx-auto">
            Inizia gratis, passa a un piano superiore quando vuoi.
          </p>
        </div>

        {/* Toggle mensile / annuale */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={`text-sm transition-colors ${!isAnnual ? 'text-white' : 'text-white/40'}`}>
            Mensile
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className={`relative w-12 h-6 rounded-full transition-colors ${isAnnual ? 'bg-violet-600' : 'bg-white/10'}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                isAnnual ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={`text-sm transition-colors ${isAnnual ? 'text-white' : 'text-white/40'}`}>
            Annuale
          </span>
          {isAnnual && (
            <span className="bg-emerald-500/20 text-emerald-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-500/20">
              Risparmia fino a €{(14.99 * 12 - 120).toFixed(0)}/anno
            </span>
          )}
        </div>

        {error && (
          <div className="mb-8 text-center text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-gradient-to-b ${plan.color} border ${plan.border} rounded-2xl p-6 flex flex-col ${
                plan.badge ? 'ring-1 ring-violet-500/30' : ''
              }`}
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
                    {plan.monthlyPrice === 0 ? 'Gratis' : `€${getDisplayPrice(plan.monthlyPrice)}`}
                  </span>
                  {plan.monthlyPrice > 0 && (
                    <span className="text-white/30 text-sm mb-1.5">/mese</span>
                  )}
                </div>
                {plan.monthlyPrice > 0 && isAnnual && (
                  <p className="text-xs text-white/30 mt-1">
                    €{getAnnualTotal(plan.monthlyPrice)} fatturati annualmente
                  </p>
                )}
                {plan.monthlyPrice > 0 && !isAnnual && (
                  <p className="text-xs text-emerald-400/70 mt-1">
                    Risparmia €{(plan.monthlyPrice * 12 - (annualTotals[plan.monthlyPrice] ?? 0)).toFixed(2)}/anno con il piano annuale
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
                disabled={loading === plan.name}
                className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all ${
                  plan.name === 'Pro'
                    ? 'bg-violet-600 hover:bg-violet-500 text-white'
                    : plan.name === 'Business'
                    ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/20'
                    : 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/10'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading === plan.name ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25"/>
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                    Caricamento…
                  </span>
                ) : plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Garanzia */}
        <div className="text-center text-white/30 text-sm flex items-center justify-center gap-6 flex-wrap">
          <span className="flex items-center gap-2">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-white/20">
              <path d="M8 2l1.5 3 3.5.5-2.5 2.5.5 3.5L8 10l-3 1.5.5-3.5L3 5.5l3.5-.5z" strokeLinejoin="round"/>
            </svg>
            Rimborso entro 14 giorni
          </span>
          <span className="flex items-center gap-2">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-white/20">
              <rect x="2" y="5" width="12" height="9" rx="1.5" strokeLinejoin="round"/>
              <path d="M5 5V3.5a3 3 0 0 1 6 0V5" strokeLinecap="round"/>
            </svg>
            Pagamenti sicuri via Stripe
          </span>
          <span className="flex items-center gap-2">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-white/20">
              <circle cx="8" cy="8" r="6"/>
              <path d="M8 5v3.5l2 1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Disdici in qualsiasi momento
          </span>
          <Link href="/faq" className="hover:text-white/60 transition-colors underline underline-offset-2">
            Hai domande? Leggi le FAQ →
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}

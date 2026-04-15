'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    description: 'Per chi invia file occasionalmente',
    color: 'border-white/10',
    badge: null,
    features: [
      { text: 'Upload fino a 5GB', ok: true },
      { text: 'Link valido 7 giorni', ok: true },
      { text: 'Max 5 download', ok: true },
      { text: 'Protezione password', ok: true },
      { text: 'Nessun account richiesto', ok: true },
      { text: 'Pubblicità discreta', ok: false },
      { text: 'Storico trasferimenti', ok: false },
      { text: 'Link valido 30+ giorni', ok: false },
    ],
    cta: 'Inizia gratis',
    ctaAction: 'free',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 4.99,
    description: 'Per professionisti e freelance',
    color: 'border-accent',
    badge: '🔥 Più popolare',
    features: [
      { text: 'Upload fino a 20GB', ok: true },
      { text: 'Link valido 30 giorni', ok: true },
      { text: 'Download illimitati', ok: true },
      { text: 'Protezione password', ok: true },
      { text: 'Zero pubblicità', ok: true },
      { text: 'Storico trasferimenti', ok: true },
      { text: 'Supporto email prioritario', ok: true },
      { text: 'API access', ok: false },
    ],
    cta: 'Abbonati a Pro',
    ctaAction: 'pro',
  },
  {
    id: 'business',
    name: 'Business',
    price: 14.99,
    description: 'Per team e aziende',
    color: 'border-white/20',
    badge: null,
    features: [
      { text: 'Upload fino a 100GB', ok: true },
      { text: 'Link valido 90 giorni', ok: true },
      { text: 'Download illimitati', ok: true },
      { text: 'Protezione password', ok: true },
      { text: 'Zero pubblicità', ok: true },
      { text: 'Storico trasferimenti', ok: true },
      { text: 'Supporto prioritario', ok: true },
      { text: 'API access', ok: true },
    ],
    cta: 'Abbonati a Business',
    ctaAction: 'business',
  },
]

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function PricingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCta = async (planId: string) => {
    if (planId === 'free') { router.push('/'); return }
    setLoading(planId)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login?redirect=/prezzi')
        return
      }

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId, accessToken: session.access_token }),
      })
      const data = await res.json()

      if (!res.ok) {
        if (data.requiresLogin) { router.push('/login?redirect=/prezzi'); return }
        setError(data.error || 'Errore nel checkout')
        return
      }

      if (data.url) window.location.href = data.url
    } catch {
      setError('Errore di connessione, riprova.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <main className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb absolute w-[600px] h-[600px] rounded-full opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, #00e5a0, transparent)', top: '-200px', right: '-100px' }} />
      </div>

      <header className="relative z-10 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v8M5 7l3 3 3-3M3 12h10" stroke="#0a0a0f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-display text-xl font-700 tracking-tight text-paper">VaultTransfer</span>
          </a>
          <a href="/login" className="text-sm text-muted hover:text-paper font-body transition-colors">
            Accedi →
          </a>
        </div>
      </header>

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-16 pb-20">
        <div className="text-center mb-14">
          <p className="text-xs text-muted uppercase tracking-widest font-body mb-3">Prezzi trasparenti</p>
          <h1 className="font-display text-4xl md:text-5xl font-800 text-paper mb-4">
            Scegli il piano giusto per te
          </h1>
          <p className="text-muted font-body max-w-md mx-auto">
            Inizia gratis, passa a Pro quando sei pronto. Nessun costo nascosto, cancelli quando vuoi.
          </p>
        </div>

        {error && (
          <div className="max-w-md mx-auto mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 font-body text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-surface border-2 ${plan.color} rounded-2xl p-7 flex flex-col ${
                plan.id === 'pro' ? 'shadow-lg shadow-accent/10' : ''
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent text-ink text-xs font-display font-700 rounded-full whitespace-nowrap">
                  {plan.badge}
                </div>
              )}

              <div className="mb-6">
                <p className="text-xs text-muted uppercase tracking-widest font-body mb-2">{plan.name}</p>
                <div className="flex items-end gap-1 mb-2">
                  <span className="font-display text-4xl font-800 text-paper">
                    {plan.price === 0 ? 'Gratis' : `${plan.price}€`}
                  </span>
                  {plan.price > 0 && <span className="text-muted font-body text-sm mb-1">/mese</span>}
                </div>
                <p className="text-sm text-muted font-body">{plan.description}</p>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-body">
                    <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                      f.ok ? 'bg-accent/15 text-accent' : 'bg-white/5 text-muted'
                    }`}>
                      {f.ok ? '✓' : '×'}
                    </span>
                    <span className={f.ok ? 'text-paper' : 'text-muted line-through'}>{f.text}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCta(plan.ctaAction)}
                disabled={loading === plan.id}
                className={`w-full py-3.5 rounded-xl font-display font-600 text-sm transition-all ${
                  plan.id === 'pro'
                    ? 'bg-accent text-ink hover:bg-accent-dim shadow-lg shadow-accent/20'
                    : plan.id === 'free'
                    ? 'bg-surface-2 text-paper hover:bg-white/10 border border-white/10'
                    : 'bg-white/10 text-paper hover:bg-white/15 border border-white/10'
                } disabled:opacity-50`}
              >
                {loading === plan.id ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
                      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
                    </svg>
                    Caricamento...
                  </span>
                ) : plan.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="font-display text-2xl font-700 text-paper text-center mb-8">Domande frequenti</h2>
          <div className="space-y-4">
            {[
              { q: 'Posso cancellare in qualsiasi momento?', a: 'Sì, puoi cancellare il tuo abbonamento quando vuoi dal portale di gestione. Continuerai ad avere accesso al piano fino alla fine del periodo pagato.' },
              { q: 'I miei file sono al sicuro?', a: 'Tutti i trasferimenti viaggiano su HTTPS con TLS 1.3. I file vengono eliminati automaticamente alla scadenza del link. I server sono in Europa (GDPR compliant).' },
              { q: 'Quali metodi di pagamento accettate?', a: 'Accettiamo tutte le principali carte di credito e debito (Visa, Mastercard, American Express) tramite Stripe.' },
              { q: 'Posso passare da Pro a Business?', a: 'Sì, puoi cambiare piano in qualsiasi momento. La differenza di prezzo viene calcolata proporzionalmente.' },
            ].map((faq, i) => (
              <div key={i} className="bg-surface border border-white/5 rounded-xl p-5">
                <p className="font-display font-600 text-paper mb-2">{faq.q}</p>
                <p className="text-sm text-muted font-body leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
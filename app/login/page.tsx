'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    // Gestisce il token nell'hash URL (flusso implicito)
    const hash = window.location.hash
    if (hash && hash.includes('access_token')) {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          window.location.href = '/dashboard'
        }
      })
    }

    // Ascolta cambio stato auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        window.location.href = '/dashboard'
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = async () => {
    if (!email) return
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        shouldCreateUser: true,
      },
    })
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
<div className="bg-surface border border-white/5 rounded-2xl p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-5">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00e5a0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <h2 className="font-display text-xl font-700 text-paper mb-2">Controlla la tua email!</h2>
              <p className="text-sm text-muted font-body">
                Abbiamo inviato un link magico a <span className="text-paper">{email}</span>.<br/>
                Clicca il link per accedere — verrai reindirizzato automaticamente.
              </p>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-700 text-paper mb-2">Accedi</h1>
              <p className="text-sm text-muted font-body mb-6">
                Ti inviamo un link magico via email — nessuna password da ricordare.
              </p>
              <label className="text-xs text-muted uppercase tracking-widest font-body mb-2 block">Email</label>
              <input
                type="email"
                placeholder="tu@esempio.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                autoFocus
                className="w-full bg-surface-2 border border-white/5 rounded-xl px-4 py-3 text-paper placeholder-muted font-body focus:outline-none focus:border-accent/50 transition-colors mb-4"
              />
              {error && <p className="text-red-400 text-xs mb-4 font-body">{error}</p>}
              <button
                onClick={handleLogin}
                disabled={loading || !email}
                className="w-full py-3.5 bg-accent text-ink rounded-xl font-display font-600 text-sm hover:bg-accent-dim transition-all disabled:opacity-50"
              >
                {loading ? 'Invio in corso...' : 'Invia link magico →'}
              </button>
              <p className="text-center text-xs text-muted font-body mt-4">
                Nessun account? Verrà creato automaticamente.
              </p>
            </>
          )}
        </div>
        <p className="text-center text-xs text-muted font-body mt-6">
          <a href="/" className="hover:text-paper transition-colors">← Torna alla home</a>
        </p>
      </div>
    </main>
  )
}
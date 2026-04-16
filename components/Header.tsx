'use client'

import { useEffect, useState, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface UserInfo {
  email: string
  id: string
  plan: string
}

export default function Header() {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [ready, setReady] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const fetchUser = async (retries = 3) => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' })
      const data = await res.json()
      if (!data.user && retries > 0) {
        setTimeout(() => fetchUser(retries - 1), 500)
        return
      }
      setUser(data.user)
    } catch {
      setUser(null)
    } finally {
      setReady(true)
    }
  }

  useEffect(() => {
    fetchUser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUser()
    })
    return () => subscription.unsubscribe()
  }, [])

  // Chiudi menu cliccando fuori
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setMenuOpen(false)
    window.location.href = '/'
  }

  return (
    <header className="relative z-10 border-b border-white/5">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v8M5 7l3 3 3-3M3 12h10" stroke="#0a0a0f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-display text-xl font-700 tracking-tight text-paper">VaultTransfer</span>
        </a>

        <nav className="hidden md:flex items-center gap-6">
          <a href="/prezzi" className="text-sm text-muted hover:text-paper font-body transition-colors">Prezzi</a>

          {!ready ? (
            <div className="w-20 h-8 bg-white/5 rounded-xl animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <span className={`px-2 py-1 rounded-full text-xs font-body ${
                user.plan === 'free' ? 'bg-white/10 text-muted' : 'bg-accent/15 text-accent'
              }`}>
                {user.plan === 'free' ? 'Free' : user.plan === 'pro' ? '⭐ Pro' : '🏢 Business'}
              </span>

              <div ref={menuRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setMenuOpen(v => !v)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: '#12121a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', cursor: 'pointer', color: '#f4f1eb' }}
                >
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#00e5a0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0a0a0f', fontSize: '11px', fontWeight: 700 }}>
                    {user.email[0].toUpperCase()}
                  </div>
                  <span style={{ fontSize: '12px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: menuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>

                {menuOpen && (
                  <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: '192px', background: '#12121a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', overflow: 'hidden', zIndex: 9999, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                    <a
                      href="/dashboard"
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', fontSize: '14px', color: '#f4f1eb', textDecoration: 'none' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                      </svg>
                      Dashboard
                    </a>
                    {user.plan === 'free' && (
                      <a
                        href="/prezzi"
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', fontSize: '14px', color: '#00e5a0', textDecoration: 'none' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,229,160,0.05)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                        Passa a Pro
                      </a>
                    )}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }} />
                    <button
                      onClick={handleLogout}
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', fontSize: '14px', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
                      onMouseEnter={e => { (e.currentTarget.style.background = 'rgba(255,255,255,0.05)'); (e.currentTarget.style.color = '#f4f1eb') }}
                      onMouseLeave={e => { (e.currentTarget.style.background = 'transparent'); (e.currentTarget.style.color = '#6b7280') }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                      Esci
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <a href="/login" className="text-sm text-muted hover:text-paper font-body transition-colors">Accedi</a>
              <a href="/login" className="px-4 py-2 bg-accent text-ink rounded-xl text-sm font-display font-600 hover:bg-accent-dim transition-colors">
                Registrati gratis →
              </a>
            </div>
          )}
        </nav>

        {/* Mobile */}
        <button className="md:hidden text-muted hover:text-paper" onClick={() => setMenuOpen(v => !v)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {menuOpen
              ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
              : <><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>
            }
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-white/5 bg-surface px-6 py-4 space-y-3">
          <a href="/prezzi" className="block text-sm text-muted hover:text-paper font-body py-2">Prezzi</a>
          {user ? (
            <>
              <a href="/dashboard" className="block text-sm text-paper font-body py-2">Dashboard</a>
              {user.plan === 'free' && <a href="/prezzi" className="block text-sm text-accent font-body py-2">⭐ Passa a Pro</a>}
              <button onClick={handleLogout} className="block text-sm text-muted font-body py-2 w-full text-left">Esci</button>
            </>
          ) : (
            <>
              <a href="/login" className="block text-sm text-muted hover:text-paper font-body py-2">Accedi</a>
              <a href="/login" className="block px-4 py-2 bg-accent text-ink rounded-xl text-sm font-display font-600 text-center">Registrati gratis →</a>
            </>
          )}
        </div>
      )}
    </header>
  )
}
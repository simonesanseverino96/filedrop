'use client'

import { useEffect, useState } from 'react'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react'
import { getBrowserClient } from '@/lib/supabase'
import { useTranslations } from 'next-intl'
import TranslateWidget from './TranslateWidget'

interface UserInfo {
  email: string
  id: string
  plan: string
}

export default function Header() {
  const t = useTranslations('header')
  const [user, setUser] = useState<UserInfo | null>(null)
  const [ready, setReady] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const supabase = getBrowserClient()
  

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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => fetchUser())
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    window.location.href = '/'
  }

  return (
    <header className="relative z-[9999] border-b border-white/5">
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
          <a href="/pricing" className="text-sm text-muted hover:text-paper font-body transition-colors">
            {t('pricing')}
          </a>

          <TranslateWidget />

          {!ready ? (
            <div className="w-20 h-8 bg-white/5 rounded-xl animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <span className={`px-2 py-1 rounded-full text-xs font-body ${
                user.plan === 'free' ? 'bg-white/10 text-muted' : 'bg-accent/15 text-accent'
              }`}>
                {user.plan === 'free' ? t('planFree') : user.plan === 'pro' ? t('planPro') : t('planBusiness')}
              </span>

              <Menu as="div" className="relative">
                {({ open }) => (
                  <>
                    <MenuButton className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-white/10 rounded-xl text-sm font-body text-paper hover:border-accent/30 transition-colors">
                      <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center text-ink text-xs font-700">
                        {user.email[0].toUpperCase()}
                      </div>
                      <span className="max-w-[120px] truncate text-xs">{user.email}</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </MenuButton>

                    <MenuItems
                      anchor="bottom end"
                      className="w-48 bg-surface border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 outline-none mt-2"
                    >
                      <MenuItem>
                        <a href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-sm font-body text-paper data-[focus]:bg-white/5 transition-colors w-full">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                          </svg>
                          {t('dashboard')}
                        </a>
                      </MenuItem>

                      {user.plan === 'free' && (
                        <MenuItem>
                          <a href="/pricing" className="flex items-center gap-3 px-4 py-3 text-sm font-body text-accent data-[focus]:bg-accent/5 transition-colors w-full">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                            {t('upgradeToPro')}
                          </a>
                        </MenuItem>
                      )}

                      <div className="border-t border-white/5" />

                      <MenuItem>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-3 text-sm font-body text-muted data-[focus]:text-paper data-[focus]:bg-white/5 transition-colors w-full text-left"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                            <polyline points="16 17 21 12 16 7"/>
                            <line x1="21" y1="12" x2="9" y2="12"/>
                          </svg>
                          {t('logout')}
                        </button>
                      </MenuItem>
                    </MenuItems>
                  </>
                )}
              </Menu>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <a href="/login" className="text-sm text-muted hover:text-paper font-body transition-colors">
                {t('login')}
              </a>
              <a href="/login" className="px-4 py-2 bg-accent text-ink rounded-xl text-sm font-display font-600 hover:bg-accent-dim transition-colors">
                {t('register')}
              </a>
            </div>
          )}
        </nav>

        <button className="md:hidden text-muted hover:text-paper" onClick={() => setMobileOpen(v => !v)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {mobileOpen
              ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
              : <><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>
            }
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-white/5 bg-surface px-6 py-4 space-y-3">
          <a href="/pricing" className="block text-sm text-muted hover:text-paper font-body py-2">
            {t('pricing')}
          </a>
          <div className="py-1">
            <TranslateWidget />
          </div>
          {user ? (
            <>
              <a href="/dashboard" className="block text-sm text-paper font-body py-2">{t('dashboard')}</a>
              {user.plan === 'free' && (
                <a href="/pricing" className="block text-sm text-accent font-body py-2">⭐ {t('upgradeToPro')}</a>
              )}
              <button onClick={handleLogout} className="block text-sm text-muted font-body py-2 w-full text-left">
                {t('logout')}
              </button>
            </>
          ) : (
            <>
              <a href="/login" className="block text-sm text-muted hover:text-paper font-body py-2">{t('login')}</a>
              <a href="/login" className="block px-4 py-2 bg-accent text-ink rounded-xl text-sm font-display font-600 text-center">
                {t('register')}
              </a>
            </>
          )}
        </div>
      )}
    </header>
  )
}
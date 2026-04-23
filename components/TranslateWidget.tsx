'use client'

import { useState } from 'react'

const LOCALES = [
  { code: 'en', label: 'English',    flag: '🇬🇧' },
  { code: 'de', label: 'Deutsch',    flag: '🇩🇪' },
  { code: 'fr', label: 'Français',   flag: '🇫🇷' },
  { code: 'es', label: 'Español',    flag: '🇪🇸' },
  { code: 'pt', label: 'Português',  flag: '🇵🇹' },
  { code: 'it', label: 'Italiano',   flag: '🇮🇹' },
  { code: 'ja', label: '日本語',      flag: '🇯🇵' },
  { code: 'zh', label: '中文',        flag: '🇨🇳' },
  { code: 'ar', label: 'العربية',    flag: '🇸🇦' },
]

export default function TranslateWidget() {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState(() => {
    if (typeof document === 'undefined') return 'en'
    const match = document.cookie.match(/NEXT_LOCALE=([^;]+)/)
    return match?.[1] ?? 'en'
  })

  const handleSelect = async (code: string) => {
    setOpen(false)
    if (code === current) return

    await fetch('/api/locale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale: code }),
    })

    setCurrent(code)
    window.location.reload()
  }

  const currentLocale = LOCALES.find(l => l.code === current) ?? LOCALES[0]

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-surface border border-white/10 rounded-xl text-xs font-body text-muted hover:border-accent/30 hover:text-paper transition-colors"
      >
        <span>{currentLocale.flag}</span>
        <span>{currentLocale.code.toUpperCase()}</span>
        <svg
          width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <>
          {/* Overlay per chiudere cliccando fuori */}
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-40 bg-surface border border-white/10 rounded-xl shadow-xl overflow-hidden z-[9999]">
            {LOCALES.map(locale => (
              <button
                key={locale.code}
                onClick={() => handleSelect(locale.code)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-body transition-colors text-left ${
                  locale.code === current
                    ? 'bg-accent/10 text-accent'
                    : 'text-muted hover:bg-white/5 hover:text-paper'
                }`}
              >
                <span className="text-base">{locale.flag}</span>
                <span>{locale.label}</span>
                {locale.code === current && (
                  <svg className="ml-auto" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
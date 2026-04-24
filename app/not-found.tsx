'use client'

import { useTranslations } from 'next-intl'

export default function NotFound() {
  const t = useTranslations('notFound')

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center animate-fade-up">
        <div className="relative mb-8">
          <p className="font-display text-[8rem] md:text-[12rem] font-800 leading-none text-white/5 select-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00e5a0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                <line x1="11" y1="8" x2="11" y2="14"/>
                <line x1="8" y1="11" x2="14" y2="11"/>
              </svg>
            </div>
          </div>
        </div>

        <h1 className="font-display text-3xl md:text-4xl font-800 text-paper mb-3">
          {t('title')}
        </h1>
        <p className="text-muted font-body text-base max-w-sm mx-auto mb-10 leading-relaxed">
          {t('description')}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a href="/" className="px-6 py-3 bg-accent text-ink rounded-xl font-display font-600 text-sm hover:bg-accent-dim transition-all active:scale-[0.98] shadow-lg shadow-accent/20">
            {t('backHome')}
          </a>
          <a href="/pricing" className="px-6 py-3 bg-surface border border-white/10 text-paper rounded-xl font-display font-600 text-sm hover:bg-surface-2 transition-all">
            {t('seePlans')}
          </a>
        </div>

        <p className="mt-10 text-xs text-muted font-body">
          {t('help')}{' '}
          <a href="mailto:support@vaultransfer.com" className="text-accent hover:underline">
            support@vaultransfer.com
          </a>
        </p>
      </div>
    </main>
  )
}
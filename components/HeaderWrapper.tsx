'use client'

import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'

function HeaderSkeleton() {
  const t = useTranslations('header')
  return (
    <header className="relative z-10 border-b border-white/5">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v8M5 7l3 3 3-3M3 12h10" stroke="#0a0a0f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-display text-xl font-700 tracking-tight text-paper">VaultTransfer</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/pricing" className="text-sm text-muted font-body">{t('pricing')}</Link>
        </nav>
      </div>
    </header>
  )
}

const Header = dynamic(() => import('./Header'), { 
  ssr: false,
  loading: HeaderSkeleton
})

export default function HeaderWrapper() {
  return <Header />
}
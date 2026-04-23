'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { UploadConfig } from '@/types'
import { formatBytes } from '@/lib/utils'

interface Props {
  token: string
  config: UploadConfig
  files: File[]
}

export default function UploadSuccess({ token, config, files }: Props) {
  const t = useTranslations('uploadSuccess')
  const [copied, setCopied] = useState(false)
  const link = `${typeof window !== 'undefined' ? window.location.origin : ''}/download/${token}`

  const copyLink = async () => {
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const expiryLabel = config.expiry === '1'
    ? t('expiry1')
    : config.expiry === '7'
    ? t('expiry7')
    : t('expiry30')

  const totalSize = files.reduce((a, f) => a + f.size, 0)

  return (
    <div className="max-w-lg mx-auto text-center animate-fade-up">
      {/* Success icon */}
      <div className="w-20 h-20 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center mx-auto mb-6">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00e5a0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>

      <h2 className="font-display text-3xl font-700 text-paper mb-2">{t('title')}</h2>
      <p className="text-muted text-sm font-body mb-8">
        {t('subtitle', {
          count: files.length,
          size: formatBytes(totalSize),
          expiry: expiryLabel,
          password: config.password ? t('passwordSuffix') : '',
        })}
      </p>

      {/* Link box */}
      <div className="bg-surface border border-white/5 rounded-2xl p-5 mb-4">
        <p className="text-xs text-muted mb-3 font-body uppercase tracking-widest">{t('linkLabel')}</p>
        <div className="flex items-center gap-3">
          <code className="flex-1 text-accent text-sm font-body bg-surface-2 rounded-lg px-3 py-2 truncate text-left">
            {link}
          </code>
          <button
            onClick={copyLink}
            className={`px-4 py-2 rounded-lg text-sm font-display font-600 transition-all duration-200 flex-shrink-0 ${
              copied ? 'bg-accent/20 text-accent' : 'bg-accent text-ink hover:bg-accent-dim'
            }`}
          >
            {copied ? t('copied') : t('copy')}
          </button>
        </div>
      </div>

      {/* Security badges */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {[
          { icon: '🔒', label: t('badges.https') },
          { icon: '⏱', label: t('badges.expiry', { expiry: expiryLabel }) },
          config.password ? { icon: '🔑', label: t('badges.password') } : null,
          config.maxDownloads ? { icon: '📥', label: t('badges.maxDownloads', { count: config.maxDownloads }) } : null,
        ].filter(Boolean).map((badge, i) => (
          <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-white/5 rounded-full text-xs text-muted font-body">
            <span>{badge!.icon}</span>
            <span>{badge!.label}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => window.location.reload()}
        className="text-sm text-muted hover:text-paper underline underline-offset-4 font-body transition-colors"
      >
        {t('newTransfer')}
      </button>
    </div>
  )
}
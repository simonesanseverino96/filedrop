'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'

interface Props {
  slot: string
}

export default function AdBanner({ slot }: Props) {
  const t = useTranslations('adBanner')

  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {}
  }, [])

  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID
  if (!adsenseId) return null

  return (
    <div className="my-6">
      <p className="text-xs text-muted font-body text-center mb-2 uppercase tracking-widest">
        {t('label')}
      </p>
      <div className="bg-surface border border-white/5 rounded-xl overflow-hidden">
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={adsenseId}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
      <p className="text-xs text-muted font-body text-center mt-2">
        <a href="/pricing" className="text-accent hover:underline">{t('removePro')}</a>
      </p>
    </div>
  )
}
'use client'

import CookieConsent from 'react-cookie-consent'
import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'

export default function CookieBanner() {
  const t = useTranslations('cookie')
  const [show, setShow] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('vt-cookie-consent')
    if (!consent) setShow(true)
  }, [])

  if (!show) return null

  return (
    <CookieConsent
      location="bottom"
      buttonText={t('accept')}
      declineButtonText={t('decline')}
      enableDeclineButton
      onAccept={() => {
        localStorage.setItem('vt-cookie-consent', 'all')
        setShow(false)
      }}
      onDecline={() => {
        localStorage.setItem('vt-cookie-consent', 'necessary')
        setShow(false)
        if (typeof window !== 'undefined') {
          // @ts-ignore
          window['ga-disable-G-XXXXXXXX'] = true
        }
      }}
      style={{
        background: '#12121a',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        padding: '16px 24px',
        alignItems: 'center',
        zIndex: 99999,
      }}
      buttonStyle={{
        background: '#00e5a0',
        color: '#0a0a0f',
        fontSize: '13px',
        fontWeight: '600',
        borderRadius: '10px',
        padding: '8px 20px',
        margin: '0 0 0 8px',
      }}
      declineButtonStyle={{
        background: 'transparent',
        color: '#6b7280',
        fontSize: '13px',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '10px',
        padding: '8px 20px',
        margin: '0',
      }}
      contentStyle={{
        flex: '1',
        margin: '0',
      }}
    >
      <span style={{ fontSize: '13px', color: '#f4f1eb', fontFamily: 'monospace' }}>
        🍪 {t('message')}{' '}
        <a href="/privacy" style={{ color: '#00e5a0', textDecoration: 'underline' }}>
          Privacy Policy
        </a>
      </span>
    </CookieConsent>
  )
}
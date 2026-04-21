import type { Metadata } from 'next'
import Script from 'next/script'
import HeaderWrapper from '@/components/HeaderWrapper'
import CookieBanner from '@/components/CookieBanner'
import './globals.css'
import Footer from '@/components/Footer'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vaultransfer.com'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'VaultTransfer — Invia file in modo sicuro e gratuito',
    template: '%s | VaultTransfer',
  },
  description: 'Trasferisci file fino a 2GB gratis. Link cifrati con scadenza automatica, protezione password e limite di download. Nessun account richiesto. GDPR compliant.',
  keywords: [
    'trasferimento file sicuro',
    'inviare file gratis',
    'condividere file online',
    'invia file grande',
    'file sharing sicuro',
    'trasferire file cifrati',
    'link download scadenza',
    'inviare file senza registrazione',
    'alternativa wetransfer',
    'inviare file protetti password',
  ],
  authors: [{ name: 'VaultTransfer' }],
  creator: 'VaultTransfer',
  publisher: 'VaultTransfer',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  openGraph: {
    title: 'VaultTransfer — Invia file in modo sicuro e gratuito',
    description: 'Trasferisci file fino a 2GB gratis. Link cifrati, scadenza automatica, protezione password.',
    type: 'website',
    url: baseUrl,
    siteName: 'VaultTransfer',
    locale: 'it_IT',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VaultTransfer — Invia file in modo sicuro e gratuito',
    description: 'Trasferisci file fino a 2GB gratis. Link cifrati, scadenza automatica, protezione password.',
  },
  alternates: { canonical: baseUrl },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID
  return (
    <html lang="it">
      <body>
        {adsenseId && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        <HeaderWrapper />
        {children}
        <CookieBanner />
        <Footer />

      </body>
    </html>
  )
}
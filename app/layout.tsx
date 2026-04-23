import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import Script from 'next/script'
import HeaderWrapper from '@/components/HeaderWrapper'
import CookieBanner from '@/components/CookieBanner'
import './globals.css'
import Footer from '@/components/Footer'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vaultransfer.com'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'VaultTransfer — Send files securely and for free',
    template: '%s | VaultTransfer',
  },
  description: 'Transfer files up to 2GB for free. Encrypted links with automatic expiry, password protection and download limits. No account required. GDPR compliant.',
  keywords: [
    'secure file transfer',
    'send files free',
    'share files online',
    'send large files',
    'secure file sharing',
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
    title: 'VaultTransfer — Send files securely and for free',
    description: 'Transfer files up to 2GB for free. Encrypted links, automatic expiry, password protection.',
    type: 'website',
    url: baseUrl,
    siteName: 'VaultTransfer',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VaultTransfer — Send files securely and for free',
    description: 'Transfer files up to 2GB for free. Encrypted links, automatic expiry, password protection.',
  },
  alternates: { canonical: baseUrl },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  const messages = await getMessages()
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID

  return (
    <html lang={locale}>
      <body>
        {adsenseId && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        <NextIntlClientProvider messages={messages}>
          <HeaderWrapper />
          {children}
          <CookieBanner />
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
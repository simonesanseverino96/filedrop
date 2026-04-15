import type { Metadata } from 'next'
import './globals.css'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vaultransfer.it'

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
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
  },
  openGraph: {
    title: 'VaultTransfer — Invia file in modo sicuro e gratuito',
    description: 'Trasferisci file fino a 2GB gratis. Link cifrati, scadenza automatica, protezione password. Nessun account richiesto.',
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
  alternates: {
    canonical: baseUrl,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  )
}
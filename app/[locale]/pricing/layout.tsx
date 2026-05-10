import { Metadata } from 'next'
import { getTranslations, getLocale } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations()
  const locale = await getLocale()
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vaultransfer.com'
  
  return {
    title: t('pricing.title'),
    description: t('pricing.subtitle'),
    alternates: {
      canonical: locale === 'en' ? `${baseUrl}/pricing` : `${baseUrl}/pricing?lang=${locale}`,
    }
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

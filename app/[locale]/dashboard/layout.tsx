import { Metadata } from 'next'
import { getTranslations, getLocale } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations()
  const locale = await getLocale()
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vaultransfer.com'
  
  return {
    title: t('header.dashboard'),
    description: t('metadata.description'),
    alternates: {
      canonical: locale === 'en' ? `${baseUrl}/dashboard` : `${baseUrl}/dashboard?lang=${locale}`,
    }
  }
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

import { Metadata } from 'next'
import { getTranslations, getLocale } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations()
  const locale = await getLocale()
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vaultransfer.com'
  
  return {
    title: t('login.title'),
    description: t('login.subtitle'),
    alternates: {
      canonical: locale === 'en' ? `${baseUrl}/login` : `${baseUrl}/login?lang=${locale}`,
    }
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

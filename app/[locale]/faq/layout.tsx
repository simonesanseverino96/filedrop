import { Metadata } from 'next'
import { getTranslations, getLocale } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations()
  const locale = await getLocale()
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vaultransfer.com'
  
  return {
    title: t('faq.title') + ' ' + t('faq.titleAccent'),
    description: t('metadata.description'),
    alternates: {
      canonical: locale === 'en' ? `${baseUrl}/faq` : `${baseUrl}/faq?lang=${locale}`,
    }
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

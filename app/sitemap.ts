import { MetadataRoute } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vaultransfer.com'

const locales = ['en', 'it', 'de', 'fr', 'es', 'pt', 'ja', 'zh', 'ar']

const pages = [
  { path: '',        changeFrequency: 'weekly',  priority: 1.0 },
  { path: '/pricing', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/faq',    changeFrequency: 'monthly',  priority: 0.7 },
  { path: '/login',  changeFrequency: 'yearly',   priority: 0.5 },
  { path: '/privacy', changeFrequency: 'yearly',  priority: 0.3 },
  { path: '/terms',  changeFrequency: 'yearly',   priority: 0.3 },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = []

  for (const page of pages) {
    // URL canonico in inglese
    entries.push({
      url: `${baseUrl}/en${page.path}`,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency as any,
      priority: page.priority,
      alternates: {
        languages: Object.fromEntries(
          locales.map(locale => [locale, `${baseUrl}/${locale}${page.path}`])
        ),
      },
    })
  }

  return entries
}
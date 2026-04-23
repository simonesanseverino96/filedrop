import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const requested = cookieStore.get('NEXT_LOCALE')?.value || 'en'

  // Fallback a inglese se il file lingua non esiste
  const validLocales = ['en', 'it', 'de', 'fr', 'es', 'pt', 'ja', 'zh', 'ar']
  const locale = validLocales.includes(requested) ? requested : 'en'

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  }
})
import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({requestLocale}) => {
  // Ottiene il locale richiesto dalla navigazione (dalla route [locale])
  let locale = await requestLocale;
  
  // Fallback a inglese se il locale non è valido o mancante
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  }
})
'use client'

import { Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

export default function Footer() {
  const t = useTranslations('footer')

  return (
    <footer className="border-t border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#0a0a0f] mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <Image src="/favicon.svg" alt="VaultTransfer" width={28} height={28} className="w-7 h-7" loading="lazy" />
              <span className="font-bold text-gray-900 dark:text-white text-base tracking-tight">VaultTransfer</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-white/40 leading-relaxed">{t('tagline')}</p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 dark:text-white/60 uppercase tracking-widest mb-4">
              {t('sections.product')}
            </h4>
            <ul className="space-y-2.5">
              <li><Link href="/pricing" className="text-sm text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition-colors">{t('links.pricing')}</Link></li>
              <li><Link href="/faq" className="text-sm text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition-colors">{t('links.faq')}</Link></li>
              <li><Link href="/dashboard" className="text-sm text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition-colors">{t('links.dashboard')}</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 dark:text-white/60 uppercase tracking-widest mb-4">
              {t('sections.legal')}
            </h4>
            <ul className="space-y-2.5">
              <li><Link href="/privacy" className="text-sm text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition-colors">{t('links.privacy')}</Link></li>
              <li><Link href="/terms" className="text-sm text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition-colors">{t('links.terms')}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 dark:text-white/60 uppercase tracking-widest mb-4">
              {t('sections.contact')}
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a href="mailto:support@vaultransfer.com" className="text-sm text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition-colors">
                  support@vaultransfer.com
                </a>
              </li>
              <li>
                <a href="mailto:privacy@vaultransfer.com" className="text-sm text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition-colors">
                  privacy@vaultransfer.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-white/5 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400 dark:text-white/25">
            {t('copyright', { year: new Date().getFullYear() })}
          </p>
          <p className="text-xs text-gray-400 dark:text-white/25">{t('badge')}</p>
        </div>
      </div>
    </footer>
  )
}
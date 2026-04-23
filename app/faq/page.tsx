'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function FAQPage() {
  const t = useTranslations('faq')
  const [openIndex, setOpenIndex] = useState<string | null>(null)

  const toggle = (key: string) => setOpenIndex(openIndex === key ? null : key)

  const faqs = [
    {
      category: t('categories.general'),
      items: [
        { q: t('items.whatIs.q'), a: t('items.whatIs.a') },
        { q: t('items.register.q'), a: t('items.register.a') },
        { q: t('items.expiry.q'), a: t('items.expiry.a') },
      ],
    },
    {
      category: t('categories.security'),
      items: [
        { q: t('items.safe.q'), a: t('items.safe.a') },
        { q: t('items.whoCanSee.q'), a: t('items.whoCanSee.a') },
        { q: t('items.scanned.q'), a: t('items.scanned.a') },
      ],
    },
    {
      category: t('categories.plans'),
      items: [
        { q: t('items.payment.q'), a: t('items.payment.a') },
        { q: t('items.changePlan.q'), a: t('items.changePlan.a') },
        { q: t('items.annualDiscount.q'), a: t('items.annualDiscount.a') },
        { q: t('items.refund.q'), a: t('items.refund.a') },
      ],
    },
    {
      category: t('categories.technical'),
      items: [
        { q: t('items.maxSize.q'), a: t('items.maxSize.a') },
        { q: t('items.formats.q'), a: t('items.formats.a') },
        { q: t('items.devices.q'), a: t('items.devices.a') },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      <main className="flex-1 max-w-3xl mx-auto px-6 py-20 w-full">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs text-white/50 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
            {t('badge')}
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            {t('title')}<br/>{t('titleAccent')}
          </h1>
          <p className="text-white/40 text-lg">
            {t('contact')}{' '}
            <a href="mailto:support@vaultransfer.com" className="text-green-400 hover:text-green-300 transition-colors underline underline-offset-2">
              {t('contactLink')}
            </a>
          </p>
        </div>

        <div className="space-y-10">
          {faqs.map((section) => (
            <div key={section.category}>
              <h2 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4 px-1">
                {section.category}
              </h2>
              <div className="space-y-2">
                {section.items.map((item, i) => {
                  const key = `${section.category}-${i}`
                  const isOpen = openIndex === key
                  return (
                    <div
                      key={key}
                      className={`border rounded-xl transition-colors ${isOpen ? 'border-white/10 bg-white/5' : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]'}`}
                    >
                      <button
                        onClick={() => toggle(key)}
                        className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
                      >
                        <span className="text-sm font-medium text-white/90">{item.q}</span>
                        <svg
                          viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"
                          className={`w-4 h-4 text-white/30 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        >
                          <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-4">
                          <p className="text-sm text-white/50 leading-relaxed">{item.a}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center p-8 border border-white/5 rounded-2xl bg-white/[0.02]">
          <p className="text-white/60 mb-4 text-sm">{t('cta.ready')}</p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
          >
            {t('cta.seePlans')}
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
              <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </main>
    </div>
  )
}
import { useTranslations } from 'next-intl'
import UploadSection from '@/components/UploadSection'
import Features from '@/components/Features'

export default function Home() {
  const t = useTranslations('home')

  return (
    <main className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb absolute w-[600px] h-[600px] rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #00e5a0, transparent)', top: '-200px', right: '-100px' }} />
        <div className="orb orb-2 absolute w-[400px] h-[400px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #00e5a0, transparent)', bottom: '10%', left: '-100px' }} />
        <div className="orb orb-3 absolute w-[300px] h-[300px] rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, #00b37e, transparent)', top: '40%', left: '40%' }} />
      </div>

      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/20 bg-accent/5 text-accent text-xs mb-8 font-body">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M6 1l1.12 2.27L10 3.77l-2 1.95.47 2.75L6 7.27l-2.47 1.2.47-2.75-2-1.95 2.88-.5L6 1z"/>
          </svg>
          {t('badge')}
        </div>

        <h1 className="font-display text-5xl md:text-7xl font-800 leading-none tracking-tight mb-6">
          {t('headline')}<br />
          <span style={{ color: '#00e5a0' }}>{t('headlineAccent')}</span>
        </h1>

        <p className="text-muted text-base md:text-lg max-w-lg mx-auto leading-relaxed font-body mb-12">
          {t('description')}
        </p>

        <UploadSection />
      </section>

      <Features />
    </main>
  )
}
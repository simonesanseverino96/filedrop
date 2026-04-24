import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import DownloadClient from '@/components/DownloadClient'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata')
  return {
    title: 'Download — VaultTransfer',
    description: t('description'),
  }
}

export default async function DownloadPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const t = await getTranslations('download')

  return (
    <main className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb absolute w-[500px] h-[500px] rounded-full opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, #00e5a0, transparent)', top: '-150px', left: '-100px' }} />
        <div className="orb orb-2 absolute w-[350px] h-[350px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #00e5a0, transparent)', bottom: '5%', right: '-80px' }} />
      </div>

      <header className="relative z-10 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v8M5 7l3 3 3-3M3 12h10" stroke="#0a0a0f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-display text-xl font-700 tracking-tight text-paper">VaultTransfer</span>
          </a>
          <div className="flex items-center gap-2 text-xs text-muted font-body">
            <span className="w-2 h-2 rounded-full bg-accent inline-block animate-pulse" />
            {t('secureDownload').replace('🔒 ', '').split('·')[0].trim()}
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-lg mx-auto px-6 pt-16 pb-20">
        <DownloadClient token={token} />
      </div>
    </main>
  )
}
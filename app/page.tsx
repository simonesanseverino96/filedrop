import UploadSection from '@/components/UploadSection'
import Features from '@/components/Features'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb absolute w-[600px] h-[600px] rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #00e5a0, transparent)', top: '-200px', right: '-100px' }} />
        <div className="orb orb-2 absolute w-[400px] h-[400px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #00e5a0, transparent)', bottom: '10%', left: '-100px' }} />
        <div className="orb orb-3 absolute w-[300px] h-[300px] rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, #00b37e, transparent)', top: '40%', left: '40%' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v8M5 7l3 3 3-3M3 12h10" stroke="#0a0a0f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-display text-xl font-700 tracking-tight text-paper">VaultTransfer</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted font-body">
            <span className="w-2 h-2 rounded-full bg-accent inline-block animate-pulse-slow" />
            E2E Encrypted · GDPR Compliant
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/20 bg-accent/5 text-accent text-xs mb-8 font-body">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M6 1l1.12 2.27L10 3.77l-2 1.95.47 2.75L6 7.27l-2.47 1.2.47-2.75-2-1.95 2.88-.5L6 1z"/>
          </svg>
          Nessun account richiesto · Gratis fino a 2GB
        </div>

        <h1 className="font-display text-5xl md:text-7xl font-800 leading-none tracking-tight mb-6">
          Condividi file<br />
          <span style={{ color: '#00e5a0' }}>senza compromessi.</span>
        </h1>

        <p className="text-muted text-base md:text-lg max-w-lg mx-auto leading-relaxed font-body mb-12">
          Link cifrati con scadenza automatica, protezione password, limite di download.
          I tuoi file viaggiano sicuri — e spariscono quando decidi tu.
        </p>

        <UploadSection />
      </section>

      <Features />
      <Footer />
    </main>
  )
}
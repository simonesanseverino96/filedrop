'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0a0a0f] mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <img src="/favicon.svg" alt="VaultTransfer" className="w-7 h-7" />
              <span className="font-bold text-white text-base tracking-tight">VaultTransfer</span>
            </div>
            <p className="text-xs text-white/40 leading-relaxed">
              Trasferimento file sicuro e veloce. GDPR compliant, server europei.
            </p>
          </div>

          {/* Prodotto */}
          <div>
            <h4 className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-4">Prodotto</h4>
            <ul className="space-y-2.5">
              <li><Link href="/prezzi" className="text-sm text-white/40 hover:text-white transition-colors">Prezzi</Link></li>
              <li><Link href="/faq" className="text-sm text-white/40 hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/dashboard" className="text-sm text-white/40 hover:text-white transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          {/* Legale */}
          <div>
            <h4 className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-4">Legale</h4>
            <ul className="space-y-2.5">
              <li><Link href="/privacy" className="text-sm text-white/40 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-white/40 hover:text-white transition-colors">Termini di Servizio</Link></li>
            </ul>
          </div>

          {/* Contatti */}
          <div>
            <h4 className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-4">Contatti</h4>
            <ul className="space-y-2.5">
              <li>
                <a href="mailto:support@vaultransfer.com" className="text-sm text-white/40 hover:text-white transition-colors">
                  support@vaultransfer.com
                </a>
              </li>
              <li>
                <a href="mailto:privacy@vaultransfer.com" className="text-sm text-white/40 hover:text-white transition-colors">
                  privacy@vaultransfer.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/25">© {new Date().getFullYear()} VaultTransfer. Tutti i diritti riservati.</p>
          <p className="text-xs text-white/25">🇪🇺 Server in Europa · GDPR Compliant · TLS 1.3</p>
        </div>
      </div>
    </footer>
  )
}

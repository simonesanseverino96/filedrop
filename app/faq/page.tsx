'use client'

import { useState } from 'react'
import Link from 'next/link'
import Footer from '@/components/Footer'

const faqs = [
  {
    category: 'Generale',
    items: [
      {
        q: 'Cos\'è VaultTransfer?',
        a: 'VaultTransfer è un servizio di trasferimento file sicuro. Puoi inviare file di grandi dimensioni a chiunque tramite un link protetto, senza bisogno che il destinatario abbia un account.',
      },
      {
        q: 'Devo registrarmi per usarlo?',
        a: 'No. Puoi inviare file gratuitamente senza registrazione. Creare un account ti permette di accedere a funzionalità avanzate come upload fino a 50 GB, link personalizzati e statistiche di download.',
      },
      {
        q: 'Per quanto tempo sono disponibili i miei file?',
        a: 'Con il piano Free i link scadono dopo 7 giorni. Con Pro dopo 30 giorni. Con Business puoi impostare scadenze personalizzate o mantenere i file a tempo indeterminato.',
      },
    ],
  },
  {
    category: 'Sicurezza',
    items: [
      {
        q: 'I miei file sono al sicuro?',
        a: 'Sì. Tutti i trasferimenti viaggiano su HTTPS con TLS 1.3. I file vengono eliminati automaticamente alla scadenza del link. I server sono in Europa e siamo pienamente GDPR compliant.',
      },
      {
        q: 'Chi può vedere i miei file?',
        a: 'Solo chi possiede il link può accedere ai file. Puoi aggiungere una password aggiuntiva per una protezione extra (disponibile con i piani a pagamento). Il nostro staff non accede mai ai contenuti.',
      },
      {
        q: 'I file vengono analizzati o scansionati?',
        a: 'Eseguiamo una scansione antivirus automatica per proteggere i destinatari, ma non analizziamo il contenuto dei file per scopi commerciali o pubblicitari.',
      },
    ],
  },
  {
    category: 'Piani e Pagamenti',
    items: [
      {
        q: 'Quali metodi di pagamento accettate?',
        a: 'Accettiamo tutte le principali carte di credito e debito (Visa, Mastercard, American Express) tramite Stripe. I pagamenti sono sicuri e non memorizziamo i dati della carta.',
      },
      {
        q: 'Posso cambiare piano in qualsiasi momento?',
        a: 'Sì, puoi fare upgrade o downgrade in qualsiasi momento. In caso di upgrade, la differenza di prezzo viene calcolata proporzionalmente per il periodo rimanente. In caso di downgrade, il piano attuale rimane attivo fino alla fine del periodo pagato.',
      },
      {
        q: 'Come funziona lo sconto annuale?',
        a: 'Scegliendo la fatturazione annuale ottieni il 20% di sconto rispetto al piano mensile. Il pagamento avviene in un\'unica soluzione anticipata e il piano è attivo per 12 mesi.',
      },
      {
        q: 'Posso richiedere un rimborso?',
        a: 'Offriamo un rimborso completo entro 14 giorni dall\'acquisto se non sei soddisfatto. Dopo i 14 giorni non è possibile richiedere rimborsi parziali.',
      },
    ],
  },
  {
    category: 'Tecnico',
    items: [
      {
        q: 'Qual è la dimensione massima dei file?',
        a: 'Piano Free: 2 GB per file. Piano Pro: 50 GB per file. Piano Business: 200 GB per file. Non ci sono limiti al numero di file che puoi inviare.',
      },
      {
        q: 'Quali formati di file sono supportati?',
        a: 'Supportiamo qualsiasi tipo di file: documenti, immagini, video, archivi ZIP, file di progetto, eseguibili, ecc. Non ci sono restrizioni sui formati.',
      },
      {
        q: 'Il servizio funziona su tutti i dispositivi?',
        a: 'Sì. VaultTransfer funziona su qualsiasi dispositivo con un browser moderno: PC, Mac, smartphone Android e iOS, tablet. Non è richiesta nessuna app.',
      },
    ],
  },
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null)

  const toggle = (key: string) => {
    setOpenIndex(openIndex === key ? null : key)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      {/* Nav */}
      <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <svg viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.5" className="w-4 h-4">
              <path d="M8 2v5M5 5h6M4 10c0 2.2 1.8 4 4 4s4-1.8 4-4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-bold tracking-tight">VaultTransfer</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/prezzi" className="text-sm text-white/50 hover:text-white transition-colors">Prezzi</Link>
          <Link href="/faq" className="text-sm text-white transition-colors">FAQ</Link>
          <Link href="/login" className="text-sm bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-1.5 rounded-lg transition-colors">
            Accedi
          </Link>
        </div>
      </nav>

      <main className="flex-1 max-w-3xl mx-auto px-6 py-20 w-full">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs text-white/50 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 inline-block" />
            Domande frequenti
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">Tutto quello che<br/>vuoi sapere</h1>
          <p className="text-white/40 text-lg">
            Non trovi risposta?{' '}
            <a href="mailto:support@vaultransfer.com" className="text-violet-400 hover:text-violet-300 transition-colors underline underline-offset-2">
              Scrivici
            </a>
          </p>
        </div>

        {/* FAQ Accordion by category */}
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
                      className={`border rounded-xl transition-colors ${
                        isOpen ? 'border-white/10 bg-white/5' : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]'
                      }`}
                    >
                      <button
                        onClick={() => toggle(key)}
                        className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
                      >
                        <span className="text-sm font-medium text-white/90">{item.q}</span>
                        <svg
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
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

        {/* CTA bottom */}
        <div className="mt-16 text-center p-8 border border-white/5 rounded-2xl bg-white/[0.02]">
          <p className="text-white/60 mb-4 text-sm">Pronto a iniziare?</p>
          <Link
            href="/prezzi"
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
          >
            Vedi i piani
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
              <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}

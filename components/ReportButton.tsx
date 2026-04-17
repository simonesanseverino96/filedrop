'use client'

import { useState } from 'react'

interface Props {
  token: string
}

export default function ReportButton({ token }: Props) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleReport = async () => {
    if (!reason.trim()) return
    setLoading(true)

    try {
      await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, reason, email }),
      })
      setSent(true)
    } catch {}
    setLoading(false)
  }

  if (sent) {
    return (
      <p className="text-center text-xs text-muted font-body mt-4">
        ✓ Segnalazione inviata. Grazie per averci aiutato a mantenere il servizio sicuro.
      </p>
    )
  }

  return (
    <div className="mt-4">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full text-xs text-muted hover:text-red-400 font-body transition-colors py-2"
        >
          🚨 Segnala contenuto inappropriato
        </button>
      ) : (
        <div className="bg-surface border border-red-500/20 rounded-xl p-4 space-y-3">
          <p className="text-xs text-red-400 font-body font-600">Segnala contenuto illegale o inappropriato</p>

          <div>
            <label className="text-xs text-muted font-body mb-1 block">Motivo della segnalazione *</label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full bg-surface-2 border border-white/5 rounded-lg px-3 py-2 text-sm text-paper font-body focus:outline-none focus:border-red-500/50 transition-colors"
            >
              <option value="">Seleziona un motivo...</option>
              <option value="csam">Materiale che sfrutta minori (CSAM)</option>
              <option value="malware">Malware o virus</option>
              <option value="copyright">Violazione copyright</option>
              <option value="illegal">Contenuto illegale</option>
              <option value="phishing">Phishing o truffa</option>
              <option value="other">Altro</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-muted font-body mb-1 block">La tua email (opzionale, per aggiornamenti)</label>
            <input
              type="email"
              placeholder="tu@esempio.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-surface-2 border border-white/5 rounded-lg px-3 py-2 text-sm text-paper placeholder-muted font-body focus:outline-none focus:border-red-500/50 transition-colors"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleReport}
              disabled={!reason || loading}
              className="flex-1 py-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg text-xs font-display font-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Invio...' : 'Invia segnalazione'}
            </button>
            <button
              onClick={() => setOpen(false)}
              className="px-4 py-2 bg-surface-2 text-muted hover:text-paper rounded-lg text-xs font-body transition-colors"
            >
              Annulla
            </button>
          </div>

          <p className="text-xs text-muted font-body">
            Le segnalazioni vengono esaminate entro 72 ore. Per emergenze scrivi a{' '}
            <a href="mailto:abuse@vaultransfer.com" className="text-red-400 hover:underline">
              abuse@vaultransfer.com
            </a>
          </p>
        </div>
      )}
    </div>
  )
}
'use client'

import { useEffect, useState } from 'react'

interface ApiKey {
  id: string
  name: string
  key_prefix: string
  created_at: string
  last_used_at: string | null
  is_active: boolean
}

export default function ApiKeysSection() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [revealedKey, setRevealedKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => { fetchKeys() }, [])

  const fetchKeys = async () => {
    try {
      const res = await fetch('/api/keys')
      const data = await res.json()
      setKeys(data.keys || [])
    } catch {}
    setLoading(false)
  }

  const createKey = async () => {
    if (!newKeyName.trim()) return
    setCreating(true)
    try {
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName }),
      })
      const data = await res.json()
      if (data.key) {
        setRevealedKey(data.key)
        setNewKeyName('')
        fetchKeys()
      }
    } catch {}
    setCreating(false)
  }

  const revokeKey = async (id: string) => {
    await fetch('/api/keys', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    fetchKeys()
  }

  const copyKey = async () => {
    if (!revealedKey) return
    await navigator.clipboard.writeText(revealedKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-surface border border-white/5 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display text-lg font-700 text-paper">API Keys</h3>
          <p className="text-xs text-muted font-body mt-1">Usa le API key per integrare VaultTransfer nel tuo codice</p>
        </div>
      </div>

      {/* Revealed key alert */}
      {revealedKey && (
        <div className="mb-6 p-4 bg-accent/10 border border-accent/20 rounded-xl">
          <p className="text-xs text-accent font-body mb-2">⚠️ Copia questa key ora — non sarà più visibile!</p>
          <div className="flex items-center gap-3">
            <code className="flex-1 text-xs text-paper font-body bg-surface-2 rounded-lg px-3 py-2 truncate">
              {revealedKey}
            </code>
            <button
              onClick={copyKey}
              className={`px-3 py-2 rounded-lg text-xs font-display font-600 transition-all flex-shrink-0 ${
                copied ? 'bg-accent/20 text-accent' : 'bg-accent text-ink hover:bg-accent-dim'
              }`}
            >
              {copied ? '✓ Copiata' : 'Copia'}
            </button>
          </div>
          <button onClick={() => setRevealedKey(null)} className="text-xs text-muted hover:text-paper font-body mt-2 transition-colors">
            Ho salvato la key, chiudi →
          </button>
        </div>
      )}

      {/* Create new key */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Nome della key (es. Produzione)"
          value={newKeyName}
          onChange={e => setNewKeyName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && createKey()}
          className="flex-1 bg-surface-2 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-paper placeholder-muted font-body focus:outline-none focus:border-accent/50 transition-colors"
        />
        <button
          onClick={createKey}
          disabled={creating || !newKeyName.trim()}
          className="px-4 py-2.5 bg-accent text-ink rounded-xl text-sm font-display font-600 hover:bg-accent-dim transition-colors disabled:opacity-50 flex-shrink-0"
        >
          {creating ? '...' : '+ Crea key'}
        </button>
      </div>

      {/* Keys list */}
      {loading ? (
        <div className="h-20 bg-surface-2 rounded-xl animate-pulse" />
      ) : keys.length === 0 ? (
        <p className="text-sm text-muted font-body text-center py-8">Nessuna API key ancora. Creane una!</p>
      ) : (
        <div className="space-y-2">
          {keys.map(key => (
            <div key={key.id} className="flex items-center gap-3 bg-surface-2 rounded-xl px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-paper font-body">{key.name}</p>
                <code className="text-xs text-muted font-body">{key.key_prefix}</code>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-muted font-body">
                  {key.last_used_at
                    ? `Usata ${new Date(key.last_used_at).toLocaleDateString('it-IT')}`
                    : 'Mai usata'}
                </p>
              </div>
              <button
                onClick={() => revokeKey(key.id)}
                className="text-xs text-red-400 hover:text-red-300 font-body transition-colors flex-shrink-0"
              >
                Revoca
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Docs */}
      <div className="mt-6 pt-6 border-t border-white/5">
        <p className="text-xs text-muted font-body mb-3 uppercase tracking-widest">Documentazione rapida</p>
        <div className="space-y-3">
          <div className="bg-surface-2 rounded-xl p-4">
            <p className="text-xs text-accent font-body mb-2">POST /api/v1/upload — Crea trasferimento</p>
            <pre className="text-xs text-muted font-body overflow-x-auto">{`curl -X POST https://vaultransfer.com/api/v1/upload \\
  -H "Authorization: Bearer vt_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "files": [{"filename":"file.pdf","size":1024,"storagePath":"..."}],
    "expiry": "7",
    "maxDownloads": 10
  }'`}</pre>
          </div>
          <div className="bg-surface-2 rounded-xl p-4">
            <p className="text-xs text-accent font-body mb-2">GET /api/v1/transfers — Lista trasferimenti</p>
            <pre className="text-xs text-muted font-body overflow-x-auto">{`curl https://vaultransfer.com/api/v1/transfers \\
  -H "Authorization: Bearer vt_live_..."`}</pre>
          </div>
        </div>
      </div>
    </div>
  )
}
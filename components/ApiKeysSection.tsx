'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { getBrowserClient } from '@/lib/supabase'
import { useToast } from '@/components/Toast'

const supabase = getBrowserClient()

interface ApiKey {
  id: string
  name: string
  key_prefix: string
  created_at: string
  last_used_at: string | null
  is_active: boolean
}

export default function ApiKeysSection() {
  const t = useTranslations('apiKeys')
  const { toast } = useToast()
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [revealedKey, setRevealedKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token ?? null
  }

  const fetchKeys = async (retry = 0) => {
    try {
      const token = await getToken()
      if (!token && retry < 3) {
        setTimeout(() => fetchKeys(retry + 1), 500)
        return
      }
      const res = await fetch('/api/keys', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      })
      const data = await res.json()
      setKeys(data.keys || [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchKeys() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const createKey = async () => {
    if (!newKeyName.trim()) return
    setCreating(true)
    try {
      const token = await getToken()
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ name: newKeyName }),
      })
      const data = await res.json()
      if (data.key) {
        setRevealedKey(data.key)
        setNewKeyName('')
        fetchKeys()
        toast('API key created — copy it now, it won\'t be shown again', 'info')
      }
    } catch {}
    setCreating(false)
  }

  const revokeKey = async (id: string) => {
    if (!confirm(t('revokeConfirm'))) return
    try {
      const token = await getToken()
      if (!token) { toast(t('sessionExpired'), 'error'); return }

      const res = await fetch('/api/keys', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, accessToken: token }),
      })
      if (res.ok) {
        fetchKeys()
        toast('API key revoked')
      } else {
        const data = await res.json()
        toast(data.error ? t(`errors.${data.error}`) : t('revokeError'), 'error')
      }
    } catch {
      toast(t('connectionError'), 'error')
    }
  }

  const copyKey = async () => {
    if (!revealedKey) return
    await navigator.clipboard.writeText(revealedKey)
    setCopied(true)
    toast('API key copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-surface border border-white/5 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display text-lg font-700 text-paper">{t('title')}</h3>
          <p className="text-xs text-muted font-body mt-1">{t('subtitle')}</p>
        </div>
      </div>

      {revealedKey && (
        <div className="mb-6 p-4 bg-accent/10 border border-accent/20 rounded-xl">
          <p className="text-xs text-accent font-body mb-2">{t('warning')}</p>
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
              {copied ? t('copied') : t('copy')}
            </button>
          </div>
          <button
            onClick={() => setRevealedKey(null)}
            className="text-xs text-muted hover:text-paper font-body mt-2 transition-colors"
          >
            {t('saved')}
          </button>
        </div>
      )}

      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder={t('placeholder')}
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
          {creating ? t('creating') : t('create')}
        </button>
      </div>

      {loading ? (
        <div className="h-20 bg-surface-2 rounded-xl animate-pulse" />
      ) : keys.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-12 h-12 rounded-full bg-surface-2 border border-white/10 flex items-center justify-center mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00e5a0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/>
            </svg>
          </div>
          <p className="text-sm text-paper font-body mb-1">{t('noKeys')}</p>
          <p className="text-xs text-muted font-body">{t('noKeysHint', { defaultValue: 'Create your first key above to start using the API.' })}</p>
        </div>
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
                    ? t('lastUsed', { date: new Date(key.last_used_at).toLocaleDateString() })
                    : t('neverUsed')}
                </p>
              </div>
              <button
                onClick={() => revokeKey(key.id)}
                className="text-xs text-red-400 hover:text-red-300 font-body transition-colors flex-shrink-0"
              >
                {t('revoke')}
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-white/5">
        <p className="text-xs text-muted font-body mb-3 uppercase tracking-widest">{t('docsTitle')}</p>
        <div className="space-y-3">
          <div className="bg-surface-2 rounded-xl p-4">
            <p className="text-xs text-accent font-body mb-2">{t('docsUpload')}</p>
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
            <p className="text-xs text-accent font-body mb-2">{t('docsTransfers')}</p>
            <pre className="text-xs text-muted font-body overflow-x-auto">{`curl https://vaultransfer.com/api/v1/transfers \\
  -H "Authorization: Bearer vt_live_..."`}</pre>
          </div>
        </div>
      </div>
    </div>
  )
}
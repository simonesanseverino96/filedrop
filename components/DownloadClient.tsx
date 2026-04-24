'use client'
import ReportButton from './ReportButton'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { formatBytes, formatExpiry } from '@/lib/utils'

interface TransferInfo {
  token: string
  expiresAt: string
  hasPassword: boolean
  message: string | null
  senderEmail: string | null
  downloadCount: number
  maxDownloads: number | null
  totalSize: number
  files: Array<{ id: string; filename: string; size: number; mimeType: string }>
}

type Status = 'loading' | 'needs-password' | 'ready' | 'error' | 'expired'

export default function DownloadClient({ token }: { token: string }) {
  const t = useTranslations('download')
  const [status, setStatus] = useState<Status>('loading')
  const [transfer, setTransfer] = useState<TransferInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState<string | null>(null)

  useEffect(() => {
    fetchTransferInfo()
  }, [token])

  const fetchTransferInfo = async () => {
    setStatus('loading')
    try {
      const res = await fetch(`/api/transfer/${token}`)
      const data = await res.json()

      if (!res.ok) {
        if (res.status === 410) { setStatus('expired'); return }
        setError(data.error || t('errorDesc'))
        setStatus('error')
        return
      }

      setTransfer(data)
      setStatus(data.hasPassword ? 'needs-password' : 'ready')
    } catch {
      setError(t('errorDesc'))
      setStatus('error')
    }
  }

  const verifyPassword = async () => {
    if (!transfer) return
    setPasswordError(null)

    const res = await fetch(`/api/download/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, fileId: transfer.files[0]?.id }),
    })
    const data = await res.json()

    if (res.status === 401) {
      setPasswordError(t('passwordError'))
      return
    }
    if (!res.ok) {
      setPasswordError(data.error || t('passwordVerifyError'))
      return
    }

    setStatus('ready')
  }

  const downloadFile = async (fileId: string, filename: string) => {
    if (!transfer) return
    setDownloading(fileId)

    try {
      const res = await fetch(`/api/download/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, fileId }),
      })
      const data = await res.json()

      if (!res.ok) {
        if (data.requiresPassword) { setStatus('needs-password'); return }
        setError(data.error || t('downloading'))
        return
      }

      const a = document.createElement('a')
      a.href = data.url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch {
      setError(t('errorDesc'))
    } finally {
      setDownloading(null)
    }
  }

  const downloadAll = async () => {
    if (!transfer) return
    for (const file of transfer.files) {
      await downloadFile(file.id, file.filename)
      await new Promise(r => setTimeout(r, 300))
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <div className="w-12 h-12 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
        <p className="text-sm text-muted font-body">{t('loading')}</p>
      </div>
    )
  }

  if (status === 'expired') {
    return (
      <div className="text-center py-16 animate-fade-up">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h2 className="font-display text-2xl font-700 text-paper mb-2">{t('expiredTitle')}</h2>
        <p className="text-muted text-sm font-body">{t('expiredDesc')}</p>
        <a href="/" className="inline-block mt-8 px-6 py-3 bg-accent text-ink rounded-xl text-sm font-display font-600 hover:bg-accent-dim transition-colors">
          {t('newTransfer')}
        </a>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="text-center py-16 animate-fade-up">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </div>
        <h2 className="font-display text-2xl font-700 text-paper mb-2">{t('errorTitle')}</h2>
        <p className="text-muted text-sm font-body">{error || t('errorDesc')}</p>
        <a href="/" className="inline-block mt-8 px-6 py-3 bg-accent text-ink rounded-xl text-sm font-display font-600 hover:bg-accent-dim transition-colors">
          {t('backHome')}
        </a>
      </div>
    )
  }

  if (status === 'needs-password') {
    return (
      <div className="animate-fade-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-5">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00e5a0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h2 className="font-display text-2xl font-700 text-paper mb-2">{t('protectedTitle')}</h2>
          <p className="text-muted text-sm font-body">{t('protectedDesc')}</p>
        </div>

        <div className="bg-surface border border-white/5 rounded-2xl p-6">
          <label className="text-xs text-muted mb-2 block font-body uppercase tracking-widest">{t('passwordLabel')}</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && verifyPassword()}
            autoFocus
            className="w-full bg-surface-2 border border-white/5 rounded-xl px-4 py-3 text-paper placeholder-muted font-body focus:outline-none focus:border-accent/50 transition-colors mb-3"
          />
          {passwordError && (
            <p className="text-red-400 text-xs mb-3 font-body">{passwordError}</p>
          )}
          <button
            onClick={verifyPassword}
            disabled={!password}
            className="w-full py-3 bg-accent text-ink rounded-xl font-display font-600 text-sm hover:bg-accent-dim transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('accessFiles')}
          </button>
        </div>
      </div>
    )
  }

  // status === 'ready'
  return (
    <div className="animate-fade-up">
      <div className="bg-surface border border-white/5 rounded-2xl p-6 mb-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-muted font-body uppercase tracking-widest mb-1">{t('readyLabel')}</p>
            <h2 className="font-display text-xl font-700 text-paper">
              {transfer!.files.length} file{transfer!.files.length !== 1 ? 's' : ''}
            </h2>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted font-body">{t('totalSize')}</p>
            <p className="text-sm font-display font-600 text-paper">{formatBytes(transfer!.totalSize)}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="px-2 py-1 bg-accent/10 border border-accent/20 rounded-lg text-xs text-accent font-body">
            {t('expiresIn', { expiry: formatExpiry(transfer!.expiresAt) })}
          </span>
          {transfer!.maxDownloads && (
            <span className="px-2 py-1 bg-surface-2 border border-white/5 rounded-lg text-xs text-muted font-body">
              {t('downloadCount', { count: transfer!.downloadCount, max: transfer!.maxDownloads })}
            </span>
          )}
          {transfer!.senderEmail && (
            <span className="px-2 py-1 bg-surface-2 border border-white/5 rounded-lg text-xs text-muted font-body">
              ✉️ {transfer!.senderEmail}
            </span>
          )}
        </div>

        {transfer!.message && (
          <div className="mt-4 p-3 bg-surface-2 rounded-xl border-l-2 border-accent/50">
            <p className="text-sm text-muted font-body italic">"{transfer!.message}"</p>
          </div>
        )}
      </div>

      <div className="space-y-2 mb-4">
        {transfer!.files.map((file) => (
          <div key={file.id} className="stagger-item flex items-center gap-3 bg-surface border border-white/5 rounded-xl px-4 py-3 hover:border-accent/20 transition-colors">
            <div className="w-9 h-9 rounded-lg bg-surface-2 flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00e5a0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-paper truncate font-body">{file.filename}</p>
              <p className="text-xs text-muted font-body">{formatBytes(file.size)}</p>
            </div>
            <button
              onClick={() => downloadFile(file.id, file.filename)}
              disabled={downloading === file.id}
              className="px-3 py-1.5 bg-accent/10 hover:bg-accent text-accent hover:text-ink border border-accent/20 hover:border-accent rounded-lg text-xs font-display font-600 transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              {downloading === file.id ? (
                <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
                  <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              )}
              {t('scarica')}
            </button>
          </div>
        ))}
      </div>

      {transfer!.files.length > 1 && (
        <button
          onClick={downloadAll}
          disabled={!!downloading}
          className="w-full py-4 bg-accent text-ink rounded-xl font-display font-600 text-base hover:bg-accent-dim transition-all active:scale-[0.98] shadow-lg shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {downloading ? t('downloadInProgress') : t('downloadAll')}
        </button>
      )}

      {transfer!.files.length === 1 && (
        <button
          onClick={() => downloadFile(transfer!.files[0].id, transfer!.files[0].filename)}
          disabled={!!downloading}
          className="w-full py-4 bg-accent text-ink rounded-xl font-display font-600 text-base hover:bg-accent-dim transition-all active:scale-[0.98] shadow-lg shadow-accent/20 disabled:opacity-50"
        >
          {downloading ? t('downloadInProgress') : t('downloadFile')}
        </button>
      )}

      <p className="text-center text-xs text-muted font-body mt-4">
        {t('secureDownload')}
      </p>

      <ReportButton token={token} />
    </div>
  )
}
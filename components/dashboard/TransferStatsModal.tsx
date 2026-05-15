'use client'

import { formatBytes, formatExpiry } from '@/lib/utils'

interface Transfer {
  id: string
  token: string
  created_at: string
  expires_at: string
  download_count: number
  max_downloads: number | null
  total_size: number
  message: string | null
}

interface Props {
  transfer: Transfer
  onClose: () => void
}

export default function TransferStatsModal({ transfer, onClose }: Props) {
  const isExpired = new Date(transfer.expires_at) < new Date()
  const daysOld = Math.floor((Date.now() - new Date(transfer.created_at).getTime()) / 86_400_000)
  const limitUsedPct = transfer.max_downloads
    ? Math.min(Math.round((transfer.download_count / transfer.max_downloads) * 100), 100)
    : null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-white/10 rounded-2xl p-6 w-full max-w-md animate-fade-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-lg font-700 text-paper">Transfer Analytics</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-muted hover:text-paper transition-colors p-1 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {transfer.message && (
          <p className="text-sm text-paper font-body mb-5 truncate">{transfer.message}</p>
        )}

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-surface-2 rounded-xl p-4">
            <p className="text-2xl font-display font-700 text-paper">{transfer.download_count}</p>
            <p className="text-xs text-muted font-body mt-1">Total downloads</p>
          </div>
          <div className="bg-surface-2 rounded-xl p-4">
            <p className="text-2xl font-display font-700 text-paper">{formatBytes(transfer.total_size)}</p>
            <p className="text-xs text-muted font-body mt-1">Transfer size</p>
          </div>
          <div className="bg-surface-2 rounded-xl p-4">
            <p className="text-2xl font-display font-700 text-paper">{daysOld}d</p>
            <p className="text-xs text-muted font-body mt-1">Age</p>
          </div>
          <div className="bg-surface-2 rounded-xl p-4">
            <p className={`text-2xl font-display font-700 ${isExpired ? 'text-red-400' : 'text-accent'}`}>
              {isExpired ? 'Expired' : formatExpiry(transfer.expires_at)}
            </p>
            <p className="text-xs text-muted font-body mt-1">Status</p>
          </div>
        </div>

        {transfer.max_downloads !== null && limitUsedPct !== null && (
          <div className="mb-5">
            <div className="flex justify-between text-xs text-muted font-body mb-1.5">
              <span>Download limit</span>
              <span>{transfer.download_count} / {transfer.max_downloads}</span>
            </div>
            <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${limitUsedPct >= 90 ? 'bg-red-400' : 'bg-accent'}`}
                style={{ width: `${limitUsedPct}%` }}
              />
            </div>
          </div>
        )}

        <div className="text-xs text-muted font-body pt-4 border-t border-white/5 space-y-1">
          <p>Created {new Date(transfer.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p className="text-white/20">Unique visitors &amp; geographic data — Business plan (coming soon)</p>
        </div>
      </div>
    </div>
  )
}

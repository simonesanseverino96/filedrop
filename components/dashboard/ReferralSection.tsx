'use client'

import { useState, useEffect } from 'react'
import { getBrowserClient } from '@/lib/supabase'
import { useToast } from '@/components/Toast'

interface ReferralStats { referrals: number; pending: number }

export default function ReferralSection() {
  const [refCode, setRefCode] = useState<string | null>(null)
  const [stats, setStats] = useState<ReferralStats>({ referrals: 0, pending: 0 })
  const { toast } = useToast()

  useEffect(() => {
    const supabase = getBrowserClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setRefCode(user.id.slice(0, 8))
        fetch('/api/referral')
          .then(r => r.json())
          .then(d => setStats(d))
          .catch(() => {})
      }
    })
  }, [])

  const referralLink = refCode
    ? `${typeof window !== 'undefined' ? window.location.origin : 'https://vaultransfer.com'}/?ref=${refCode}`
    : ''

  const copyLink = async () => {
    if (!referralLink) return
    await navigator.clipboard.writeText(referralLink)
    toast('Referral link copied!')
  }

  return (
    <div className="bg-surface border border-white/5 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-display text-lg font-700 text-paper">Refer &amp; Earn</h3>
          <p className="text-xs text-muted font-body mt-1">Share VaultTransfer — earn 1 free Pro month per 3 sign-ups</p>
        </div>
        <span className="px-2 py-0.5 rounded-full text-xs font-body bg-accent/10 text-accent border border-accent/20">
          Coming soon
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-surface-2 rounded-xl p-4 text-center">
          <p className="text-2xl font-display font-700 text-paper">{stats.referrals}</p>
          <p className="text-xs text-muted font-body mt-1">Successful referrals</p>
        </div>
        <div className="bg-surface-2 rounded-xl p-4 text-center">
          <p className="text-2xl font-display font-700 text-paper">{stats.pending}</p>
          <p className="text-xs text-muted font-body mt-1">Pending</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <code className="flex-1 text-xs text-accent font-body bg-surface-2 rounded-xl px-3 py-2.5 truncate">
          {referralLink || '…'}
        </code>
        <button
          onClick={copyLink}
          disabled={!referralLink}
          className="px-4 py-2.5 bg-accent text-ink rounded-xl text-sm font-display font-600 hover:bg-accent-dim transition-colors flex-shrink-0 disabled:opacity-40"
        >
          Copy
        </button>
      </div>

      <p className="text-xs text-muted font-body mt-4 pt-4 border-t border-white/5">
        Reward tracking launches soon. Your referral link is active — share it now to get credit when the system goes live.
      </p>
    </div>
  )
}

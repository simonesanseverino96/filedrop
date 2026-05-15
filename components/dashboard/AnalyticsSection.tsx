'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { formatBytes } from '@/lib/utils'

interface AnalyticsData {
  totalTransfers: number
  last30DaysTransfers: number
  totalSize: number
  totalDownloads: number
  activeTransfers: number
  expiredTransfers: number
  chartData: { date: string; count: number }[]
}

interface AnalyticsSectionProps {
  plan: string
  onUpgrade: (planId: string) => void
}

export default function AnalyticsSection({ plan, onUpgrade }: AnalyticsSectionProps) {
  const t = useTranslations('analytics')
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(false)

  const isFree = plan === 'free'

  useEffect(() => {
    if (!isFree) {
      setLoading(true) // eslint-disable-line react-hooks/set-state-in-effect
      fetch('/api/auth/analytics')
        .then(res => res.json())
        .then(resData => {
          if (!resData.error) {
            setData(resData)
          }
        })
        .finally(() => setLoading(false))
    }
  }, [isFree])

  if (isFree) {
    return (
      <div className="bg-surface border border-white/5 rounded-2xl p-8 text-center relative overflow-hidden group mt-8">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-2">
            <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="font-display text-xl font-700 text-paper">{t('upgradeTitle')}</h3>
          <p className="text-muted font-body text-sm max-w-md mx-auto">{t('upgradeDesc')}</p>
          <button
            onClick={() => onUpgrade('pro')}
            className="mt-4 px-5 py-2.5 bg-accent text-ink rounded-xl text-sm font-display font-600 hover:bg-accent-dim transition-colors"
          >
            {t('upgradeButton')}
          </button>
        </div>
      </div>
    )
  }

  if (loading || !data) {
    return (
      <div className="bg-surface border border-white/5 rounded-2xl p-8 text-center mt-8">
        <div className="animate-pulse flex justify-center items-center h-48">
          <p className="text-muted font-body">{t('loading')}</p>
        </div>
      </div>
    )
  }

  const maxChartCount = Math.max(...data.chartData.map(d => d.count), 1)

  return (
    <div className="mt-8 space-y-6">
      <h3 className="font-display text-lg font-700 text-paper flex items-center gap-2">
        <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        {t('title')}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-surface border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors">
          <p className="text-xs text-muted font-body mb-2">{t('totalTransfers')}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-display font-700 text-paper">{data.totalTransfers}</h3>
            <span className="text-accent font-body text-xs">+{data.last30DaysTransfers} {t('last30Days')}</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-surface border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors">
          <p className="text-xs text-muted font-body mb-2">{t('totalGb')}</p>
          <h3 className="text-2xl font-display font-700 text-paper">{formatBytes(data.totalSize)}</h3>
        </div>

        {/* Card 3 */}
        <div className="bg-surface border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors">
          <p className="text-xs text-muted font-body mb-2">{t('totalDownloads')}</p>
          <h3 className="text-2xl font-display font-700 text-paper">{data.totalDownloads}</h3>
        </div>

        {/* Card 4 */}
        <div className="bg-surface border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors">
          <p className="text-xs text-muted font-body mb-2">{t('activeVsExpired')}</p>
          <div className="flex items-baseline gap-3">
            <div className="flex flex-col">
              <span className="text-xl font-display font-700 text-accent">{data.activeTransfers}</span>
              <span className="text-[10px] text-muted uppercase font-body">{t('active')}</span>
            </div>
            <span className="text-white/10 text-xl">/</span>
            <div className="flex flex-col">
              <span className="text-xl font-display font-700 text-red-400">{data.expiredTransfers}</span>
              <span className="text-[10px] text-muted uppercase font-body">{t('expired')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-surface border border-white/5 rounded-2xl p-6">
        <h4 className="text-xs text-muted font-body mb-6 uppercase tracking-wider">{t('transfersPerDay')} <span className="lowercase normal-case opacity-60">({t('last30Days')})</span></h4>
        <div className="h-24 md:h-32 flex items-end justify-between gap-1">
          {data.chartData.map((d) => {
            const height = maxChartCount === 0 ? 0 : (d.count / maxChartCount) * 100
            return (
              <div
                key={d.date}
                className="relative group flex-1 bg-white/5 rounded-t-sm hover:bg-accent transition-all"
                style={{ height: `${Math.max(height, 5)}%` }}
              >
                {/* Tooltip */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-2 border border-white/10 text-paper font-body text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10 transition-opacity">
                  {d.date}: {d.count}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

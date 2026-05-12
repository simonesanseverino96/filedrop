export type PlanType = 'free' | 'pro' | 'business'

export interface PlanConfig {
  name: string
  price: number // EUR/mese
  maxFileSizeMB: number
  maxTotalSizeMB: number
  maxDaysExpiry: number
  maxDownloads: number | null // null = illimitati
  hasAds: boolean
  hasPasswordProtection: boolean
  hasHistory: boolean
  hasApiAccess: boolean
  stripePriceId: string | null
}

export const PLANS: Record<PlanType, PlanConfig> = {
  free: {
    name: 'Free',
    price: 0,
    maxFileSizeMB: 5120,        // 5GB
    maxTotalSizeMB: 5120,       // 5GB totali per trasferimento
    maxDaysExpiry: 7,
    maxDownloads: 5,
    hasAds: true,
    hasPasswordProtection: true,
    hasHistory: false,
    hasApiAccess: false,
    stripePriceId: null,
  },
  pro: {
    name: 'Pro',
    price: 4.99,
    maxFileSizeMB: 20480,       // 20GB
    maxTotalSizeMB: 20480,
    maxDaysExpiry: 90,
    maxDownloads: null,         // illimitati
    hasAds: false,
    hasPasswordProtection: true,
    hasHistory: true,
    hasApiAccess: false,
    stripePriceId: process.env.STRIPE_PRICE_PRO ?? null,
  },
  business: {
    name: 'Business',
    price: 14.99,
    maxFileSizeMB: 102400,      // 100GB
    maxTotalSizeMB: 102400,
    maxDaysExpiry: 90,
    maxDownloads: null,
    hasAds: false,
    hasPasswordProtection: true,
    hasHistory: true,
    hasApiAccess: true,
    stripePriceId: process.env.STRIPE_PRICE_BUSINESS ?? null,
  },
}

export function getPlanLimits(plan: PlanType): PlanConfig {
  return PLANS[plan]
}

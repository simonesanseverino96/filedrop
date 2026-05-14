import { POST } from '@/app/api/stripe/webhook/route'
import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { stripe } from '@/lib/stripe'

jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: jest.fn(),
}))

jest.mock('@/lib/stripe', () => ({
  stripe: {
    webhooks: {
      constructEvent: jest.fn(),
    },
    billingPortal: {
      sessions: { create: jest.fn() },
    },
  },
}))

const makeRequest = (body = '{}') =>
  new NextRequest('http://localhost/api/stripe/webhook', {
    method: 'POST',
    body,
    headers: { 'stripe-signature': 'sig_test_123' },
  })

describe('Stripe Webhook Handler', () => {
  let mockSupabase: any

  beforeEach(() => {
    jest.clearAllMocks()
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null }),
    }
    ;(supabaseAdmin as jest.Mock).mockReturnValue(mockSupabase)
  })

  it('returns 400 when stripe signature is invalid', async () => {
    ;(stripe.webhooks.constructEvent as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid signature')
    })

    const res = await POST(makeRequest())
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('ERR_INVALID_SIGNATURE')
  })

  describe('checkout.session.completed', () => {
    it('upgrades user plan when session has userId and plan', async () => {
      ;(stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
        type: 'checkout.session.completed',
        data: {
          object: {
            metadata: { supabase_user_id: 'user-1', plan: 'pro' },
            subscription: 'sub_abc123',
          },
        },
      })

      const res = await POST(makeRequest())
      expect(res.status).toBe(200)
      expect(mockSupabase.from).toHaveBeenCalledWith('profiles')
      expect(mockSupabase.update).toHaveBeenCalledWith({
        plan: 'pro',
        stripe_subscription_id: 'sub_abc123',
        subscription_status: 'active',
      })
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'user-1')
    })

    it('does nothing when session has no userId', async () => {
      ;(stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
        type: 'checkout.session.completed',
        data: {
          object: {
            metadata: {},
            subscription: null,
          },
        },
      })

      const res = await POST(makeRequest())
      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.received).toBe(true)
      expect(mockSupabase.update).not.toHaveBeenCalled()
    })

    it('upgrades to business plan correctly', async () => {
      ;(stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
        type: 'checkout.session.completed',
        data: {
          object: {
            metadata: { supabase_user_id: 'user-2', plan: 'business' },
            subscription: 'sub_biz456',
          },
        },
      })

      const res = await POST(makeRequest())
      expect(res.status).toBe(200)
      expect(mockSupabase.update).toHaveBeenCalledWith({
        plan: 'business',
        stripe_subscription_id: 'sub_biz456',
        subscription_status: 'active',
      })
    })
  })

  describe('customer.subscription.updated', () => {
    it('keeps plan active when subscription status is active', async () => {
      ;(stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
        type: 'customer.subscription.updated',
        data: {
          object: {
            metadata: { supabase_user_id: 'user-1', plan: 'pro' },
            status: 'active',
            items: { data: [{ current_period_end: 1800000000 }] },
          },
        },
      })

      const res = await POST(makeRequest())
      expect(res.status).toBe(200)
      expect(mockSupabase.update).toHaveBeenCalledWith(
        expect.objectContaining({
          plan: 'pro',
          subscription_status: 'active',
          subscription_ends_at: new Date(1800000000 * 1000).toISOString(),
        })
      )
    })

    it('downgrades to free when subscription is canceled', async () => {
      ;(stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
        type: 'customer.subscription.updated',
        data: {
          object: {
            metadata: { supabase_user_id: 'user-1', plan: 'pro' },
            status: 'canceled',
            items: { data: [] },
          },
        },
      })

      const res = await POST(makeRequest())
      expect(res.status).toBe(200)
      expect(mockSupabase.update).toHaveBeenCalledWith(
        expect.objectContaining({
          plan: 'free',
          subscription_status: 'canceled',
          subscription_ends_at: null,
        })
      )
    })

    it('sets subscription_ends_at to null when no period_end data', async () => {
      ;(stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
        type: 'customer.subscription.updated',
        data: {
          object: {
            metadata: { supabase_user_id: 'user-1', plan: 'pro' },
            status: 'active',
            items: { data: [] },
          },
        },
      })

      const res = await POST(makeRequest())
      expect(res.status).toBe(200)
      expect(mockSupabase.update).toHaveBeenCalledWith(
        expect.objectContaining({ subscription_ends_at: null })
      )
    })

    it('does nothing when no userId in subscription metadata', async () => {
      ;(stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
        type: 'customer.subscription.updated',
        data: {
          object: {
            metadata: {},
            status: 'active',
            items: { data: [] },
          },
        },
      })

      const res = await POST(makeRequest())
      expect(res.status).toBe(200)
      expect(mockSupabase.update).not.toHaveBeenCalled()
    })
  })

  describe('customer.subscription.deleted', () => {
    it('resets user to free plan on subscription deletion', async () => {
      ;(stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
        type: 'customer.subscription.deleted',
        data: {
          object: {
            metadata: { supabase_user_id: 'user-1' },
          },
        },
      })

      const res = await POST(makeRequest())
      expect(res.status).toBe(200)
      expect(mockSupabase.update).toHaveBeenCalledWith({
        plan: 'free',
        subscription_status: 'cancelled',
        stripe_subscription_id: null,
      })
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'user-1')
    })

    it('does nothing when no userId in deleted subscription metadata', async () => {
      ;(stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
        type: 'customer.subscription.deleted',
        data: { object: { metadata: {} } },
      })

      const res = await POST(makeRequest())
      expect(res.status).toBe(200)
      expect(mockSupabase.update).not.toHaveBeenCalled()
    })
  })

  describe('invoice.payment_failed', () => {
    it('marks profile as past_due on payment failure', async () => {
      ;(stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
        type: 'invoice.payment_failed',
        data: { object: { customer: 'cus_abc123' } },
      })

      mockSupabase.single.mockResolvedValue({ data: { id: 'user-1' } })

      const res = await POST(makeRequest())
      expect(res.status).toBe(200)
      expect(mockSupabase.update).toHaveBeenCalledWith({
        subscription_status: 'past_due',
      })
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'user-1')
    })

    it('does nothing when customer profile is not found', async () => {
      ;(stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
        type: 'invoice.payment_failed',
        data: { object: { customer: 'cus_unknown' } },
      })

      mockSupabase.single.mockResolvedValue({ data: null })

      const res = await POST(makeRequest())
      expect(res.status).toBe(200)
    })
  })

  it('returns 200 with received:true for unhandled event types', async () => {
    ;(stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
      type: 'payment_intent.created',
      data: { object: {} },
    })

    const res = await POST(makeRequest())
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.received).toBe(true)
  })
})

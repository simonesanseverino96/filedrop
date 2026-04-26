import { getStripeCustomerPortalUrl, stripe } from '@/lib/stripe'

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    billingPortal: {
      sessions: {
        create: jest.fn().mockResolvedValue({ url: 'https://billing.stripe.com/session/123' })
      }
    }
  }))
})

describe('Stripe', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('getStripeCustomerPortalUrl creates a session and returns url', async () => {
    const mockUrl = 'https://billing.stripe.com/session/123';
    (stripe.billingPortal.sessions.create as jest.Mock).mockResolvedValue({ url: mockUrl })

    const url = await getStripeCustomerPortalUrl('cus_123')

    expect(stripe.billingPortal.sessions.create).toHaveBeenCalledWith({
      customer: 'cus_123',
      return_url: 'http://localhost:3000/dashboard',
    })
    expect(url).toBe(mockUrl)
  })
})

import { getUserPlan } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: jest.fn(),
}))

describe('Auth', () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks()
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      update: jest.fn().mockReturnThis(),
    }
    ;(supabaseAdmin as jest.Mock).mockReturnValue(mockSupabase)
  })

  it('getUserPlan returns free if profile not found', async () => {
    mockSupabase.single.mockResolvedValue({ data: null })
    const plan = await getUserPlan('user_1')
    expect(plan).toBe('free')
  })

  it('getUserPlan returns current plan if active', async () => {
    mockSupabase.single.mockResolvedValue({ 
      data: { plan: 'pro', subscription_status: 'active', subscription_ends_at: null }
    })
    const plan = await getUserPlan('user_1')
    expect(plan).toBe('pro')
  })

  it('getUserPlan downgrades to free if subscription expired', async () => {
    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - 1)
    
    mockSupabase.single.mockResolvedValue({ 
      data: { plan: 'pro', subscription_status: 'canceled', subscription_ends_at: pastDate.toISOString() }
    })
    
    const plan = await getUserPlan('user_1')
    expect(plan).toBe('free')
    expect(mockSupabase.update).toHaveBeenCalledWith({ plan: 'free' })
  })
})

import { GET } from '@/app/api/auth/me/route'
import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getUserPlan } from '@/lib/auth'

jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: jest.fn(),
}))

const mockGetUser = jest.fn()

jest.mock('next/headers', () => ({
  cookies: jest.fn().mockResolvedValue({
    getAll: () => [],
    set: jest.fn(),
  }),
}))

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => ({
    auth: { getUser: mockGetUser },
  })),
}))

describe('GET /api/auth/me', () => {
  let mockAdmin: any

  beforeEach(() => {
    jest.clearAllMocks()
    mockAdmin = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    }
    ;(supabaseAdmin as jest.Mock).mockReturnValue(mockAdmin)
  })

  it('returns user:null when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const req = new NextRequest('http://localhost/api/auth/me')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.user).toBeNull()
  })

  it('returns full user info with plan when authenticated', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1', email: 'test@example.com' } },
    })
    mockAdmin.single.mockResolvedValue({ data: { plan: 'pro' } })

    const req = new NextRequest('http://localhost/api/auth/me')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.user).toEqual({
      email: 'test@example.com',
      id: 'user-1',
      plan: 'pro',
    })
  })

  it('returns free plan when profile not found', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-new', email: 'new@example.com' } },
    })
    mockAdmin.single.mockResolvedValue({ data: null })

    const req = new NextRequest('http://localhost/api/auth/me')
    const res = await GET(req)
    const json = await res.json()
    expect(json.user?.plan).toBe('free')
  })

  it('returns business plan for business users', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-biz', email: 'biz@example.com' } },
    })
    mockAdmin.single.mockResolvedValue({ data: { plan: 'business' } })

    const req = new NextRequest('http://localhost/api/auth/me')
    const res = await GET(req)
    const json = await res.json()
    expect(json.user?.plan).toBe('business')
  })

  it('returns user:null gracefully on unexpected error', async () => {
    mockGetUser.mockRejectedValue(new Error('Connection error'))

    const req = new NextRequest('http://localhost/api/auth/me')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.user).toBeNull()
  })
})

describe('getUserPlan - extended edge cases', () => {
  let mockSupabase: any

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

  it('returns business plan for active business subscription', async () => {
    mockSupabase.single.mockResolvedValue({
      data: { plan: 'business', subscription_status: 'active', subscription_ends_at: null },
    })
    const plan = await getUserPlan('user-biz')
    expect(plan).toBe('business')
  })

  it('returns pro plan when canceled but end date is in the future', async () => {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 30)
    mockSupabase.single.mockResolvedValue({
      data: {
        plan: 'pro',
        subscription_status: 'canceled',
        subscription_ends_at: futureDate.toISOString(),
      },
    })
    const plan = await getUserPlan('user-grace')
    expect(plan).toBe('pro')
    expect(mockSupabase.update).not.toHaveBeenCalled()
  })

  it('downgrades to free when subscription_ends_at is exactly now', async () => {
    const justPast = new Date()
    justPast.setMilliseconds(justPast.getMilliseconds() - 100)
    mockSupabase.single.mockResolvedValue({
      data: {
        plan: 'business',
        subscription_status: 'canceled',
        subscription_ends_at: justPast.toISOString(),
      },
    })
    const plan = await getUserPlan('user-expired')
    expect(plan).toBe('free')
    expect(mockSupabase.update).toHaveBeenCalledWith({ plan: 'free' })
  })

  it('returns free for a free-plan profile', async () => {
    mockSupabase.single.mockResolvedValue({
      data: { plan: 'free', subscription_status: null, subscription_ends_at: null },
    })
    const plan = await getUserPlan('user-free')
    expect(plan).toBe('free')
  })

  it('returns free and does not throw when profile has no subscription_ends_at', async () => {
    mockSupabase.single.mockResolvedValue({
      data: { plan: 'pro', subscription_status: 'canceled', subscription_ends_at: null },
    })
    const plan = await getUserPlan('user-no-ends')
    expect(plan).toBe('free')
    expect(mockSupabase.update).toHaveBeenCalledWith({ plan: 'free' })
  })
})

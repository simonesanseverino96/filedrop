import { NextRequest } from 'next/server'
import { middleware } from '../middleware'

const mockGetUser = jest.fn()
const mockSelect = jest.fn()
const mockEq = jest.fn()
const mockSingle = jest.fn()

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => ({
    auth: {
      getUser: mockGetUser
    },
    from: jest.fn(() => ({
      select: mockSelect.mockReturnThis(),
      eq: mockEq.mockReturnThis(),
      single: mockSingle
    }))
  }))
}))

describe('Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSelect.mockReturnThis()
    mockEq.mockReturnThis()
  })

  it('allows unauthenticated access to unprotected route', async () => {
    const req = new NextRequest('http://localhost/')
    const res = await middleware(req)
    expect(res.status).toBe(200)
  })

  it('returns 401 for unauthenticated access to /dashboard', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const req = new NextRequest('http://localhost/dashboard')
    const res = await middleware(req)
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('ERR_UNAUTHORIZED')
  })

  it('allows authenticated access to /dashboard', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const req = new NextRequest('http://localhost/dashboard')
    const res = await middleware(req)
    expect(res.status).toBe(200)
  })

  it('allows unauthenticated access to /api/upload with no premium features', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const req = new NextRequest('http://localhost/api/upload', {
      method: 'POST',
      body: JSON.stringify({ config: { expiry: '7', maxDownloads: 5 } })
    })
    const res = await middleware(req)
    expect(res.status).toBe(200)
  })

  it('returns 401 for unauthenticated access to pro features', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const req = new NextRequest('http://localhost/api/upload', {
      method: 'POST',
      body: JSON.stringify({ config: { password: 'secret' } })
    })
    const res = await middleware(req)
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('ERR_UNAUTHORIZED')
  })

  it('returns 403 for free plan access to pro features', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockSingle.mockResolvedValue({ data: { plan: 'free' } })

    const req = new NextRequest('http://localhost/api/upload', {
      method: 'POST',
      body: JSON.stringify({ config: { expiry: '30' } })
    })
    const res = await middleware(req)
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.error).toBe('ERR_PLAN_REQUIRED')
    expect(body.requiredPlan).toBe('pro')
  })

  it('allows pro plan access to pro features', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockSingle.mockResolvedValue({ data: { plan: 'pro', subscription_status: 'active' } })

    const req = new NextRequest('http://localhost/api/upload', {
      method: 'POST',
      body: JSON.stringify({ config: { maxDownloads: null } }) // unlimited downloads
    })
    const res = await middleware(req)
    expect(res.status).toBe(200)
  })

  it('downgrades expired pro to free and returns 403', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })

    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - 1)
    mockSingle.mockResolvedValue({
      data: { plan: 'pro', subscription_status: 'canceled', subscription_ends_at: pastDate.toISOString() }
    })

    const req = new NextRequest('http://localhost/api/upload', {
      method: 'POST',
      body: JSON.stringify({ config: { password: 'secret' } })
    })
    const res = await middleware(req)
    expect(res.status).toBe(403)
  })

  it('allows pro access if canceled but still active', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })

    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 1)
    mockSingle.mockResolvedValue({
      data: { plan: 'pro', subscription_status: 'canceled', subscription_ends_at: futureDate.toISOString() }
    })

    const req = new NextRequest('http://localhost/api/upload', {
      method: 'POST',
      body: JSON.stringify({ config: { password: 'secret' } })
    })
    const res = await middleware(req)
    expect(res.status).toBe(200)
  })
})

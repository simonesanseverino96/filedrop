import { POST } from '@/app/api/download/[token]/route'
import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: jest.fn(),
}))

jest.mock('@/lib/email', () => ({
  sendDownloadNotification: jest.fn(),
}))

jest.mock('@/lib/ratelimit', () => ({
  downloadRatelimit: {
    limit: jest.fn().mockResolvedValue({ success: true, limit: 10, remaining: 9 }),
  },
}))

describe('Download API', () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks()
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      update: jest.fn().mockReturnThis(),
      storage: {
        from: jest.fn().mockReturnThis(),
        createSignedUrl: jest.fn(),
      }
    }
    ;(supabaseAdmin as jest.Mock).mockReturnValue(mockSupabase)
  })

  it('returns 404 if transfer not found', async () => {
    mockSupabase.single.mockResolvedValue({ data: null, error: new Error('Not found') })

    const req = new NextRequest('http://localhost/api/download/123', {
      method: 'POST',
      body: JSON.stringify({ fileId: 'file1' }),
    })

    const res = await POST(req, { params: Promise.resolve({ token: '123' }) })
    expect(res.status).toBe(404)
    const json = await res.json()
    expect(json.error).toBe('ERR_TRANSFER_NOT_FOUND')
  })

  it('returns 410 if transfer expired', async () => {
    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - 1)

    mockSupabase.single.mockResolvedValue({ 
      data: { expires_at: pastDate.toISOString(), transfer_files: [] }, 
      error: null 
    })

    const req = new NextRequest('http://localhost/api/download/123', {
      method: 'POST',
      body: JSON.stringify({ fileId: 'file1' }),
    })

    const res = await POST(req, { params: Promise.resolve({ token: '123' }) })
    expect(res.status).toBe(410)
    const json = await res.json()
    expect(json.error).toBe('ERR_TRANSFER_EXPIRED')
  })
})

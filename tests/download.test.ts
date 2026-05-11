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

  it('allows download within egress limit', async () => {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 1)

    mockSupabase.single.mockResolvedValue({
      data: {
        id: 'transfer-1',
        user_id: 'user-1',
        expires_at: futureDate.toISOString(),
        transfer_files: [{ id: 'file1', size: 10 * 1024 * 1024, storage_path: 'file1.zip' }],
        download_count: 0,
        max_downloads: null
      },
      error: null
    })

    // Mock egress calculation to be within limit
    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        gte: jest.fn().mockResolvedValue({
          data: [{ total_size: 100 * 1024 * 1024, download_count: 1 }],
          error: null
        }),
        single: jest.fn().mockResolvedValue({
          data: {
            id: 'transfer-1',
            user_id: 'user-1',
            expires_at: futureDate.toISOString(),
            transfer_files: [{ id: 'file1', size: 10 * 1024 * 1024, storage_path: 'file1.zip' }],
            download_count: 0,
            max_downloads: null
          },
          error: null
        })
      })
    })

    mockSupabase.from = jest.fn().mockReturnValue({
      select: mockSelect,
      update: jest.fn().mockReturnValue({ eq: jest.fn().mockReturnThis() })
    })

    mockSupabase.storage.from = jest.fn().mockReturnValue({
      createSignedUrl: jest.fn().mockResolvedValue({ data: { signedUrl: 'http://signed.url' }, error: null })
    })

    const req = new NextRequest('http://localhost/api/download/123', {
      method: 'POST',
      body: JSON.stringify({ fileId: 'file1' }),
    })

    const res = await POST(req, { params: Promise.resolve({ token: '123' }) })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.url).toBe('http://signed.url')
  })

  it('blocks download when monthly egress exceeds 2.5 GB', async () => {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 1)

    const fileSize = 100 * 1024 * 1024

    mockSupabase.single.mockResolvedValue({
      data: {
        id: 'transfer-1',
        user_id: 'user-1',
        expires_at: futureDate.toISOString(),
        transfer_files: [{ id: 'file1', size: fileSize, storage_path: 'file1.zip' }],
        download_count: 0,
        max_downloads: null
      },
      error: null
    })

    // Mock egress calculation to exceed limit (e.g. 2.5 GB already)
    const currentEgress = 2.5 * 1024 * 1024 * 1024

    const mockSelectExceed = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        gte: jest.fn().mockResolvedValue({
          data: [{ total_size: currentEgress, download_count: 1 }],
          error: null
        }),
        single: jest.fn().mockResolvedValue({
          data: {
            id: 'transfer-1',
            user_id: 'user-1',
            expires_at: futureDate.toISOString(),
            transfer_files: [{ id: 'file1', size: fileSize, storage_path: 'file1.zip' }],
            download_count: 0,
            max_downloads: null
          },
          error: null
        })
      })
    })

    mockSupabase.from = jest.fn().mockReturnValue({
      select: mockSelectExceed,
      update: jest.fn().mockReturnThis()
    })

    const req = new NextRequest('http://localhost/api/download/123', {
      method: 'POST',
      body: JSON.stringify({ fileId: 'file1' }),
    })

    const res = await POST(req, { params: Promise.resolve({ token: '123' }) })
    expect(res.status).toBe(403)
    const json = await res.json()
    expect(json.error).toBe('Download blocked. The monthly egress limit of 2.5 GB has been reached.')
  })
})

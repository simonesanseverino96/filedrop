import { POST } from '@/app/api/upload/route'
import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: jest.fn(),
}))

jest.mock('@/lib/ratelimit', () => ({
  uploadRatelimit: {
    limit: jest.fn().mockResolvedValue({ success: true, limit: 10, remaining: 9 }),
  },
}))

jest.mock('@/lib/email', () => ({
  sendUploadConfirmation: jest.fn(),
}))

jest.mock('uuid', () => ({
  v4: () => 'test-uuid-1234',
}))

describe('Upload API', () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks()
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      storage: {
        from: jest.fn().mockReturnThis(),
        list: jest.fn().mockResolvedValue({ 
          data: [{ name: 'f1_test.txt', metadata: { size: 100 } }], 
          error: null 
        }),
      }
    }
    ;(supabaseAdmin as jest.Mock).mockReturnValue(mockSupabase)
  })

  it('returns 400 if no files provided', async () => {
    const req = new NextRequest('http://localhost/api/upload', {
      method: 'POST',
      body: JSON.stringify({ transferId: '123', files: [], config: {}, totalSize: 0 }),
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('ERR_NO_FILES_PROVIDED')
  })

  it('returns 400 if a file is blocked', async () => {
    const req = new NextRequest('http://localhost/api/upload', {
      method: 'POST',
      body: JSON.stringify({
        transferId: '123',
        files: [{ filename: 'malware.exe', size: 100, mimeType: 'application/x-msdownload', id: 'f1' }],
        config: {},
        totalSize: 100
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('ERR_FILE_NOT_ALLOWED')
  })

  it('caps free user at 7 days expiry', async () => {
    mockSupabase.insert.mockResolvedValue({ error: null })

    // Setup mockSelect to return plan when querying 'profiles'
    // and to return empty array when querying 'transfers'
    mockSupabase.select = jest.fn().mockImplementation((selectArg) => {
      if (selectArg === 'total_size') {
        return { eq: jest.fn().mockResolvedValue({ data: [], error: null }) };
      }
      return {
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: { plan: 'free' }, error: null })
        })
      };
    })

    mockSupabase.from = jest.fn().mockReturnValue({
      select: mockSupabase.select,
      insert: mockSupabase.insert,
      eq: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
    })

    const req = new NextRequest('http://localhost/api/upload', {
      method: 'POST',
      body: JSON.stringify({
        transferId: '123',
        files: [{ filename: 'test.txt', size: 100, mimeType: 'text/plain', id: 'f1', storagePath: 'test.txt' }],
        config: { expiry: '30' },
        totalSize: 100,
        accessToken: 'fake-token'
      }),
    })

    mockSupabase.auth = {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } })
    }

    const res = await POST(req)
    expect(res.status).toBe(201)

    // Verify it was capped at 7 days
    const insertCall = mockSupabase.insert.mock.calls[0][0]
    const expiresAt = new Date(insertCall.expires_at)
    const now = new Date()
    const diffDays = Math.round((expiresAt.getTime() - now.getTime()) / (1000 * 3600 * 24))
    expect(diffDays).toBe(7)
  })

  it('allows pro user up to 90 days expiry', async () => {
    mockSupabase.insert.mockResolvedValue({ error: null })
    mockSupabase.select = jest.fn().mockImplementation((selectArg) => {
      if (selectArg === 'total_size') {
        return { eq: jest.fn().mockResolvedValue({ data: [], error: null }) };
      }
      return {
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: { plan: 'pro' }, error: null })
        })
      };
    })

    mockSupabase.from = jest.fn().mockReturnValue({
      select: mockSupabase.select,
      insert: mockSupabase.insert,
      eq: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
    })

    const req = new NextRequest('http://localhost/api/upload', {
      method: 'POST',
      body: JSON.stringify({
        transferId: '123',
        files: [{ filename: 'test.txt', size: 100, mimeType: 'text/plain', id: 'f1', storagePath: 'test.txt' }],
        config: { expiry: '90' },
        totalSize: 100,
        accessToken: 'fake-token'
      }),
    })

    mockSupabase.auth = {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } })
    }

    const res = await POST(req)
    expect(res.status).toBe(201)

    // Verify it allowed 90 days
    const insertCall = mockSupabase.insert.mock.calls[0][0]
    const expiresAt = new Date(insertCall.expires_at)
    const now = new Date()
    const diffDays = Math.round((expiresAt.getTime() - now.getTime()) / (1000 * 3600 * 24))
    expect(diffDays).toBe(90)
  })

  it('creates transfer and files in database', async () => {
    mockSupabase.insert.mockResolvedValue({ error: null })

    const req = new NextRequest('http://localhost/api/upload', {
      method: 'POST',
      body: JSON.stringify({
        transferId: '123',
        files: [{ filename: 'test.txt', size: 100, mimeType: 'text/plain', id: 'f1', storagePath: 'test.txt' }],
        config: { expiry: '7' },
        totalSize: 100
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(201)
    
    // First insert is for transfer, second for files
    expect(mockSupabase.from).toHaveBeenCalledWith('transfers')
    expect(mockSupabase.from).toHaveBeenCalledWith('transfer_files')
  })

  it('accepts upload under 12.5 MB', async () => {
    mockSupabase.insert.mockResolvedValue({ error: null })

    const req = new NextRequest('http://localhost/api/upload', {
      method: 'POST',
      body: JSON.stringify({
        transferId: '123',
        files: [{ filename: 'test.zip', size: 12 * 1024 * 1024, mimeType: 'application/zip', id: 'f1', storagePath: 'test.zip' }],
        config: { expiry: '7' },
        totalSize: 12 * 1024 * 1024
      }),
    })

    mockSupabase.storage.from = jest.fn().mockReturnValue({
      list: jest.fn().mockResolvedValue({
        data: [{ name: 'f1_test.zip', metadata: { size: 12 * 1024 * 1024 } }],
        error: null
      })
    })

    const res = await POST(req)
    expect(res.status).toBe(201)

    // First insert is for transfer, second for files
    expect(mockSupabase.from).toHaveBeenCalledWith('transfers')
    expect(mockSupabase.from).toHaveBeenCalledWith('transfer_files')
  })

  it('rejects upload over 12.5 MB', async () => {
    const maxSize = 12.5 * 1024 * 1024 + 1
    const req = new NextRequest('http://localhost/api/upload', {
      method: 'POST',
      body: JSON.stringify({
        transferId: '123',
        files: [{ filename: 'large.zip', size: maxSize, mimeType: 'application/zip', id: 'f1', storagePath: 'large.zip' }],
        config: { expiry: '7' },
        totalSize: maxSize
      }),
    })

    // Update storage mock so that the file size validation in finalizeTransfer passes the storage fetch
    mockSupabase.storage.from = jest.fn().mockReturnValue({
      list: jest.fn().mockResolvedValue({
        data: [{ name: 'f1_large.zip', metadata: { size: maxSize } }],
        error: null
      })
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('Upload exceeds the maximum allowed size of 12.5 MB.')
  })

  it('rejects upload when user storage would exceed 250 MB', async () => {
    const currentStorage = 240 * 1024 * 1024
    const newFileSize = 11 * 1024 * 1024

    mockSupabase.select = jest.fn().mockImplementation((selectArg) => {
      if (selectArg === 'total_size') {
        return { eq: jest.fn().mockResolvedValue({ data: [{ total_size: currentStorage }], error: null }) };
      }
      return {
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: { plan: 'free' }, error: null })
        })
      };
    })

    mockSupabase.from = jest.fn().mockReturnValue({
      select: mockSupabase.select,
      insert: mockSupabase.insert,
      eq: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
    })

    const req = new NextRequest('http://localhost/api/upload', {
      method: 'POST',
      body: JSON.stringify({
        transferId: '123',
        files: [{ filename: 'test.zip', size: newFileSize, mimeType: 'application/zip', id: 'f1', storagePath: 'test.zip' }],
        config: { expiry: '7' },
        totalSize: newFileSize,
        accessToken: 'fake-token' // Ensure we mock userId to trigger the check
      }),
    })

    // Mock user retrieval
    mockSupabase.auth = {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } })
    }

    mockSupabase.storage.from = jest.fn().mockReturnValue({
      list: jest.fn().mockResolvedValue({
        data: [{ name: 'f1_test.zip', metadata: { size: newFileSize } }],
        error: null
      })
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('Upload rejected. You have exceeded your total storage limit of 250 MB.')
  })
})

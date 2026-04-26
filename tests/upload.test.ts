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
})

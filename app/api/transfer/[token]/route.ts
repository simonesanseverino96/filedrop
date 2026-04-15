import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params
    const supabase = supabaseAdmin()

    const { data: transfer, error } = await supabase
      .from('transfers')
      .select('*, transfer_files(*)')
      .eq('token', token)
      .single()

    if (error || !transfer) {
      return NextResponse.json({ error: 'Trasferimento non trovato' }, { status: 404 })
    }

    // Check expiry
    if (new Date(transfer.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Trasferimento scaduto' }, { status: 410 })
    }

    // Check download limit
    if (transfer.max_downloads !== null && transfer.download_count >= transfer.max_downloads) {
      return NextResponse.json({ error: 'Limite download raggiunto' }, { status: 410 })
    }

    return NextResponse.json({
      token: transfer.token,
      expiresAt: transfer.expires_at,
      hasPassword: !!transfer.password_hash,
      message: transfer.message,
      senderEmail: transfer.sender_email,
      downloadCount: transfer.download_count,
      maxDownloads: transfer.max_downloads,
      totalSize: transfer.total_size,
      files: transfer.transfer_files.map((f: any) => ({
        id: f.id,
        filename: f.filename,
        size: f.size,
        mimeType: f.mime_type,
      })),
    })
  } catch (err) {
    console.error('Transfer info error:', err)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}

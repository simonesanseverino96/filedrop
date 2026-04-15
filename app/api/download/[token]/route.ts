import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params
    const body = await req.json()
    const { password, fileId } = body

    const supabase = supabaseAdmin()

    // Fetch transfer + files
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
      return NextResponse.json({ error: 'Limite di download raggiunto' }, { status: 410 })
    }

    // Check password
    if (transfer.password_hash) {
      if (!password) {
        return NextResponse.json({ error: 'Password richiesta', requiresPassword: true }, { status: 401 })
      }
      const valid = await bcrypt.compare(password, transfer.password_hash)
      if (!valid) {
        return NextResponse.json({ error: 'Password errata', requiresPassword: true }, { status: 401 })
      }
    }

    // Find the requested file
    const file = transfer.transfer_files.find((f: any) => f.id === fileId)
    if (!file) {
      return NextResponse.json({ error: 'File non trovato' }, { status: 404 })
    }

    // Generate signed URL (valid 60 seconds)
    const { data: signed, error: signError } = await supabase.storage
      .from('filedrop')
      .createSignedUrl(file.storage_path, 60)

    if (signError || !signed) {
      console.error('Signed URL error:', signError)
      return NextResponse.json({ error: 'Errore generazione link download' }, { status: 500 })
    }

    // Increment download count (only once per full transfer download, not per file)
    // We increment only when fileId is the first file or when explicitly requested
    if (fileId === transfer.transfer_files[0]?.id) {
      await supabase
        .from('transfers')
        .update({ download_count: transfer.download_count + 1 })
        .eq('id', transfer.id)
    }

    return NextResponse.json({ url: signed.signedUrl, filename: file.filename })
  } catch (err) {
    console.error('Download error:', err)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

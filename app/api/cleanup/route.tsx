import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Questo endpoint viene chiamato ogni ora da Vercel Cron
// Elimina i trasferimenti scaduti e i relativi file dallo Storage
export async function GET(req: NextRequest) {
  // Verifica il secret per sicurezza
  const authHeader = req.headers.get('Authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  }

  try {
    const supabase = supabaseAdmin()

    // Recupera i trasferimenti scaduti con i loro file
    const { data: expired, error } = await supabase
      .from('transfers')
      .select('id, transfer_files(storage_path)')
      .lt('expires_at', new Date().toISOString())

    if (error) throw error
    if (!expired || expired.length === 0) {
      return NextResponse.json({ cleaned: 0, message: 'Nessun trasferimento scaduto' })
    }

    let deletedFiles = 0
    let deletedTransfers = 0

    // Elimina i file dallo Storage per ogni trasferimento scaduto
    for (const transfer of expired) {
      const files = transfer.transfer_files as any[]
      if (files && files.length > 0) {
        const paths = files.map((f: any) => f.storage_path).filter(Boolean)
        if (paths.length > 0) {
          const { error: storageError } = await supabase.storage
            .from('filedrop')
            .remove(paths)

          if (!storageError) deletedFiles += paths.length
        }
      }
    }

    // Elimina i record dal DB (CASCADE elimina anche transfer_files)
    const { count } = await supabase
      .from('transfers')
      .delete({ count: 'exact' })
      .lt('expires_at', new Date().toISOString())

    deletedTransfers = count || 0

    console.log(`Cleanup: ${deletedTransfers} trasferimenti, ${deletedFiles} file eliminati`)

    return NextResponse.json({
      cleaned: deletedTransfers,
      filesDeleted: deletedFiles,
      message: `Eliminati ${deletedTransfers} trasferimenti e ${deletedFiles} file`,
    })
  } catch (err: any) {
    console.error('Cleanup error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
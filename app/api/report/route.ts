import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const REASON_LABELS: Record<string, string> = {
  csam: '🚨 MATERIALE CHE SFRUTTA MINORI (CSAM)',
  malware: '⚠️ Malware o virus',
  copyright: '©️ Violazione copyright',
  illegal: '⛔ Contenuto illegale',
  phishing: '🎣 Phishing o truffa',
  other: '❓ Altro',
}

export async function POST(req: NextRequest) {
  try {
    const { token, reason, email } = await req.json()

    if (!token || !reason) {
      return NextResponse.json({ error: 'Dati mancanti' }, { status: 400 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vaultransfer.com'
    const reasonLabel = REASON_LABELS[reason] || reason
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'

    // Invia email all'abuse team
    await resend.emails.send({
      from: 'VaultTransfer Abuse <noreply@vaultransfer.com>',
      to: 'abuse@vaultransfer.com',
      subject: `[SEGNALAZIONE] ${reasonLabel} — Token: ${token}`,
      html: `
        <div style="font-family: monospace; padding: 20px;">
          <h2 style="color: #ef4444;">🚨 Nuova segnalazione abuso</h2>
          
          <table style="border-collapse: collapse; width: 100%;">
            <tr><td style="padding: 8px; font-weight: bold;">Motivo:</td><td style="padding: 8px;">${reasonLabel}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Token:</td><td style="padding: 8px;">${token}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Link:</td><td style="padding: 8px;"><a href="${appUrl}/download/${token}">${appUrl}/download/${token}</a></td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">IP segnalante:</td><td style="padding: 8px;">${ip}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Email segnalante:</td><td style="padding: 8px;">${email || 'Non fornita'}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Data:</td><td style="padding: 8px;">${new Date().toISOString()}</td></tr>
          </table>

          ${reason === 'csam' ? `
          <div style="background: #fee2e2; border: 2px solid #ef4444; padding: 16px; margin-top: 16px; border-radius: 8px;">
            <strong style="color: #dc2626;">⚠️ ATTENZIONE: Segnalazione CSAM — Eliminare immediatamente e segnalare alle autorità competenti.</strong>
          </div>` : ''}

          <p style="margin-top: 16px;">
            <a href="${appUrl}/download/${token}" style="background: #ef4444; color: white; padding: 8px 16px; border-radius: 4px; text-decoration: none;">
              Esamina il contenuto
            </a>
          </p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Report error:', err)
    return NextResponse.json({ error: 'Errore invio segnalazione' }, { status: 500 })
  }
}
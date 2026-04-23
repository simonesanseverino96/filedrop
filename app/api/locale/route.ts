import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { locale } = await req.json()

  const validLocales = ['en', 'de', 'fr', 'es', 'pt', 'it', 'ja', 'zh', 'ar']
  if (!validLocales.includes(locale)) {
    return NextResponse.json({ error: 'Invalid locale' }, { status: 400 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set('NEXT_LOCALE', locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 anno
    sameSite: 'lax',
  })
  return res
}
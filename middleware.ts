import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isDashboard = pathname === '/dashboard' || /^\/[a-z]{2}\/dashboard$/.test(pathname)
  const isUploadInit = pathname === '/api/upload/init'
  const isUpload = pathname === '/api/upload'

  if (!isDashboard && !isUploadInit && !isUpload) {
    return NextResponse.next()
  }

  let accessToken = request.headers.get('Authorization')?.replace('Bearer ', '')

  let body: any = null
  let isMultipart = false
  if (request.method === 'POST') {
    const contentType = request.headers.get('content-type') || ''
    if (contentType.includes('multipart/form-data')) {
      isMultipart = true
    } else {
      try {
        const clonedReq = request.clone()
        body = await clonedReq.json()
        if (body?.accessToken) {
          accessToken = body.accessToken
        }
      } catch (e) {
        // ignore
      }
    }
  }

  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'anon_key'

  const clientOptions: any = {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet: any[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  }

  if (accessToken) {
    clientOptions.global = {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    clientOptions
  )

  let user = null

  if (accessToken) {
    const { data } = await supabase.auth.getUser(accessToken)
    user = data?.user
  } else {
    const { data } = await supabase.auth.getUser()
    user = data?.user
  }

  if (isDashboard) {
    if (!user) {
      return NextResponse.json({ error: 'ERR_UNAUTHORIZED' }, { status: 401 })
    }
    return supabaseResponse
  }

  if (isUpload || isUploadInit) {
    let isPremiumFeatureRequested = false

    if (body?.config) {
      const { expiry, password, maxDownloads } = body.config
      if (password && password.trim() !== '') isPremiumFeatureRequested = true
      if (expiry && parseInt(expiry, 10) > 7) isPremiumFeatureRequested = true
      if (maxDownloads !== undefined && maxDownloads !== 5 && maxDownloads !== null) isPremiumFeatureRequested = true
      if (maxDownloads === null) isPremiumFeatureRequested = true // null means unlimited
    }

    if (isPremiumFeatureRequested) {
      if (!user) {
        return NextResponse.json({ error: 'ERR_UNAUTHORIZED' }, { status: 401 })
      }

      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('plan, subscription_status, subscription_ends_at')
        .eq('id', user.id)
        .single()

      const { data: profileOrig } = await supabase
        .from('profiles')
        .select('plan, subscription_status, subscription_ends_at')
        .eq('id', user.id)
        .single()

      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('plan, subscription_status, subscription_ends_at')
        .eq('id', user.id)
        .single()

      const profile = userProfile || profileOrig || subscription

      let plan = 'free'
      if (profile && profile.plan !== 'free') {
        if (profile.subscription_status === 'active') {
          plan = profile.plan
        } else if (profile.subscription_ends_at && new Date(profile.subscription_ends_at) > new Date()) {
          plan = profile.plan
        }
      }

      if (plan === 'free') {
        return NextResponse.json({ error: 'ERR_PLAN_REQUIRED', requiredPlan: 'pro' }, { status: 403 })
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/dashboard',
    '/:locale/dashboard',
    '/api/upload/init',
    '/api/upload'
  ]
}

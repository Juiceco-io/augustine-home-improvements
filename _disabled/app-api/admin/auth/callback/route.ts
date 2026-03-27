import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForSession, getSessionCookieName } from '@/lib/auth'

const SESSION_COOKIE = getSessionCookieName()
const SESSION_MAX_AGE = 30 * 24 * 60 * 60

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  const state = req.nextUrl.searchParams.get('state') || '/admin/dashboard'

  if (!code) {
    return NextResponse.redirect(new URL('/admin/login?error=missing_code', req.url))
  }

  try {
    const { sessionToken } = await exchangeCodeForSession(code)
    const destination = state.startsWith('/admin') ? state : '/admin/dashboard'
    const response = NextResponse.redirect(new URL(destination, req.url))

    response.cookies.set(SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('[Admin Auth] Cognito callback failed:', error)
    return NextResponse.redirect(new URL('/admin/login?error=auth_failed', req.url))
  }
}

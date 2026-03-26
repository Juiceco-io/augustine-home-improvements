import { NextRequest, NextResponse } from 'next/server'
import { createAdminSession, verifyAdminCredentials, getSessionCookieName } from '@/lib/auth'

const SESSION_COOKIE = getSessionCookieName()
const SESSION_MAX_AGE = 30 * 24 * 60 * 60 // 30 days in seconds

export async function POST(req: NextRequest) {
  // Handle logout via form POST
  const contentType = req.headers.get('content-type') || ''

  let body: { username?: string; password?: string; _action?: string }

  if (contentType.includes('application/x-www-form-urlencoded')) {
    const text = await req.text()
    const params = new URLSearchParams(text)
    body = {
      _action: params.get('_action') || undefined,
      username: params.get('username') || undefined,
      password: params.get('password') || undefined,
    }
  } else {
    body = await req.json().catch(() => ({}))
  }

  // Logout
  if (body._action === 'logout') {
    const response = NextResponse.redirect(new URL('/admin/login', req.url))
    response.cookies.delete(SESSION_COOKIE)
    return response
  }

  // Login
  if (!body.username || !body.password) {
    return NextResponse.json({ error: 'Username and password are required.' }, { status: 400 })
  }

  const valid = await verifyAdminCredentials(body.username, body.password)
  if (!valid) {
    // Artificial delay to slow brute-force
    await new Promise((r) => setTimeout(r, 500))
    return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 })
  }

  const token = await createAdminSession(body.username)

  const response = NextResponse.json({ success: true })
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  })

  return response
}

export async function DELETE(req: NextRequest) {
  const response = NextResponse.json({ success: true })
  response.cookies.delete(SESSION_COOKIE)
  return response
}

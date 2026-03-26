import { NextRequest, NextResponse } from 'next/server'
import { getSessionCookieName, getCognitoLoginUrl } from '@/lib/auth'

const SESSION_COOKIE = getSessionCookieName()

export async function GET(req: NextRequest) {
  const nextPath = req.nextUrl.searchParams.get('next') || '/admin/dashboard'
  return NextResponse.redirect(getCognitoLoginUrl(nextPath))
}

export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') || ''

  let action: string | undefined

  if (contentType.includes('application/x-www-form-urlencoded')) {
    const text = await req.text()
    const params = new URLSearchParams(text)
    action = params.get('_action') || undefined
  } else {
    const body = await req.json().catch(() => ({})) as { _action?: string }
    action = body._action
  }

  if (action === 'logout') {
    const response = NextResponse.redirect(new URL('/admin/login', req.url))
    response.cookies.delete(SESSION_COOKIE)
    return response
  }

  return NextResponse.json(
    { error: 'Use Cognito sign-in flow for admin login.' },
    { status: 405 }
  )
}

export async function DELETE(req: NextRequest) {
  const response = NextResponse.json({ success: true })
  response.cookies.delete(SESSION_COOKIE)
  return response
}

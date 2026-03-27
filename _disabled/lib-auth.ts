import { SignJWT, jwtVerify, createRemoteJWKSet } from 'jose'
import { cookies } from 'next/headers'

const SESSION_COOKIE = 'ahi_admin_session'
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000 // 30 days
const COGNITO_PROVIDER = 'cognito'

export interface AdminSession {
  username: string
  email?: string
  role: 'super_user' | 'admin'
  provider: 'cognito'
  expiresAt: number
}

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret) throw new Error('ADMIN_SESSION_SECRET not configured')
  return new TextEncoder().encode(secret)
}

function getCognitoConfig() {
  const region = 'us-east-1'
  const userPoolId = process.env.COGNITO_USER_POOL_ID
  const clientId = process.env.COGNITO_APP_CLIENT_ID
  const domain = process.env.COGNITO_DOMAIN
  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  if (!userPoolId || !clientId || !domain || !appUrl) {
    throw new Error('Cognito auth is not fully configured')
  }

  return {
    region,
    userPoolId,
    clientId,
    domain,
    appUrl,
    issuer: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`,
    jwks: createRemoteJWKSet(new URL(`https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`)),
  }
}

function getAllowedSuperUsers() {
  return new Set(
    (process.env.COGNITO_SUPERUSER_EMAILS || '')
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean)
  )
}

export async function createAdminSession(input: {
  username: string
  email?: string
  role: 'super_user' | 'admin'
}): Promise<string> {
  return new SignJWT({
    username: input.username,
    email: input.email,
    role: input.role,
    provider: COGNITO_PROVIDER,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor((Date.now() + SESSION_DURATION) / 1000))
    .sign(getSessionSecret())
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, getSessionSecret())
    return {
      username: String(payload.username || ''),
      email: payload.email ? String(payload.email) : undefined,
      role: payload.role === 'super_user' ? 'super_user' : 'admin',
      provider: 'cognito',
      expiresAt: typeof payload.exp === 'number' ? payload.exp * 1000 : Date.now(),
    }
  } catch {
    return null
  }
}

export function getSessionCookieName(): string {
  return SESSION_COOKIE
}

export function getCognitoLoginUrl(nextPath = '/admin/dashboard'): string {
  const { domain, clientId, appUrl } = getCognitoConfig()
  const url = new URL(`${domain}/login`)
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', 'openid email profile')
  url.searchParams.set('redirect_uri', `${appUrl}/api/admin/auth/callback`)
  url.searchParams.set('state', nextPath)
  return url.toString()
}

export async function exchangeCodeForSession(code: string) {
  const { domain, clientId, appUrl } = getCognitoConfig()

  const response = await fetch(`${domain}/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      code,
      redirect_uri: `${appUrl}/api/admin/auth/callback`,
    }),
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('Failed to exchange Cognito authorization code')
  }

  const tokens = await response.json() as { id_token?: string }
  if (!tokens.id_token) {
    throw new Error('Missing Cognito id_token')
  }

  const { issuer, clientId: expectedAud, jwks } = getCognitoConfig()
  const { payload } = await jwtVerify(tokens.id_token, jwks, {
    issuer,
    audience: expectedAud,
  })

  const email = payload.email ? String(payload.email).toLowerCase() : undefined
  const username = String(payload['cognito:username'] || payload.email || 'admin')
  const groups = Array.isArray(payload['cognito:groups'])
    ? payload['cognito:groups'].map((group) => String(group))
    : []

  const allowedSuperUsers = getAllowedSuperUsers()
  const isSuperUser = groups.includes('super_user') || (!!email && allowedSuperUsers.has(email))

  if (!isSuperUser) {
    throw new Error('User is not authorized for admin access')
  }

  return {
    sessionToken: await createAdminSession({
      username,
      email,
      role: 'super_user',
    }),
    username,
    email,
  }
}

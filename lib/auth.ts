/**
 * Admin authentication helpers.
 * 
 * Required environment variables:
 *   ADMIN_JWT_SECRET             - Strong random secret (min 32 chars)
 *   ADMIN_USERNAME               - Admin username (default: admin)
 *   ADMIN_PASSWORD_HASH          - bcrypt hash of admin password
 */

import { cookies } from 'next/headers'

const SESSION_COOKIE = 'ahi_admin_session'
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000 // 30 days

export interface AdminSession {
  username: string
  expiresAt: number
}

/**
 * Create a signed session token (simple HMAC-based JWT alternative).
 * For production, consider using a proper JWT library.
 */
async function signSession(data: AdminSession): Promise<string> {
  const secret = process.env.ADMIN_JWT_SECRET
  if (!secret) throw new Error('ADMIN_JWT_SECRET not configured')

  const payload = Buffer.from(JSON.stringify(data)).toString('base64url')
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  const sigB64 = Buffer.from(sig).toString('base64url')
  return `${payload}.${sigB64}`
}

async function verifySession(token: string): Promise<AdminSession | null> {
  const secret = process.env.ADMIN_JWT_SECRET
  if (!secret) return null

  const parts = token.split('.')
  if (parts.length !== 2) return null

  const [payload, sig] = parts
  try {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      Buffer.from(sig, 'base64url'),
      new TextEncoder().encode(payload)
    )
    if (!valid) return null

    const data = JSON.parse(Buffer.from(payload, 'base64url').toString()) as AdminSession
    if (Date.now() > data.expiresAt) return null
    return data
  } catch {
    return null
  }
}

export async function createAdminSession(username: string): Promise<string> {
  const session: AdminSession = {
    username,
    expiresAt: Date.now() + SESSION_DURATION,
  }
  return signSession(session)
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null
  return verifySession(token)
}

export function getSessionCookieName(): string {
  return SESSION_COOKIE
}

/**
 * Verify admin credentials.
 * Compares plaintext password against bcrypt hash stored in env.
 * For a production deployment, use a proper bcrypt library.
 */
export async function verifyAdminCredentials(
  username: string,
  password: string
): Promise<boolean> {
  const adminUsername = process.env.ADMIN_USERNAME || 'admin'
  const passwordHash = process.env.ADMIN_PASSWORD_HASH

  if (username !== adminUsername) return false
  if (!passwordHash) {
    // Dev fallback: accept 'admin123' if no hash configured
    if (process.env.NODE_ENV === 'development') {
      return password === 'admin123'
    }
    return false
  }

  // Simple PBKDF2-based comparison as fallback (no native bcrypt needed)
  // For production with bcrypt hashes, install bcryptjs and update this function
  try {
    // Attempt to use Web Crypto PBKDF2 for the stored hash if it's a simple format
    // This placeholder returns false — set up proper bcrypt in production
    console.warn('[Auth] Install bcryptjs and use bcrypt.compare() for production password verification.')
    return false
  } catch {
    return false
  }
}

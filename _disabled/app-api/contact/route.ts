import { NextRequest, NextResponse } from 'next/server'
import { sendContactEmail, ContactFormPayload } from '@/lib/ses'

// Rate limiting: simple in-memory store (for production, use Redis or DynamoDB)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 3 // max requests per window
const RATE_WINDOW_MS = 10 * 60 * 1000 // 10 minutes

function getRateLimitKey(req: NextRequest): string {
  return req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return false
  }

  if (entry.count >= RATE_LIMIT) {
    return true
  }

  entry.count++
  return false
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validatePhone(phone: string): boolean {
  return /^[\d\s\-\+\(\)\.]{7,20}$/.test(phone)
}

export async function POST(req: NextRequest) {
  // Rate limit check
  const ip = getRateLimitKey(req)
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later or call us directly at 484-467-7925.' },
      { status: 429, headers: { 'Retry-After': '600' } }
    )
  }

  let payload: Partial<ContactFormPayload>
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  // Server-side validation
  const errors: string[] = []

  if (!payload.name || typeof payload.name !== 'string' || payload.name.trim().length < 2) {
    errors.push('Name is required (minimum 2 characters).')
  }

  if (!payload.email || !validateEmail(payload.email)) {
    errors.push('A valid email address is required.')
  }

  if (!payload.phone || !validatePhone(payload.phone)) {
    errors.push('A valid phone number is required.')
  }

  if (!payload.location || typeof payload.location !== 'string' || payload.location.trim().length < 2) {
    errors.push('Location is required.')
  }

  if (!payload.description || typeof payload.description !== 'string' || payload.description.trim().length < 10) {
    errors.push('Job description is required (minimum 10 characters).')
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join(' ') }, { status: 422 })
  }

  // Sanitize inputs (trim, truncate)
  const sanitized: ContactFormPayload = {
    name: payload.name!.trim().slice(0, 100),
    email: payload.email!.trim().slice(0, 200),
    phone: payload.phone!.trim().slice(0, 30),
    location: payload.location!.trim().slice(0, 100),
    callTime: (payload.callTime || '').trim().slice(0, 20),
    services: Array.isArray(payload.services)
      ? payload.services.slice(0, 10).map((s: string) => String(s).slice(0, 50))
      : [],
    description: payload.description!.trim().slice(0, 3000),
  }

  // Check if SES is configured, otherwise log (dev mode)
  if (!process.env.SES_FROM_EMAIL || !process.env.CONTACT_RECIPIENT_EMAIL) {
    // Development mode: log to console
    console.log('[ContactForm] SES not configured — would have sent email:', sanitized)
    return NextResponse.json({ success: true, dev: true })
  }

  try {
    await sendContactEmail(sanitized)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[ContactForm] Failed to send email via SES:', err)
    return NextResponse.json(
      { error: 'Failed to send your message. Please call us directly at 484-467-7925.' },
      { status: 500 }
    )
  }
}

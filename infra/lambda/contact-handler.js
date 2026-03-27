/**
 * Augustine Home Improvements — Contact Form Lambda Handler
 *
 * Deployed behind API Gateway (HTTP API or REST API).
 * Receives POST requests from the static frontend contact form
 * and sends them via AWS SES.
 *
 * Required environment variables (set in Lambda console or IaC):
 *   SES_FROM_EMAIL          - SES-verified sender, e.g. noreply@augustinehomeimprovements.com
 *   CONTACT_RECIPIENT_EMAIL - Destination inbox, e.g. info@augustinehomeimprovements.com
 *   AWS_REGION              - SES region (default: us-east-1)
 *   ALLOWED_ORIGIN          - CORS origin, e.g. https://www.augustinehomeimprovements.com
 *
 * IAM permissions needed:
 *   ses:SendEmail on the verified SES identity ARN
 *
 * API Gateway integration notes:
 *   - Method: POST
 *   - Route: /contact  (e.g. https://xxxx.execute-api.us-east-1.amazonaws.com/prod/contact)
 *   - Enable CORS in API Gateway (or handle via ALLOWED_ORIGIN below)
 *   - This URL becomes NEXT_PUBLIC_CONTACT_API_URL in the frontend build
 */

const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses')

const sesClient = new SESClient({ region: process.env.AWS_REGION || 'us-east-1' })

const RATE_LIMIT = 3
const RATE_WINDOW_MS = 10 * 60 * 1000 // 10 minutes
const rateLimitMap = new Map()

function isRateLimited(ip) {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return false
  }
  if (entry.count >= RATE_LIMIT) return true
  entry.count++
  return false
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validatePhone(phone) {
  return /^[\d\s\-\+\(\)\.]{7,20}$/.test(phone)
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function corsHeaders(origin) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://www.augustinehomeimprovements.com'
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Content-Type': 'application/json',
  }
}

exports.handler = async (event) => {
  const headers = corsHeaders()

  // Handle CORS preflight
  if (event.requestContext?.http?.method === 'OPTIONS' || event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' }
  }

  // Rate limiting
  const ip =
    event.requestContext?.http?.sourceIp ||
    event.requestContext?.identity?.sourceIp ||
    'unknown'

  if (isRateLimited(ip)) {
    return {
      statusCode: 429,
      headers: { ...headers, 'Retry-After': '600' },
      body: JSON.stringify({ error: 'Too many requests. Please try again later or call us directly at 484-467-7925.' }),
    }
  }

  // Parse body
  let payload
  try {
    const raw = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64').toString('utf8')
      : event.body
    payload = JSON.parse(raw || '{}')
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid request body.' }) }
  }

  // Validation
  const errors = []
  if (!payload.name || typeof payload.name !== 'string' || payload.name.trim().length < 2)
    errors.push('Name is required (minimum 2 characters).')
  if (!payload.email || !validateEmail(payload.email))
    errors.push('A valid email address is required.')
  if (!payload.phone || !validatePhone(payload.phone))
    errors.push('A valid phone number is required.')
  if (!payload.location || typeof payload.location !== 'string' || payload.location.trim().length < 2)
    errors.push('Location is required.')
  if (!payload.description || typeof payload.description !== 'string' || payload.description.trim().length < 10)
    errors.push('Job description is required (minimum 10 characters).')

  if (errors.length > 0) {
    return { statusCode: 422, headers, body: JSON.stringify({ error: errors.join(' ') }) }
  }

  // Sanitize
  const name = payload.name.trim().slice(0, 100)
  const email = payload.email.trim().slice(0, 200)
  const phone = payload.phone.trim().slice(0, 30)
  const location = payload.location.trim().slice(0, 100)
  const callTime = (payload.callTime || '').trim().slice(0, 20)
  const services = Array.isArray(payload.services)
    ? payload.services.slice(0, 10).map((s) => String(s).slice(0, 50))
    : []
  const description = payload.description.trim().slice(0, 3000)
  const servicesList = services.length > 0 ? services.join(', ') : 'Not specified'

  const fromEmail = process.env.SES_FROM_EMAIL
  const toEmail = process.env.CONTACT_RECIPIENT_EMAIL

  if (!fromEmail || !toEmail) {
    console.error('[ContactForm] Missing SES_FROM_EMAIL or CONTACT_RECIPIENT_EMAIL env vars')
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Server configuration error. Please call us at 484-467-7925.' }),
    }
  }

  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a1a; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: #671609; color: white; padding: 24px 32px; }
    .header h1 { margin: 0; font-size: 20px; }
    .header p { margin: 4px 0 0; font-size: 13px; opacity: 0.8; }
    .body { padding: 32px; background: #ffffff; }
    .field { margin-bottom: 20px; }
    .label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #671609; margin-bottom: 4px; }
    .value { font-size: 15px; color: #1a1a1a; }
    .description { background: #faf7f5; border-left: 3px solid #671609; padding: 12px 16px; font-size: 14px; line-height: 1.6; white-space: pre-wrap; }
    .footer { background: #f5f5f5; padding: 16px 32px; font-size: 12px; color: #888; }
    .btn { display: inline-block; background: #671609; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Estimate Request</h1>
      <p>augustinehomeimprovements.com · ${dateStr}</p>
    </div>
    <div class="body">
      <div class="field"><div class="label">Name</div><div class="value">${escapeHtml(name)}</div></div>
      <div class="field"><div class="label">Phone</div><div class="value"><a href="tel:${escapeHtml(phone)}">${escapeHtml(phone)}</a></div></div>
      <div class="field"><div class="label">Email</div><div class="value"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></div></div>
      <div class="field"><div class="label">Location</div><div class="value">${escapeHtml(location)}</div></div>
      <div class="field"><div class="label">Best Time to Call</div><div class="value">${escapeHtml(callTime || 'Not specified')}</div></div>
      <div class="field"><div class="label">Services Interested In</div><div class="value">${escapeHtml(servicesList)}</div></div>
      <div class="field"><div class="label">Job Description</div><div class="description">${escapeHtml(description)}</div></div>
      <div style="margin-top:24px"><a href="tel:${escapeHtml(phone)}" class="btn">Call ${escapeHtml(name)}</a></div>
    </div>
    <div class="footer">
      Submitted via augustinehomeimprovements.com. Reply to ${escapeHtml(email)} to respond.
    </div>
  </div>
</body>
</html>`.trim()

  const textBody = `
NEW ESTIMATE REQUEST — augustinehomeimprovements.com
${new Date().toLocaleString('en-US')}

Name: ${name}
Phone: ${phone}
Email: ${email}
Location: ${location}
Best Time to Call: ${callTime || 'Not specified'}
Services: ${servicesList}

Job Description:
${description}

---
Reply to ${email} to respond to this inquiry.
`.trim()

  try {
    await sesClient.send(new SendEmailCommand({
      Source: fromEmail,
      Destination: { ToAddresses: [toEmail] },
      ReplyToAddresses: [email],
      Message: {
        Subject: {
          Data: `New Estimate Request from ${name} — Augustine Home Improvements`,
          Charset: 'UTF-8',
        },
        Body: {
          Html: { Data: htmlBody, Charset: 'UTF-8' },
          Text: { Data: textBody, Charset: 'UTF-8' },
        },
      },
    }))

    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) }
  } catch (err) {
    console.error('[ContactForm] SES send failed:', err)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to send your message. Please call us directly at 484-467-7925.' }),
    }
  }
}

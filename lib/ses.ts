/**
 * AWS SES email helper for contact form submissions.
 * 
 * Required environment variables:
 *   AWS_REGION              - e.g. us-east-1
 *   AWS_ACCESS_KEY_ID       - IAM credentials (or use instance role / env injection)
 *   AWS_SECRET_ACCESS_KEY   
 *   SES_FROM_EMAIL          - Verified sender address
 *   CONTACT_RECIPIENT_EMAIL - Brandon's email
 */

import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'

let client: SESClient | null = null

function getSESClient(): SESClient {
  if (!client) {
    client = new SESClient({
      region: process.env.AWS_REGION || 'us-east-1',
    })
  }
  return client
}

export interface ContactFormPayload {
  name: string
  email: string
  phone: string
  location: string
  callTime: string
  services: string[]
  description: string
}

export async function sendContactEmail(payload: ContactFormPayload): Promise<void> {
  const fromEmail = process.env.SES_FROM_EMAIL
  const toEmail = process.env.CONTACT_RECIPIENT_EMAIL

  if (!fromEmail || !toEmail) {
    throw new Error('SES email configuration missing. Set SES_FROM_EMAIL and CONTACT_RECIPIENT_EMAIL env vars.')
  }

  const servicesList = payload.services.length > 0 ? payload.services.join(', ') : 'Not specified'

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
    .cta { margin-top: 24px; }
    .btn { display: inline-block; background: #671609; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Estimate Request</h1>
      <p>augustinehomeimprovements.com · ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>
    <div class="body">
      <div class="field">
        <div class="label">Name</div>
        <div class="value">${escapeHtml(payload.name)}</div>
      </div>
      <div class="field">
        <div class="label">Phone</div>
        <div class="value"><a href="tel:${escapeHtml(payload.phone)}">${escapeHtml(payload.phone)}</a></div>
      </div>
      <div class="field">
        <div class="label">Email</div>
        <div class="value"><a href="mailto:${escapeHtml(payload.email)}">${escapeHtml(payload.email)}</a></div>
      </div>
      <div class="field">
        <div class="label">Location</div>
        <div class="value">${escapeHtml(payload.location)}</div>
      </div>
      <div class="field">
        <div class="label">Best Time to Call</div>
        <div class="value">${escapeHtml(payload.callTime || 'Not specified')}</div>
      </div>
      <div class="field">
        <div class="label">Services Interested In</div>
        <div class="value">${escapeHtml(servicesList)}</div>
      </div>
      <div class="field">
        <div class="label">Job Description</div>
        <div class="description">${escapeHtml(payload.description)}</div>
      </div>
      <div class="cta">
        <a href="tel:${escapeHtml(payload.phone)}" class="btn">Call ${escapeHtml(payload.name)}</a>
      </div>
    </div>
    <div class="footer">
      This inquiry was submitted via augustinehomeimprovements.com. Reply directly to ${escapeHtml(payload.email)} to respond.
    </div>
  </div>
</body>
</html>
  `.trim()

  const textBody = `
NEW ESTIMATE REQUEST — augustinehomeimprovements.com
${new Date().toLocaleString('en-US')}

Name: ${payload.name}
Phone: ${payload.phone}
Email: ${payload.email}
Location: ${payload.location}
Best Time to Call: ${payload.callTime || 'Not specified'}
Services: ${servicesList}

Job Description:
${payload.description}

---
Reply to ${payload.email} to respond to this inquiry.
  `.trim()

  const command = new SendEmailCommand({
    Source: fromEmail,
    Destination: {
      ToAddresses: [toEmail],
    },
    ReplyToAddresses: [payload.email],
    Message: {
      Subject: {
        Data: `New Estimate Request from ${payload.name} — Augustine Home Improvements`,
        Charset: 'UTF-8',
      },
      Body: {
        Html: { Data: htmlBody, Charset: 'UTF-8' },
        Text: { Data: textBody, Charset: 'UTF-8' },
      },
    },
  })

  await getSESClient().send(command)
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

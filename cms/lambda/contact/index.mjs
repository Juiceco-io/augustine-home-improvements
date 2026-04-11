/**
 * Lambda: contact
 *
 * POST /contact — receives a public contact form submission and sends a
 *                 notification email to the business owner via SES.
 *
 * No authentication required (public endpoint).
 *
 * Environment variables (set via Terraform):
 *   FROM_EMAIL   — SES verified From address (e.g. noreply@augustinehomeimprovements.com)
 *   TO_EMAIL     — Notification recipient (e.g. contact@augustinehomeimprovements.com)
 *   ALLOWED_ORIGINS — Comma-separated allowed CORS origins (or "*" for dev)
 */

import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const ses = new SESClient({});

const FROM_EMAIL = process.env.FROM_EMAIL;
const TO_EMAIL = process.env.TO_EMAIL;

const ALLOWED_ORIGINS = new Set(
  (process.env.ALLOWED_ORIGINS ?? "*")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean)
);

/** Return the CORS origin header to reflect, or "*" in dev. */
function corsOrigin(requestOrigin) {
  if (!requestOrigin) return "*";
  if (ALLOWED_ORIGINS.has("*")) return "*";
  return ALLOWED_ORIGINS.has(requestOrigin) ? requestOrigin : ALLOWED_ORIGINS.values().next().value;
}

function corsHeaders(requestOrigin) {
  return {
    "Access-Control-Allow-Origin": corsOrigin(requestOrigin),
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
  };
}

function response(statusCode, body, requestOrigin) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(requestOrigin),
    },
    body: JSON.stringify(body),
  };
}

/** Basic sanitise: strip control characters, limit length. */
function sanitise(value, maxLen = 500) {
  if (typeof value !== "string") return "";
  // Remove control characters (tab/newline kept, carriage return stripped)
  return value.replace(/[^\x09\x0A\x20-\x7E\u00A0-\uFFFF]/g, "").slice(0, maxLen);
}

function buildEmailBody(fields) {
  const {
    name,
    email,
    phone,
    location,
    callTime,
    services,
    description,
  } = fields;

  const serviceList =
    Array.isArray(services) && services.length > 0
      ? services.map((s) => `  • ${s}`).join("\n")
      : "  (none selected)";

  return [
    "New Contact Form Submission — Augustine Home Improvements",
    "════════════════════════════════════════════════════════",
    "",
    `Name:          ${name}`,
    `Email:         ${email}`,
    `Phone:         ${phone || "(not provided)"}`,
    `Location:      ${location || "(not provided)"}`,
    `Preferred time: ${callTime || "(not provided)"}`,
    "",
    "Services of interest:",
    serviceList,
    "",
    "Message:",
    description || "(no message)",
    "",
    "════════════════════════════════════════════════════════",
    "Reply directly to this email to respond to the customer.",
  ].join("\n");
}

export async function handler(event) {
  const origin = event.headers?.origin ?? event.headers?.Origin ?? "";

  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders(origin),
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return response(405, { error: "Method not allowed" }, origin);
  }

  // Parse body
  let body;
  try {
    body = JSON.parse(event.body ?? "{}");
  } catch {
    return response(400, { error: "Invalid JSON body" }, origin);
  }

  // Required field validation
  const name = sanitise(body.name ?? "", 200);
  const email = sanitise(body.email ?? "", 254);

  if (!name || !email) {
    return response(400, { error: "name and email are required" }, origin);
  }

  // Validate email format (basic)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return response(400, { error: "Invalid email address" }, origin);
  }

  const fields = {
    name,
    email,
    phone: sanitise(body.phone ?? "", 30),
    location: sanitise(body.location ?? "", 200),
    callTime: sanitise(body.callTime ?? "", 50),
    services: Array.isArray(body.services)
      ? body.services.map((s) => sanitise(String(s), 100)).filter(Boolean).slice(0, 20)
      : [],
    description: sanitise(body.description ?? "", 2000),
  };

  const emailBody = buildEmailBody(fields);

  try {
    await ses.send(
      new SendEmailCommand({
        Source: FROM_EMAIL,
        Destination: { ToAddresses: [TO_EMAIL] },
        ReplyToAddresses: [fields.email],
        Message: {
          Subject: {
            Data: `New estimate request from ${fields.name}`,
            Charset: "UTF-8",
          },
          Body: {
            Text: { Data: emailBody, Charset: "UTF-8" },
          },
        },
      })
    );
  } catch (err) {
    console.error("SES send failed:", err);
    return response(500, { error: "Failed to send message. Please call us directly." }, origin);
  }

  return response(200, { success: true }, origin);
}

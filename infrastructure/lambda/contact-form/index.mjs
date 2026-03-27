import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

const ses = new SESv2Client({});

const json = (statusCode, body) => ({
  statusCode,
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

const escape = (v = "") =>
  String(v)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[\d\s\-\+\(\)\.]{7,20}$/;

// Simple in-memory rate limit (resets per Lambda cold start — good enough for low-volume)
const rateMap = new Map();
const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 10 * 60 * 1000;

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  if (entry.count >= RATE_LIMIT) return true;
  entry.count++;
  return false;
}

export const handler = async (event) => {
  try {
    const ip =
      event.requestContext?.http?.sourceIp ||
      event.headers?.["x-forwarded-for"]?.split(",")[0]?.trim() ||
      "unknown";

    if (isRateLimited(ip)) {
      return json(429, {
        error: "Too many requests. Please try again later or call us directly at 484-467-7925.",
      });
    }

    const payload = event?.body ? JSON.parse(event.body) : {};

    const name = String(payload.name ?? "").trim().slice(0, 100);
    const email = String(payload.email ?? "").trim().slice(0, 200);
    const phone = String(payload.phone ?? "").trim().slice(0, 30);
    const location = String(payload.location ?? "").trim().slice(0, 100);
    const callTime = String(payload.callTime ?? "").trim().slice(0, 20);
    const services = Array.isArray(payload.services)
      ? payload.services.slice(0, 10).map((s) => String(s).slice(0, 50))
      : [];
    const description = String(payload.description ?? "").trim().slice(0, 3000);

    const errors = [];
    if (name.length < 2) errors.push("Name is required (minimum 2 characters).");
    if (!emailPattern.test(email)) errors.push("A valid email address is required.");
    if (!phonePattern.test(phone)) errors.push("A valid phone number is required.");
    if (location.length < 2) errors.push("Location is required.");
    if (description.length < 10) errors.push("Job description is required (minimum 10 characters).");

    if (errors.length > 0) {
      return json(422, { error: errors.join(" ") });
    }

    const siteName = process.env.CONTACT_SITE_NAME || "Augustine Home Improvements";
    const servicesText = services.length > 0 ? services.join(", ") : "Not specified";

    await ses.send(
      new SendEmailCommand({
        FromEmailAddress: process.env.CONTACT_FROM_EMAIL,
        Destination: { ToAddresses: [process.env.CONTACT_TO_EMAIL] },
        ReplyToAddresses: [email],
        Content: {
          Simple: {
            Subject: {
              Data: `New contact form submission — ${siteName}`,
            },
            Body: {
              Text: {
                Data: [
                  `New contact form submission — ${siteName}`,
                  "",
                  `Name:        ${name}`,
                  `Email:       ${email}`,
                  `Phone:       ${phone}`,
                  `Location:    ${location}`,
                  `Best Time:   ${callTime || "Not specified"}`,
                  `Services:    ${servicesText}`,
                  "",
                  "Project Description:",
                  description,
                ].join("\n"),
              },
              Html: {
                Data: `
                  <h1>New contact form submission — ${escape(siteName)}</h1>
                  <table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif;font-size:14px;">
                    <tr><td><strong>Name</strong></td><td>${escape(name)}</td></tr>
                    <tr><td><strong>Email</strong></td><td><a href="mailto:${escape(email)}">${escape(email)}</a></td></tr>
                    <tr><td><strong>Phone</strong></td><td><a href="tel:${escape(phone)}">${escape(phone)}</a></td></tr>
                    <tr><td><strong>Location</strong></td><td>${escape(location)}</td></tr>
                    <tr><td><strong>Best Time to Call</strong></td><td>${escape(callTime || "Not specified")}</td></tr>
                    <tr><td><strong>Services Interested In</strong></td><td>${escape(servicesText)}</td></tr>
                  </table>
                  <h2 style="margin-top:20px;font-family:sans-serif;font-size:14px;">Project Description</h2>
                  <p style="font-family:sans-serif;font-size:14px;white-space:pre-wrap;">${escape(description)}</p>
                `,
              },
            },
          },
        },
      })
    );

    return json(200, { success: true });
  } catch (error) {
    console.error("contact-form error", error);
    return json(500, {
      error: "Failed to send your message. Please call us directly at 484-467-7925.",
    });
  }
};

/**
 * Lambda: analytics-ingest
 *
 * POST /analytics — receives a client-side analytics event beacon and
 *                   writes it to DynamoDB. Public endpoint, no auth required.
 *
 * Design principles:
 *   - Never returns an error to the caller (beacons must not affect UX)
 *   - Stores no raw IP addresses (privacy-first)
 *   - Geography derived from CloudFront-Viewer-Country header only
 *   - TTL = now + 1 year (DynamoDB auto-deletes stale events)
 *
 * Environment variables (set via Terraform):
 *   ANALYTICS_TABLE — DynamoDB table name
 *   ALLOWED_ORIGINS — Comma-separated allowed CORS origins (or "*")
 */

import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { randomBytes } from "node:crypto";

const dynamo = new DynamoDBClient({});
const TABLE = process.env.ANALYTICS_TABLE;

const ALLOWED_ORIGINS = new Set(
  (process.env.ALLOWED_ORIGINS ?? "*")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean)
);

function corsOrigin(requestOrigin) {
  if (!requestOrigin) return "*";
  if (ALLOWED_ORIGINS.has("*")) return "*";
  return ALLOWED_ORIGINS.has(requestOrigin) ? requestOrigin : "*";
}

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": corsOrigin(origin),
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
  };
}

function ok(origin) {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
    body: JSON.stringify({ ok: true }),
  };
}

/** Strip control characters and limit length. */
function sanitise(value, maxLen = 500) {
  if (typeof value !== "string") return "";
  return value.replace(/[^\x09\x0A\x20-\x7E\u00A0-\uFFFF]/g, "").slice(0, maxLen);
}

/** Infer device type from User-Agent string without an external dependency. */
function deviceType(ua) {
  if (!ua) return "unknown";
  const s = ua.toLowerCase();
  if (/tablet|ipad|playbook|silk/.test(s)) return "tablet";
  if (/mobile|iphone|ipod|android.*mobile|blackberry|opera mini|windows phone/.test(s)) return "mobile";
  return "desktop";
}

export async function handler(event) {
  const origin = event.headers?.origin ?? event.headers?.Origin ?? "";

  // OPTIONS preflight (belt-and-suspenders — API GW MOCK handles this normally)
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders(origin), body: "" };
  }

  let body;
  try {
    body = JSON.parse(event.body ?? "{}");
  } catch {
    // Silently succeed — bad JSON from a stuck beacon is not actionable
    return ok(origin);
  }

  const {
    eventType,
    page,
    sessionId,
    referrer = "",
    data = {},
  } = body;

  // Required fields — silently ignore payloads missing mandatory fields
  if (
    typeof eventType !== "string" || !eventType ||
    typeof page !== "string" || !page ||
    typeof sessionId !== "string" || !sessionId
  ) {
    return ok(origin);
  }

  const now = Date.now();
  const dateStr = new Date(now).toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
  const suffix = randomBytes(8).toString("hex");
  const sk = `${sanitise(eventType, 50)}#${now}#${suffix}`;

  // Geography from CloudFront-Viewer-Country header (set by CF edge, not forgeable)
  const country = sanitise(
    event.headers?.["cloudfront-viewer-country"] ??
    event.headers?.["CloudFront-Viewer-Country"] ??
    "",
    2
  );

  const ua = event.headers?.["user-agent"] ?? event.headers?.["User-Agent"] ?? "";
  const device = deviceType(ua);

  // Sanitise the flexible data map — only string values, bounded size
  const sanitisedData = {};
  if (typeof data === "object" && data !== null) {
    for (const [k, v] of Object.entries(data).slice(0, 20)) {
      const cleanKey = sanitise(String(k), 50);
      if (cleanKey) sanitisedData[cleanKey] = { S: sanitise(String(v), 200) };
    }
  }

  const ONE_YEAR_S = 365 * 24 * 60 * 60;
  const expiresAt = Math.floor(now / 1000) + ONE_YEAR_S;

  const item = {
    pk:          { S: dateStr },
    sk:          { S: sk },
    eventType:   { S: sanitise(eventType, 50) },
    page:        { S: sanitise(page, 300) },
    sessionId:   { S: sanitise(sessionId, 64) },
    referrer:    { S: sanitise(referrer, 500) },
    country:     { S: country },
    deviceType:  { S: device },
    expiresAt:   { N: String(expiresAt) },
  };

  if (Object.keys(sanitisedData).length > 0) {
    item.data = { M: sanitisedData };
  }

  try {
    await dynamo.send(new PutItemCommand({ TableName: TABLE, Item: item }));
  } catch (err) {
    // Log to CloudWatch but never surface to the caller — beacon must succeed
    console.error("DynamoDB PutItem failed:", err.message ?? err);
  }

  return ok(origin);
}

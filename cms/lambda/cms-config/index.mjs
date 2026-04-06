/**
 * Lambda: cms-config
 *
 * GET  /config → returns the current site-config.json from S3
 * PUT  /config → validates + writes a new site-config.json to S3
 *
 * Protected by API Gateway Cognito authorizer.
 * IAM role grants s3:GetObject + s3:PutObject on the config bucket/key only.
 *
 * Environment variables (set via Terraform):
 *   CONFIG_BUCKET  — S3 bucket name for config (e.g. augustine-config-prod-xxxx)
 *   CONFIG_KEY     — S3 key (e.g. config/site-config.json)
 *   ALLOWED_ORIGIN — CORS origin (e.g. https://admin.augustinehomeimprovements.com)
 */

import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

const s3 = new S3Client({});

const BUCKET = process.env.CONFIG_BUCKET;
const KEY = process.env.CONFIG_KEY ?? "config/site-config.json";

// ALLOWED_ORIGINS is a comma-separated list of allowed origins.
// Falls back to the legacy ALLOWED_ORIGIN single-value env var.
// If neither is set, defaults to '*' (dev fallback only).
const ALLOWED_ORIGINS = new Set(
  (process.env.ALLOWED_ORIGINS ?? process.env.ALLOWED_ORIGIN ?? "*")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean)
);

/**
 * Return the CORS origin to send back. If the request's Origin is in the
 * allowlist, reflect it (required for credentialed requests). Otherwise
 * fall back to the first allowed origin in the set.
 */
function resolveOrigin(event) {
  const requestOrigin =
    event.headers?.Origin ?? event.headers?.origin ?? "";
  if (ALLOWED_ORIGINS.has("*") || ALLOWED_ORIGINS.has(requestOrigin)) {
    return requestOrigin || "*";
  }
  return [...ALLOWED_ORIGINS][0] ?? "*";
}

function corsHeaders(event) {
  return {
    "Access-Control-Allow-Origin": resolveOrigin(event),
    "Access-Control-Allow-Headers": "Authorization,Content-Type",
    "Access-Control-Allow-Methods": "GET,PUT,OPTIONS",
  };
}

function ok(event, body, status = 200) {
  return {
    statusCode: status,
    headers: { "Content-Type": "application/json", ...corsHeaders(event) },
    body: JSON.stringify(body),
  };
}

function err(event, message, status = 400) {
  return {
    statusCode: status,
    headers: { "Content-Type": "application/json", ...corsHeaders(event) },
    body: JSON.stringify({ error: message }),
  };
}

export async function handler(event) {
  const method = event.httpMethod ?? event.requestContext?.http?.method ?? "GET";

  // Handle CORS preflight
  if (method === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders(event), body: "" };
  }

  if (method === "GET") {
    try {
      const res = await s3.send(
        new GetObjectCommand({ Bucket: BUCKET, Key: KEY })
      );
      const body = await res.Body.transformToString();
      return ok(event, JSON.parse(body));
    } catch (e) {
      if (e.name === "NoSuchKey") {
        return err(event, "Config not found — upload initial site-config.json first", 404);
      }
      console.error("GET config error:", e);
      return err(event, "Failed to read config", 500);
    }
  }

  if (method === "PUT") {
    let incoming;
    try {
      incoming = JSON.parse(event.body ?? "{}");
    } catch {
      return err(event, "Invalid JSON body");
    }

    // Basic shape validation — catch obvious mistakes
    if (typeof incoming !== "object" || Array.isArray(incoming)) {
      return err(event, "Body must be a JSON object");
    }
    if (!incoming.brand || !incoming.hero || !incoming.contact || !incoming.features) {
      return err(event, "Missing required fields: brand, hero, contact, features");
    }

    // Fetch current config to increment version
    let currentVersion = 0;
    try {
      const res = await s3.send(
        new GetObjectCommand({ Bucket: BUCKET, Key: KEY })
      );
      const current = JSON.parse(await res.Body.transformToString());
      currentVersion = current._version ?? 0;
    } catch {
      // First write — start at version 0
    }

    // Get the caller's email from Cognito claims (injected by API GW Cognito authorizer)
    const claims =
      event.requestContext?.authorizer?.claims ??
      event.requestContext?.authorizer ?? {};
    const updatedBy = claims.email ?? claims.sub ?? "unknown";

    const newConfig = {
      ...incoming,
      _version: currentVersion + 1,
      _updatedAt: new Date().toISOString(),
      _updatedBy: updatedBy,
    };

    try {
      await s3.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: KEY,
          Body: JSON.stringify(newConfig, null, 2),
          ContentType: "application/json",
          // Versioning is on — S3 keeps the previous version automatically
        })
      );
      return ok(event, { ok: true, version: newConfig._version });
    } catch (e) {
      console.error("PUT config error:", e);
      return err(event, "Failed to write config", 500);
    }
  }

  return err(event, `Method not allowed: ${method}`, 405);
}

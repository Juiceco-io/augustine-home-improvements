/**
 * Lambda: cms-config
 *
 * GET  /config → returns the current DRAFT config (falls back to live if no draft)
 * PUT  /config → validates + writes to DRAFT only (does NOT go live)
 * POST /config → publishes draft → live + CloudFront invalidation
 *
 * Protected by API Gateway Cognito authorizer.
 * IAM role grants s3:GetObject + s3:PutObject on both live and draft keys,
 * plus cloudfront:CreateInvalidation on the site distribution.
 *
 * Environment variables (set via Terraform):
 *   CONFIG_BUCKET              — S3 bucket name for config
 *   CONFIG_KEY                 — S3 key for live config (e.g. config/site-config.json)
 *   DRAFT_KEY                  — S3 key for draft config (e.g. config/draft-site-config.json)
 *   CLOUDFRONT_DISTRIBUTION_ID — Site CloudFront distribution ID for cache invalidation
 *   ALLOWED_ORIGIN / ALLOWED_ORIGINS — CORS origins
 */

import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import {
  CloudFrontClient,
  CreateInvalidationCommand,
} from "@aws-sdk/client-cloudfront";

const s3 = new S3Client({});
const cf = new CloudFrontClient({});

const BUCKET = process.env.CONFIG_BUCKET;
const KEY = process.env.CONFIG_KEY ?? "config/site-config.json";
const DRAFT_KEY = process.env.DRAFT_KEY ?? "config/draft-site-config.json";
const CF_DISTRIBUTION_ID = process.env.CLOUDFRONT_DISTRIBUTION_ID;

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
    "Access-Control-Allow-Methods": "GET,PUT,POST,OPTIONS",
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

/** Read a JSON object from S3. Returns null if the key does not exist. */
async function readS3Json(key) {
  try {
    const res = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
    return JSON.parse(await res.Body.transformToString());
  } catch (e) {
    if (e.name === "NoSuchKey") return null;
    throw e;
  }
}

export async function handler(event) {
  const method = event.httpMethod ?? event.requestContext?.http?.method ?? "GET";

  // Handle CORS preflight
  if (method === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders(event), body: "" };
  }

  // GET /config — return draft config, falling back to live if no draft exists yet
  if (method === "GET") {
    try {
      const draft = await readS3Json(DRAFT_KEY);
      if (draft) return ok(event, draft);

      const live = await readS3Json(KEY);
      if (live) return ok(event, live);

      return err(event, "Config not found — upload initial site-config.json first", 404);
    } catch (e) {
      console.error("GET config error:", e);
      return err(event, "Failed to read config", 500);
    }
  }

  // PUT /config — save changes to DRAFT only (does not affect the live site)
  if (method === "PUT") {
    let incoming;
    try {
      incoming = JSON.parse(event.body ?? "{}");
    } catch {
      return err(event, "Invalid JSON body");
    }

    if (typeof incoming !== "object" || Array.isArray(incoming)) {
      return err(event, "Body must be a JSON object");
    }
    if (!incoming.brand || !incoming.hero || !incoming.contact || !incoming.features) {
      return err(event, "Missing required fields: brand, hero, contact, features");
    }

    // Read version from existing draft, or fall back to live config
    let currentVersion = 0;
    try {
      const current = (await readS3Json(DRAFT_KEY)) ?? (await readS3Json(KEY));
      currentVersion = current?._version ?? 0;
    } catch {
      // First write — start at version 0
    }

    const claims =
      event.requestContext?.authorizer?.claims ??
      event.requestContext?.authorizer ?? {};
    const updatedBy = claims.email ?? claims.sub ?? "unknown";

    const draft = {
      ...incoming,
      _version: currentVersion + 1,
      _updatedAt: new Date().toISOString(),
      _updatedBy: updatedBy,
      _isDraft: true,
    };

    try {
      await s3.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: DRAFT_KEY,
          Body: JSON.stringify(draft, null, 2),
          ContentType: "application/json",
        })
      );
      return ok(event, { ok: true, version: draft._version, draft: true });
    } catch (e) {
      console.error("PUT draft error:", e);
      return err(event, "Failed to write draft", 500);
    }
  }

  // POST /config — publish draft to live + invalidate CloudFront cache
  if (method === "POST") {
    try {
      const draft = await readS3Json(DRAFT_KEY);
      if (!draft) {
        return err(event, "No draft to publish — save changes in the CMS first", 404);
      }

      // Strip the draft marker before publishing
      const { _isDraft, ...liveConfig } = draft;

      await s3.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: KEY,
          Body: JSON.stringify(liveConfig, null, 2),
          ContentType: "application/json",
        })
      );

      // Invalidate CloudFront so the live site picks up changes immediately
      if (CF_DISTRIBUTION_ID) {
        try {
          await cf.send(
            new CreateInvalidationCommand({
              DistributionId: CF_DISTRIBUTION_ID,
              InvalidationBatch: {
                CallerReference: `publish-${Date.now()}`,
                Paths: { Quantity: 1, Items: ["/*"] },
              },
            })
          );
        } catch (cfErr) {
          // Log but don't fail the publish — live config is already updated
          console.error("CloudFront invalidation failed (non-fatal):", cfErr);
        }
      }

      return ok(event, { ok: true, version: liveConfig._version });
    } catch (e) {
      console.error("POST publish error:", e);
      return err(event, "Failed to publish", 500);
    }
  }

  return err(event, `Method not allowed: ${method}`, 405);
}

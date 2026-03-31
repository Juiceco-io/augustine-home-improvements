/**
 * Lambda: cms-media
 *
 * GET /media?category=gallery → list uploaded objects in a given category prefix
 *
 * Response:
 *   { "items": [{ "key": "uploads/gallery/...", "cdnUrl": "https://cdn...", "size": 12345, "lastModified": "..." }] }
 *
 * Protected by API Gateway Cognito authorizer.
 * IAM role grants s3:ListBucket on MEDIA_BUCKET only.
 *
 * Environment variables (set via Terraform):
 *   MEDIA_BUCKET   — S3 bucket for media uploads
 *   UPLOADS_PREFIX — key prefix (default: uploads/)
 *   ALLOWED_ORIGIN — CORS origin
 *   CDN_BASE_URL   — CloudFront base URL
 */

import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

const s3 = new S3Client({});

const BUCKET = process.env.MEDIA_BUCKET;
const UPLOADS_PREFIX = process.env.UPLOADS_PREFIX ?? "uploads/";
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? "*";
const CDN_BASE_URL = (process.env.CDN_BASE_URL ?? "").replace(/\/$/, "");

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "Authorization,Content-Type",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
};

const ALLOWED_CATEGORIES = ["logo", "hero", "gallery"];

function ok(body) {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    body: JSON.stringify(body),
  };
}

function err(message, status = 400) {
  return {
    statusCode: status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    body: JSON.stringify({ error: message }),
  };
}

export async function handler(event) {
  const method = event.httpMethod ?? event.requestContext?.http?.method ?? "GET";

  if (method === "OPTIONS") {
    return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  }

  if (method !== "GET") {
    return err(`Method not allowed: ${method}`, 405);
  }

  const category = event.queryStringParameters?.category ?? null;

  // Build prefix: if category given, scope to that folder; else list all uploads
  let prefix = UPLOADS_PREFIX;
  if (category) {
    if (!ALLOWED_CATEGORIES.includes(category)) {
      return err(`Invalid category. Allowed: ${ALLOWED_CATEGORIES.join(", ")}`);
    }
    prefix = `${UPLOADS_PREFIX}${category}/`;
  }

  try {
    const items = [];
    let continuationToken;

    do {
      const res = await s3.send(
        new ListObjectsV2Command({
          Bucket: BUCKET,
          Prefix: prefix,
          MaxKeys: 200,
          ContinuationToken: continuationToken,
        })
      );

      for (const obj of res.Contents ?? []) {
        items.push({
          key: obj.Key,
          cdnUrl: CDN_BASE_URL ? `${CDN_BASE_URL}/${obj.Key}` : null,
          size: obj.Size,
          lastModified: obj.LastModified?.toISOString() ?? null,
        });
      }

      continuationToken = res.NextContinuationToken;
    } while (continuationToken);

    // Sort by lastModified descending (newest first)
    items.sort((a, b) => (b.lastModified ?? "").localeCompare(a.lastModified ?? ""));

    return ok({ items });
  } catch (e) {
    console.error("List media error:", e);
    return err("Failed to list media", 500);
  }
}

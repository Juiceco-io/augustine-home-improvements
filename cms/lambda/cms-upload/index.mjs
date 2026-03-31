/**
 * Lambda: cms-upload
 *
 * POST /upload → generates a presigned S3 PUT URL so the admin SPA can
 * upload files directly to S3 without routing bytes through Lambda.
 *
 * Request body:
 *   { "filename": "logo.png", "category": "logo", "contentType": "image/png" }
 *
 * Response:
 *   { "uploadUrl": "https://s3.amazonaws.com/...", "cdnUrl": "https://cdn...." }
 *
 * Protected by API Gateway Cognito authorizer.
 * IAM role grants s3:PutObject on MEDIA_BUCKET/uploads/* only.
 *
 * Environment variables (set via Terraform):
 *   MEDIA_BUCKET   — S3 bucket for media uploads
 *   UPLOADS_PREFIX — key prefix (default: uploads/)
 *   ALLOWED_ORIGIN — CORS origin
 *   CDN_BASE_URL   — CloudFront base URL for the CDN distribution
 */

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({});

const BUCKET = process.env.MEDIA_BUCKET;
const UPLOADS_PREFIX = process.env.UPLOADS_PREFIX ?? "uploads/";
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? "*";
const CDN_BASE_URL = (process.env.CDN_BASE_URL ?? "").replace(/\/$/, "");

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "Authorization,Content-Type",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
};

const ALLOWED_CATEGORIES = ["logo", "hero", "gallery"];
const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
];

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
  const method = event.httpMethod ?? event.requestContext?.http?.method ?? "POST";

  if (method === "OPTIONS") {
    return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  }

  if (method !== "POST") {
    return err(`Method not allowed: ${method}`, 405);
  }

  let body;
  try {
    body = JSON.parse(event.body ?? "{}");
  } catch {
    return err("Invalid JSON body");
  }

  const { filename, category, contentType } = body;

  if (!filename || typeof filename !== "string") {
    return err("Missing or invalid 'filename'");
  }
  if (!ALLOWED_CATEGORIES.includes(category)) {
    return err(`Invalid category. Allowed: ${ALLOWED_CATEGORIES.join(", ")}`);
  }
  if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
    return err(
      `Invalid contentType. Allowed: ${ALLOWED_CONTENT_TYPES.join(", ")}`
    );
  }

  // Sanitize filename — strip path components, keep extension
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_").toLowerCase();
  const timestamp = Date.now();
  const key = `${UPLOADS_PREFIX}${category}/${timestamp}-${safeName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });

  try {
    // Presigned URL expires in 15 minutes — ample time for upload
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 900 });
    const cdnUrl = CDN_BASE_URL ? `${CDN_BASE_URL}/${key}` : null;

    return ok({ uploadUrl, cdnUrl, key });
  } catch (e) {
    console.error("Presign error:", e);
    return err("Failed to generate upload URL", 500);
  }
}

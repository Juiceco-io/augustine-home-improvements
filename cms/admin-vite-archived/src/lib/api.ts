/**
 * CMS API client — thin wrapper around the 3 API Gateway endpoints.
 *
 * All requests include the Cognito access token as Bearer auth.
 * Upload flow: getUploadUrl() → PUT directly to S3 presigned URL.
 */

import { getAccessToken } from "./auth";
import type { SiteConfig } from "./types";

const API_URL = (import.meta.env.VITE_API_URL as string ?? "").replace(/\/$/, "");

async function authHeaders(): Promise<HeadersInit> {
  const token = await getAccessToken();
  if (!token) throw new Error("Not authenticated");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function getConfig(): Promise<SiteConfig> {
  const res = await fetch(`${API_URL}/config`, {
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error(`GET /config failed: ${res.status}`);
  return res.json();
}

export async function putConfig(config: SiteConfig): Promise<{ ok: boolean; version: number }> {
  const res = await fetch(`${API_URL}/config`, {
    method: "PUT",
    headers: await authHeaders(),
    body: JSON.stringify(config),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `PUT /config failed: ${res.status}`);
  }
  return res.json();
}

export interface UploadUrlResponse {
  uploadUrl: string;
  cdnUrl: string | null;
  key: string;
}

export async function getUploadUrl(
  filename: string,
  category: "logo" | "hero" | "gallery",
  contentType: string
): Promise<UploadUrlResponse> {
  const res = await fetch(`${API_URL}/upload`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ filename, category, contentType }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `POST /upload failed: ${res.status}`);
  }
  return res.json();
}

/** Upload a file directly to S3 via presigned URL. Returns the CDN URL. */
export async function uploadFile(
  file: File,
  category: "logo" | "hero" | "gallery"
): Promise<string> {
  const { uploadUrl, cdnUrl } = await getUploadUrl(
    file.name,
    category,
    file.type
  );

  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });

  if (!uploadRes.ok) {
    throw new Error(`S3 upload failed: ${uploadRes.status}`);
  }

  if (!cdnUrl) {
    throw new Error("Upload succeeded but no CDN URL returned");
  }

  return cdnUrl;
}

export interface MediaItem {
  key: string;
  cdnUrl: string | null;
  size: number;
  lastModified: string | null;
}

export async function listMedia(
  category?: "logo" | "hero" | "gallery"
): Promise<MediaItem[]> {
  const url = category
    ? `${API_URL}/media?category=${category}`
    : `${API_URL}/media`;
  const res = await fetch(url, {
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error(`GET /media failed: ${res.status}`);
  const data = await res.json();
  return data.items ?? [];
}

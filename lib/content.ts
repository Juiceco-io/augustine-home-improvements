import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import type { SiteContent } from '@/types/content'
import { DEFAULT_SITE_CONTENT } from '@/types/content'

const DRAFT_KEY = 'content/draft.json'
const PUBLISHED_KEY = 'content/published.json'

let _s3Client: S3Client | null = null

function getS3Client(): S3Client {
  if (!_s3Client) {
    _s3Client = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' })
  }
  return _s3Client
}

function getBucket(): string {
  const env = process.env.APP_ENV
  if (!env) throw new Error('APP_ENV environment variable is not set (expected: dev | qa | prd)')
  return `augustine-home-improvements-${env}`
}

async function readS3Json(key: string): Promise<SiteContent | null> {
  const bucket = getBucket()
  try {
    const res = await getS3Client().send(new GetObjectCommand({ Bucket: bucket, Key: key }))
    const body = await res.Body?.transformToString()
    if (!body) return null
    return JSON.parse(body) as SiteContent
  } catch (err: unknown) {
    if (err instanceof Error && (err.name === 'NoSuchKey' || err.name === 'AccessDenied')) {
      return null
    }
    throw err
  }
}

async function writeS3Json(key: string, content: SiteContent): Promise<void> {
  const bucket = getBucket()
  await getS3Client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: JSON.stringify(content, null, 2),
      ContentType: 'application/json',
    })
  )
}

export async function getPublishedContent(): Promise<SiteContent> {
  if (!process.env.CONTENT_S3_BUCKET) {
    return DEFAULT_SITE_CONTENT
  }
  try {
    const content = await readS3Json(PUBLISHED_KEY)
    if (!content) {
      const seeded: SiteContent = {
        ...DEFAULT_SITE_CONTENT,
        meta: { draftLastModified: null, publishedLastModified: new Date().toISOString() },
      }
      // Seed on first run; non-fatal if it fails
      writeS3Json(PUBLISHED_KEY, seeded).catch(() => undefined)
      return seeded
    }
    return content
  } catch {
    return DEFAULT_SITE_CONTENT
  }
}

export async function getDraftContent(): Promise<SiteContent> {
  if (!process.env.CONTENT_S3_BUCKET) {
    return DEFAULT_SITE_CONTENT
  }
  try {
    const draft = await readS3Json(DRAFT_KEY)
    if (!draft) return getPublishedContent()
    return draft
  } catch {
    return getPublishedContent()
  }
}

export async function saveDraft(
  updates: Partial<Omit<SiteContent, 'meta'>>
): Promise<SiteContent> {
  const current = await getDraftContent()
  const now = new Date().toISOString()
  const updated: SiteContent = {
    ...current,
    ...updates,
    meta: {
      draftLastModified: now,
      publishedLastModified: current.meta?.publishedLastModified ?? null,
    },
  }
  await writeS3Json(DRAFT_KEY, updated)
  return updated
}

export async function publishContent(): Promise<{ publishedAt: string }> {
  const draft = await getDraftContent()
  const publishedAt = new Date().toISOString()
  const published: SiteContent = {
    ...draft,
    meta: {
      draftLastModified: draft.meta?.draftLastModified ?? null,
      publishedLastModified: publishedAt,
    },
  }
  await writeS3Json(PUBLISHED_KEY, published)
  // Reset draft to match published so pending-changes indicator clears
  await writeS3Json(DRAFT_KEY, published)
  return { publishedAt }
}

export async function hasPendingChanges(): Promise<boolean> {
  if (!process.env.CONTENT_S3_BUCKET) return false
  try {
    const [draft, published] = await Promise.all([
      readS3Json(DRAFT_KEY),
      readS3Json(PUBLISHED_KEY),
    ])
    if (!draft) return false
    if (!published) return true
    const draftMod = draft.meta?.draftLastModified
    const pubMod = published.meta?.publishedLastModified
    if (!draftMod || !pubMod) return false
    return new Date(draftMod) > new Date(pubMod)
  } catch {
    return false
  }
}

/**
 * Generate a presigned S3 PUT URL for direct browser-to-S3 image uploads.
 * Returns both the upload URL and the final public object URL.
 */
export async function getGalleryUploadUrl(
  filename: string,
  contentType: string
): Promise<{ uploadUrl: string; objectUrl: string }> {
  const bucket = getBucket()
  // Sanitize filename — strip path separators, keep extension
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
  const key = `gallery/${Date.now()}-${safe}`

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  })

  const uploadUrl = await getSignedUrl(getS3Client(), command, { expiresIn: 300 })
  const objectUrl = `https://${bucket}.s3.amazonaws.com/${key}`
  return { uploadUrl, objectUrl }
}

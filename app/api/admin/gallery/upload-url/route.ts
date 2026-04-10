import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { getGalleryUploadUrl } from '@/lib/content'

export const dynamic = 'force-dynamic'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function POST(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { filename?: unknown; contentType?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const filename = typeof body.filename === 'string' ? body.filename : ''
  const contentType = typeof body.contentType === 'string' ? body.contentType : ''

  if (!filename) return NextResponse.json({ error: 'Missing filename' }, { status: 400 })
  if (!ALLOWED_TYPES.includes(contentType)) {
    return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
  }

  const { uploadUrl, objectUrl } = await getGalleryUploadUrl(filename, contentType)
  return NextResponse.json({ uploadUrl, objectUrl })
}

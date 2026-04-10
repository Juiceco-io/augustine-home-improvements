import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { getDraftContent, saveDraft } from '@/lib/content'
import type { GalleryItem } from '@/types/content'

export const dynamic = 'force-dynamic'

const GALLERY_CATEGORIES = ['Decks', 'Kitchens', 'Bathrooms', 'Basements', 'Home Additions', 'Renovations']

function sanitizeItem(obj: Record<string, unknown>): GalleryItem | null {
  if (typeof obj.id !== 'string' || !obj.id) return null
  if (typeof obj.src !== 'string' || !obj.src.startsWith('https://')) return null
  return {
    id: obj.id,
    src: obj.src,
    alt: typeof obj.alt === 'string' ? obj.alt.slice(0, 200) : '',
    caption: typeof obj.caption === 'string' ? obj.caption.slice(0, 200) : '',
    category: GALLERY_CATEGORIES.includes(obj.category as string)
      ? (obj.category as string)
      : 'Renovations',
  }
}

export async function GET() {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const content = await getDraftContent()
  return NextResponse.json(content.gallery)
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const content = await getDraftContent()

  if (Array.isArray(body)) {
    const gallery = body
      .filter((i): i is Record<string, unknown> => typeof i === 'object' && i !== null)
      .map(sanitizeItem)
      .filter((i): i is GalleryItem => i !== null)
    const updated = await saveDraft({ gallery })
    return NextResponse.json({ ok: true, meta: updated.meta })
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const item = sanitizeItem(body as Record<string, unknown>)
  if (!item) return NextResponse.json({ error: 'Invalid gallery item' }, { status: 400 })

  const existing = content.gallery.findIndex((i) => i.id === item.id)
  const gallery =
    existing >= 0
      ? content.gallery.map((i) => (i.id === item.id ? item : i))
      : [...content.gallery, item]

  const updated = await saveDraft({ gallery })
  return NextResponse.json({ ok: true, item, meta: updated.meta })
}

export async function DELETE(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json().catch(() => ({}))
  if (typeof id !== 'string') return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const content = await getDraftContent()
  const gallery = content.gallery.filter((i) => i.id !== id)
  const updated = await saveDraft({ gallery })
  return NextResponse.json({ ok: true, meta: updated.meta })
}

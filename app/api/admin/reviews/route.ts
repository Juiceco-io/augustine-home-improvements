import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { getDraftContent, saveDraft } from '@/lib/content'
import type { Review } from '@/types/content'

export const dynamic = 'force-dynamic'

function sanitizeReview(r: unknown): Review | null {
  if (typeof r !== 'object' || r === null) return null
  const obj = r as Record<string, unknown>
  if (typeof obj.id !== 'string' || !obj.id) return null
  if (typeof obj.name !== 'string' || !obj.name) return null
  if (typeof obj.text !== 'string' || !obj.text) return null
  return {
    id: obj.id,
    name: obj.name.slice(0, 100),
    project: typeof obj.project === 'string' ? obj.project.slice(0, 200) : '',
    location: typeof obj.location === 'string' ? obj.location.slice(0, 100) : '',
    rating: typeof obj.rating === 'number' ? Math.max(1, Math.min(5, Math.floor(obj.rating))) : 5,
    text: obj.text.slice(0, 2000),
    source: typeof obj.source === 'string' ? obj.source.slice(0, 50) : undefined,
  }
}

export async function GET() {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const content = await getDraftContent()
  return NextResponse.json(content.reviews)
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

  // Body can be a single review (add/update) or an array (full replace)
  const content = await getDraftContent()

  if (Array.isArray(body)) {
    // Full replace
    const reviews = body.map(sanitizeReview).filter((r): r is Review => r !== null)
    const updated = await saveDraft({ reviews })
    return NextResponse.json({ ok: true, meta: updated.meta })
  }

  // Single review upsert
  const review = sanitizeReview(body)
  if (!review) return NextResponse.json({ error: 'Invalid review data' }, { status: 400 })

  const existing = content.reviews.findIndex((r) => r.id === review.id)
  const reviews =
    existing >= 0
      ? content.reviews.map((r) => (r.id === review.id ? review : r))
      : [...content.reviews, review]

  const updated = await saveDraft({ reviews })
  return NextResponse.json({ ok: true, review, meta: updated.meta })
}

export async function DELETE(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json().catch(() => ({}))
  if (typeof id !== 'string') return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const content = await getDraftContent()
  const reviews = content.reviews.filter((r) => r.id !== id)
  const updated = await saveDraft({ reviews })
  return NextResponse.json({ ok: true, meta: updated.meta })
}

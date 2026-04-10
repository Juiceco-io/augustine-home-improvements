import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { getDraftContent, saveDraft } from '@/lib/content'
import type { SiteContent, ServicePageSlug } from '@/types/content'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const content = await getDraftContent()
  return NextResponse.json(content)
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: Partial<SiteContent>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Only allow updating specific top-level fields
  const allowed: (keyof SiteContent)[] = ['servicePages', 'aboutPage', 'contactPage']
  const updates: Partial<Omit<SiteContent, 'meta'>> = {}

  for (const key of allowed) {
    if (key in body) {
      // @ts-expect-error — dynamic key assignment
      updates[key] = body[key]
    }
  }

  // Validate servicePages keys
  if (updates.servicePages) {
    const validSlugs: ServicePageSlug[] = [
      'deck-installation',
      'kitchen-renovations',
      'bathroom-remodeling',
      'basement-renovation',
      'home-additions',
      'home-renovations',
    ]
    for (const slug of Object.keys(updates.servicePages)) {
      if (!validSlugs.includes(slug as ServicePageSlug)) {
        return NextResponse.json({ error: `Unknown service page slug: ${slug}` }, { status: 400 })
      }
    }
  }

  const updated = await saveDraft(updates)
  return NextResponse.json({ ok: true, meta: updated.meta })
}

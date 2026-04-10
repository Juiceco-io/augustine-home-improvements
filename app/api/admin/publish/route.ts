import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getAdminSession } from '@/lib/auth'
import { publishContent } from '@/lib/content'

export const dynamic = 'force-dynamic'

const ALL_PATHS = [
  '/',
  '/deck-installation/',
  '/kitchen-renovations/',
  '/bathroom-remodeling/',
  '/basement-renovation/',
  '/home-additions/',
  '/home-renovations/',
  '/gallery/',
  '/reviews/',
  '/about-us/',
  '/contact-us/',
]

export async function POST() {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Copy draft → published on S3
  const { publishedAt } = await publishContent()

  // Revalidate all cached pages so the live site serves fresh content
  for (const path of ALL_PATHS) {
    revalidatePath(path)
  }

  return NextResponse.json({ ok: true, publishedAt })
}

import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getAdminSession } from '@/lib/auth'

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

  for (const path of ALL_PATHS) {
    revalidatePath(path)
  }

  return NextResponse.json({ ok: true, revalidated: ALL_PATHS })
}

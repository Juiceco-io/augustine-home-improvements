import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

const PATHS = [
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

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-revalidate-secret')
  const expectedSecret = process.env.ISR_REVALIDATION_SECRET

  if (!expectedSecret) {
    return NextResponse.json({ error: 'Revalidation not configured.' }, { status: 503 })
  }

  if (secret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const { paths } = await req.json().catch(() => ({ paths: null }))

  const pathsToRevalidate = Array.isArray(paths)
    ? paths.filter((path): path is string => typeof path === 'string' && PATHS.includes(path))
    : PATHS

  const revalidated: string[] = []
  const errors: string[] = []

  for (const path of pathsToRevalidate) {
    try {
      revalidatePath(path)
      revalidated.push(path)
    } catch (err) {
      errors.push(path)
      console.error(`Failed to revalidate ${path}:`, err)
    }
  }

  return NextResponse.json({
    revalidated,
    errors,
    timestamp: new Date().toISOString(),
  })
}

import { NextRequest, NextResponse } from 'next/server'
import { draftMode } from 'next/headers'
import { getAdminSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { enable } = await draftMode()
  enable()

  const redirect = req.nextUrl.searchParams.get('redirect') ?? '/'
  // Only allow same-origin redirects
  const target = redirect.startsWith('/') ? redirect : '/'

  return NextResponse.redirect(new URL(target, req.url))
}

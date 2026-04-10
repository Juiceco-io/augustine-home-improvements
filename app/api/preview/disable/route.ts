import { NextRequest, NextResponse } from 'next/server'
import { draftMode } from 'next/headers'

export async function GET(req: NextRequest) {
  const { disable } = await draftMode()
  disable()

  const redirect = req.nextUrl.searchParams.get('redirect') ?? '/'
  const target = redirect.startsWith('/') ? redirect : '/'

  return NextResponse.redirect(new URL(target, req.url))
}

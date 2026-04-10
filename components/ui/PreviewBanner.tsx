import { draftMode, headers } from 'next/headers'
import PreviewBannerClient from './PreviewBannerClient'

export default async function PreviewBanner() {
  const { isEnabled } = await draftMode()
  if (!isEnabled) return null

  // Get the current path from the request headers so Exit Preview can redirect back
  const headersList = await headers()
  const referer = headersList.get('referer') ?? '/'
  let currentPath = '/'
  try {
    currentPath = new URL(referer).pathname
  } catch {
    currentPath = '/'
  }

  return <PreviewBannerClient currentPath={currentPath} />
}

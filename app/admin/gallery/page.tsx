import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { getDraftContent } from '@/lib/content'
import Link from 'next/link'
import { ArrowLeft, Images } from 'lucide-react'
import GalleryEditor from './GalleryEditor'

export const dynamic = 'force-dynamic'

export default async function AdminGalleryPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  const content = await getDraftContent()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-brand-charcoal text-white">
        <div className="container-xl py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Images size={20} aria-hidden="true" />
            <div>
              <div className="font-semibold">Gallery Photos</div>
              <div className="text-xs text-gray-400">
                {content.gallery.length} photo{content.gallery.length !== 1 ? 's' : ''} · changes saved as draft
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/api/preview/enable?redirect=/gallery/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              Preview Gallery Page
            </a>
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-1.5 text-sm text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft size={14} aria-hidden="true" />
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="container-xl py-10">
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          <GalleryEditor initialItems={content.gallery} />
        </div>
      </main>
    </div>
  )
}

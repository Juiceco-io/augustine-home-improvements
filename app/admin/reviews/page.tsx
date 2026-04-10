import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { getDraftContent } from '@/lib/content'
import Link from 'next/link'
import { ArrowLeft, Star } from 'lucide-react'
import ReviewsEditor from './ReviewsEditor'

export const dynamic = 'force-dynamic'

export default async function AdminReviewsPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  const content = await getDraftContent()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-brand-charcoal text-white">
        <div className="container-xl py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Star size={20} aria-hidden="true" />
            <div>
              <div className="font-semibold">Customer Reviews</div>
              <div className="text-xs text-gray-400">
                {content.reviews.length} review{content.reviews.length !== 1 ? 's' : ''} · changes saved as draft
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/api/preview/enable?redirect=/reviews/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              Preview Reviews Page
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

      <main className="container-xl py-10 max-w-3xl">
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          <ReviewsEditor initialReviews={content.reviews} />
        </div>
      </main>
    </div>
  )
}

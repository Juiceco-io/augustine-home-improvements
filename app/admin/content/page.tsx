import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { getDraftContent } from '@/lib/content'
import Link from 'next/link'
import { ArrowLeft, FileText } from 'lucide-react'
import ContentEditor from './ContentEditor'

export const dynamic = 'force-dynamic'

export default async function AdminContentPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  const content = await getDraftContent()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-brand-charcoal text-white">
        <div className="container-xl py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText size={20} aria-hidden="true" />
            <div>
              <div className="font-semibold">Page Content</div>
              <div className="text-xs text-gray-400">Edit service page titles, subtitles, and &quot;What&apos;s Included&quot; lists</div>
            </div>
          </div>
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-1.5 text-sm text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Dashboard
          </Link>
        </div>
      </header>

      <main className="container-xl py-10 max-w-4xl">
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          <ContentEditor initialContent={content} />
        </div>
      </main>
    </div>
  )
}

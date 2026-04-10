import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import Link from 'next/link'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import RevalidateButton from './RevalidateButton'

export const dynamic = 'force-dynamic'

export default async function AdminRevalidatePage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-brand-charcoal text-white">
        <div className="container-xl py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RefreshCw size={20} aria-hidden="true" />
            <div>
              <div className="font-semibold">Refresh Site</div>
              <div className="text-xs text-gray-400">Force-clear the ISR page cache</div>
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

      <main className="container-xl py-10 max-w-xl">
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          <h1 className="font-serif text-2xl font-bold text-brand-charcoal mb-6">Force Refresh</h1>
          <RevalidateButton />
        </div>
      </main>
    </div>
  )
}

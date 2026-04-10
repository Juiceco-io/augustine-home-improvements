import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { getDraftContent, hasPendingChanges } from '@/lib/content'
import Link from 'next/link'
import {
  LayoutDashboard,
  Images,
  Star,
  FileText,
  RefreshCw,
  LogOut,
  Phone,
  ExternalLink,
  Eye,
} from 'lucide-react'
import PublishButton from './PublishButton'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const session = await getAdminSession()
  if (!session) {
    redirect('/admin/login')
  }

  const [content, pending] = await Promise.all([getDraftContent(), hasPendingChanges()])

  const adminModules = [
    {
      title: 'Page Content',
      description: 'Edit titles, subtitles, and "What\'s Included" lists for all service pages.',
      icon: FileText,
      href: '/admin/content',
      status: 'Available',
      disabled: false,
    },
    {
      title: 'Gallery Photos',
      description: 'Upload, caption, and organize project photos.',
      icon: Images,
      href: '/admin/gallery',
      status: 'Available',
      disabled: false,
    },
    {
      title: 'Customer Reviews',
      description: 'Add, edit, or remove customer testimonials.',
      icon: Star,
      href: '/admin/reviews',
      status: 'Available',
      disabled: false,
    },
    {
      title: 'Force Refresh',
      description: 'Manually flush the ISR page cache without publishing new content.',
      icon: RefreshCw,
      href: '/admin/revalidate',
      status: 'Available',
      disabled: false,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-brand-charcoal text-white">
        <div className="container-xl py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutDashboard size={20} aria-hidden="true" />
            <div>
              <div className="font-semibold">Admin Dashboard</div>
              <div className="text-xs text-gray-400">Augustine Home Improvements • Cognito secured</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 text-sm text-gray-300 hover:text-white transition-colors"
            >
              <ExternalLink size={14} aria-hidden="true" />
              View Site
            </Link>
            <form action="/api/admin/auth" method="POST">
              <input type="hidden" name="_action" value="logout" />
              <button
                type="submit"
                className="flex items-center gap-1.5 text-sm text-gray-300 hover:text-white transition-colors"
              >
                <LogOut size={14} aria-hidden="true" />
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="container-xl py-10">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-brand-charcoal">
            Welcome back, {session.username}
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your site content, photos, and reviews from here.
          </p>
        </div>

        {/* Publish + Preview bar */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold text-brand-charcoal">Publish to Live Site</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Preview your draft changes first, then publish when ready.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <a
              href="/api/preview/enable?redirect=/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white border-2 border-brand-red text-brand-red px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-red/5 transition-colors"
            >
              <Eye size={15} aria-hidden="true" />
              Preview Site
            </a>
            <PublishButton hasPending={pending} />
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Service Pages', value: '6' },
            { label: 'Reviews (draft)', value: String(content.reviews.length) },
            { label: 'Gallery Photos', value: String(content.gallery.length) },
            { label: 'Contact Form', value: 'Active' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <div className="font-serif text-2xl font-bold text-brand-red">{value}</div>
              <div className="text-sm text-gray-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Admin modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {adminModules.map(({ title, description, icon: Icon, href, status, disabled }) => (
            <div
              key={title}
              className={`bg-white rounded-xl p-6 border border-gray-100 shadow-sm ${
                disabled ? 'opacity-60' : 'hover:border-brand-brick/30 transition-colors'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-brand-red/10 flex items-center justify-center flex-shrink-0">
                    <Icon size={20} className="text-brand-red" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-brand-charcoal">{title}</h2>
                    <p className="text-sm text-gray-500 mt-0.5">{description}</p>
                  </div>
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${
                    status === 'Available'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {status}
                </span>
              </div>
              {!disabled && (
                <Link
                  href={href}
                  className="mt-4 inline-flex items-center text-sm font-semibold text-brand-red hover:underline"
                >
                  Open →
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Quick contact info */}
        <div className="mt-8 bg-brand-cream rounded-xl p-6 border border-brand-brick/15">
          <h3 className="font-semibold text-brand-charcoal mb-3">Site Contact Info</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone size={14} className="text-brand-red" aria-hidden="true" />
            Phone displayed on site: <strong>{content.contactPage.phone}</strong>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            To update the phone number or hours, edit them in{' '}
            <Link href="/admin/content" className="text-brand-red hover:underline">
              Page Content
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  )
}


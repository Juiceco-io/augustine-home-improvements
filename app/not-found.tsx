import type { Metadata } from 'next'
import Link from 'next/link'
import { Home, Phone } from 'lucide-react'

export const metadata: Metadata = {
  title: '404 — Page Not Found | Augustine Home Improvements',
  robots: { index: false },
}

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-cream px-4">
      <div className="text-center max-w-md">
        <div className="font-serif text-8xl font-bold text-brand-red/20 mb-4">404</div>
        <h1 className="font-serif text-3xl font-bold text-brand-charcoal mb-3">
          Page Not Found
        </h1>
        <p className="text-gray-600 mb-8">
          Sorry, the page you&apos;re looking for doesn&apos;t exist or has been moved. Try navigating back home or contacting us directly.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary">
            <Home size={16} aria-hidden="true" />
            Go Home
          </Link>
          <a href="tel:+14844677925" className="flex items-center justify-center gap-2 font-semibold text-brand-red">
            <Phone size={16} aria-hidden="true" />
            484-467-7925
          </a>
        </div>
      </div>
    </div>
  )
}

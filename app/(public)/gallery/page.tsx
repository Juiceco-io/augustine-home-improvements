import type { Metadata } from 'next'
import Link from 'next/link'
import { Images } from 'lucide-react'
import InlineCta from '@/components/sections/InlineCta'

export const metadata: Metadata = {
  title: 'Project Gallery | Home Improvements in Chester County PA',
  description:
    'View project photos from Augustine Home Improvements — deck installations, kitchen remodels, bathroom renovations, and more in Chester County PA.',
  alternates: { canonical: '/gallery/' },
}

// Gallery categories for filtering (content managed via admin CMS)
const categories = [
  'All',
  'Decks',
  'Kitchens',
  'Bathrooms',
  'Basements',
  'Home Additions',
  'Renovations',
]

export default function GalleryPage() {
  return (
    <>
      {/* Hero */}
      <section
        className="relative min-h-[40vh] flex items-center"
        style={{ background: 'linear-gradient(135deg, #4d1006 0%, #671609 40%, #8d1e0c 100%)' }}
      >
        <div className="container-xl py-24 pt-40">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-2 text-sm text-white/60">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-white/80" aria-current="page">Gallery</li>
            </ol>
          </nav>
          <h1 className="font-serif text-4xl md:text-5xl text-white font-bold">
            Project Gallery
          </h1>
          <p className="mt-3 text-white/80 text-lg max-w-xl">
            Real projects completed by Augustine Home Improvements in Chester County, PA and surrounding communities.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container-xl">
          {/* Category filter - static for now */}
          <div className="flex flex-wrap gap-2 mb-10 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all ${
                  cat === 'All'
                    ? 'bg-brand-red text-white border-brand-red'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-brand-red hover:text-brand-red'
                }`}
                aria-pressed={cat === 'All'}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Empty state - photos managed via admin CMS */}
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-2xl bg-brand-red/10 flex items-center justify-center mb-6">
              <Images size={36} className="text-brand-red/50" aria-hidden="true" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-brand-charcoal mb-3">
              Photos Coming Soon
            </h2>
            <p className="text-gray-500 max-w-md mb-6">
              Project photos are uploaded and managed by the site owner. Check back soon to see Augustine Home Improvements&apos; latest completed projects.
            </p>
            <Link href="/contact-us/" className="btn-primary">
              Request a Free Estimate
            </Link>
          </div>
        </div>
      </section>

      <InlineCta
        heading="See the Quality for Yourself"
        subtext="Contact us to discuss your project. We're happy to share additional project photos during your free consultation."
      />
    </>
  )
}

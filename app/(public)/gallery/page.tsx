import type { Metadata } from 'next'
import Link from 'next/link'
import { draftMode } from 'next/headers'
import { getDraftContent, getPublishedContent } from '@/lib/content'
import GalleryGrid from '@/components/ui/GalleryGrid'
import InlineCta from '@/components/sections/InlineCta'

export const metadata: Metadata = {
  title: 'Project Gallery | Home Improvements in Chester County PA',
  description:
    'View project photos from Augustine Home Improvements — deck installations, kitchen remodels, bathroom renovations, and more in Chester County PA.',
  alternates: { canonical: '/gallery/' },
}

export default async function GalleryPage() {
  const { isEnabled } = await draftMode()
  const content = isEnabled ? await getDraftContent() : await getPublishedContent()
  const galleryItems = content.gallery
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
          <GalleryGrid items={galleryItems} />
        </div>
      </section>

      <InlineCta
        heading="See the Quality for Yourself"
        subtext="Contact us to discuss your project. We're happy to share additional project photos during your free consultation."
      />
    </>
  )
}

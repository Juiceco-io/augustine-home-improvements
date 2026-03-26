import type { Metadata } from 'next'
import { Star } from 'lucide-react'
import Link from 'next/link'
import InlineCta from '@/components/sections/InlineCta'

export const metadata: Metadata = {
  title: 'Customer Reviews | Augustine Home Improvements | Chester County PA',
  description:
    'Read real customer reviews for Augustine Home Improvements — home renovations, deck installation, kitchens, and more in Chester County PA. 5-star rated contractor.',
  alternates: { canonical: '/reviews/' },
}

const reviews = [
  {
    name: 'Matthew G.',
    project: 'Full Home Renovation',
    location: 'Chester County, PA',
    rating: 5,
    text: 'Augustine Home Improvement LLC did a great job with our home renovation. Our house was a full gut job and Brandon and his team did an excellent job all around. The work was timely, professional and done well. My house was a full gut job that cost us over $200K. It included taking down load bearing walls (with engineering approval), replacing all flooring, two total bathroom replacements, drywall and wood panel removal, and almost a full house of drywall replacement as well as extensive electrical and plumbing work. I highly recommend them for any of your home improvement needs!',
  },
  {
    name: 'Charmaine P.',
    project: 'Kitchen Remodel',
    location: 'Chester County, PA',
    rating: 5,
    text: "From start to finish of our kitchen remodel, Brandon kept us informed of the time frame. His crews were courteous and efficient. Work area was cleaned after every day. His suggestions were eye opening and welcomed. We love our kitchen and look forward to other projects completed by Augustine Home Improvements.",
  },
  {
    name: 'Jeff Van de M.',
    project: 'Home Improvement Project',
    location: 'Chester County, PA',
    rating: 5,
    text: "Can't say enough about working with Brandon Augustine. On time, great work, great attitude from the entire team. Will be my first call for next project.",
  },
]

export default function ReviewsPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Augustine Home Improvements LLC',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5',
      reviewCount: String(reviews.length),
      bestRating: '5',
    },
    review: reviews.map((r) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: r.name },
      reviewRating: { '@type': 'Rating', ratingValue: String(r.rating) },
      reviewBody: r.text,
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

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
              <li className="text-white/80" aria-current="page">Reviews</li>
            </ol>
          </nav>
          <h1 className="font-serif text-4xl md:text-5xl text-white font-bold">
            Customer Reviews
          </h1>
          <p className="mt-3 text-white/80 text-lg max-w-xl">
            Real feedback from homeowners in Chester County and surrounding communities.
          </p>
          <div className="flex items-center gap-2 mt-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={20} className="text-yellow-400 fill-yellow-400" aria-hidden="true" />
            ))}
            <span className="text-white/80 text-sm ml-1">5.0 average · {reviews.length} reviews</span>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-20 bg-white">
        <div className="container-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {reviews.map((review, i) => (
              <article
                key={i}
                className="bg-brand-cream rounded-2xl p-7 border border-brand-brick/15 flex flex-col"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: review.rating }).map((_, j) => (
                    <Star key={j} size={18} className="text-yellow-400 fill-yellow-400" aria-hidden="true" />
                  ))}
                </div>
                <blockquote className="text-gray-700 leading-relaxed italic flex-1">
                  &ldquo;{review.text}&rdquo;
                </blockquote>
                <footer className="mt-6 pt-4 border-t border-brand-brick/15">
                  <cite className="not-italic">
                    <div className="font-bold text-brand-charcoal">{review.name}</div>
                    <div className="text-sm text-gray-500 mt-0.5">{review.project}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{review.location}</div>
                  </cite>
                </footer>
              </article>
            ))}
          </div>

          {/* Leave a review CTA */}
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">Worked with us? We&apos;d love to hear from you.</p>
            <a
              href="https://www.facebook.com/augustinehomeimprovements"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex"
            >
              Leave a Review on Facebook
            </a>
          </div>
        </div>
      </section>

      <InlineCta heading="Ready to Be Our Next Happy Customer?" subtext="Contact us today for a free estimate. Serving Chester County PA and suburban Philadelphia." />
    </>
  )
}

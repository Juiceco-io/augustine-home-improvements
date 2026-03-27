import type { Metadata } from 'next'
import { CheckCircle, Star, Phone } from 'lucide-react'
import Link from 'next/link'
import ServicePageHero from '@/components/sections/ServicePageHero'
import InlineCta from '@/components/sections/InlineCta'
import ContactForm from '@/components/sections/ContactForm'

export const metadata: Metadata = {
  title: 'Custom Deck Installation | Chester County PA | Call 484-467-7925',
  description:
    'TrexPro certified deck builders serving Chester County and suburban Philadelphia. Custom Trex composite and wood decks built for durability and beauty. Free estimates. Call 484-467-7925.',
  alternates: { canonical: '/deck-installation/' },
  openGraph: {
    title: 'Custom Deck Installation | Chester County PA | Augustine Home Improvements',
    description: 'TrexPro certified deck builders. Custom composite and wood decks for Chester County PA homeowners. Free estimates — call 484-467-7925.',
  },
}

const included = [
  'Full design consultation and layout planning',
  'Trex composite or treated wood deck materials',
  'Custom railings, stairs, and built-in seating',
  'Pergolas and shade structures',
  'Deck lighting integration',
  'Proper permits and code compliance',
  'Post-build cleanup and inspection',
]

export default function DeckInstallationPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Deck Installation',
    name: 'Custom Deck Installation',
    description:
      'TrexPro certified custom deck installation in Chester County PA. Composite and wood decks, railings, pergolas and more.',
    provider: {
      '@type': 'HomeAndConstructionBusiness',
      name: 'Augustine Home Improvements LLC',
      telephone: '+14844677925',
    },
    areaServed: { '@type': 'County', name: 'Chester County, PA' },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <ServicePageHero
        title="Custom Deck Installation in Chester County, PA"
        subtitle="TrexPro certified deck builders creating beautiful, durable outdoor living spaces for homeowners across Chester County and suburban Philadelphia."
        breadcrumb="Deck Installation"
        badge="TrexPro Certified"
      />

      <section className="py-20 bg-white">
        <div className="container-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <div className="section-badge">Expert Deck Builders</div>
              <h2 className="section-heading">
                Build Your Dream Outdoor Living Space
              </h2>
              <div className="mt-4 space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Let the experts at family and locally owned Augustine Home Improvements build a getaway in your backyard. Spend quality time alone or with friends on a custom deck built to last a lifetime.
                </p>
                <p>
                  As a <strong className="text-brand-charcoal">TrexPro certified installer</strong>, Brandon Augustine and his team specialize in Trex composite decking — the industry leader in low-maintenance, high-performance outdoor decking. We also work with premium treated wood for homeowners who prefer a traditional look.
                </p>
                <p>
                  We serve Chester County communities including Phoenixville, Malvern, Downingtown, West Chester, Exton, Coatesville, and all of suburban Philadelphia.
                </p>
              </div>
              <div className="mt-8">
                <h3 className="font-serif text-xl font-bold text-brand-charcoal mb-4">
                  What&apos;s Included
                </h3>
                <ul className="space-y-3">
                  {included.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle size={18} className="text-brand-red flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <span className="text-gray-700 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-brand-cream rounded-2xl p-6 border border-brand-brick/15">
                <div className="flex items-center gap-2 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" aria-hidden="true" />
                  ))}
                </div>
                <blockquote className="text-gray-700 text-sm italic leading-relaxed">
                  &ldquo;Can&apos;t say enough about working with Brandon Augustine. On time, great work, great attitude from the entire team. Will be my first call for next project.&rdquo;
                </blockquote>
                <div className="mt-3 font-bold text-brand-charcoal text-sm">— Jeff Van de M.</div>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <h3 className="font-serif text-xl font-bold text-brand-charcoal mb-6">
                  Get a Free Deck Estimate
                </h3>
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      <InlineCta
        heading="Ready to Build Your Deck?"
        subtext="Call us today or fill out our form for a free, no-obligation deck installation estimate in Chester County, PA."
      />
    </>
  )
}

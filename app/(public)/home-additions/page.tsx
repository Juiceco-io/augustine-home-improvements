import type { Metadata } from 'next'
import { CheckCircle } from 'lucide-react'
import ServicePageHero from '@/components/sections/ServicePageHero'
import InlineCta from '@/components/sections/InlineCta'
import ContactForm from '@/components/sections/ContactForm'

export const metadata: Metadata = {
  title: 'Home Additions | Chester County PA | Call 484-467-7925',
  description:
    'Expert home addition contractors serving Chester County PA. Room additions, second stories, sunrooms, and more. Licensed & insured. Free estimates — 484-467-7925.',
  alternates: { canonical: '/home-additions/' },
}

const included = [
  'Full structural engineering coordination',
  'Foundation and framing',
  'Roofline integration and weatherproofing',
  'Electrical, plumbing, and HVAC extension',
  'Interior finishing to match existing home',
  'Permit acquisition and code compliance',
  'Architectural design assistance',
]

export default function HomeAdditionsPage() {
  return (
    <>
      <ServicePageHero
        title="Home Additions in Chester County, PA"
        subtitle="Need more space? We design and build seamless structural additions that complement your existing home — beautifully integrated and built to last."
        breadcrumb="Home Additions"
      />
      <section className="py-20 bg-white">
        <div className="container-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <div className="section-badge">Home Addition Experts</div>
              <h2 className="section-heading">Expand Your Home, Expand Your Life</h2>
              <div className="mt-4 space-y-4 text-gray-600 leading-relaxed">
                <p>
                  When your family outgrows your current space but you love your neighborhood, a home addition is the perfect solution. Augustine Home Improvements builds seamless room additions, second stories, sunrooms, master suite expansions, and more throughout Chester County, PA.
                </p>
                <p>
                  We manage the entire process — from architectural design and permitting to foundation work, framing, and interior finishing. Our team ensures the addition blends naturally with your existing home in style, materials, and quality.
                </p>
                <p>
                  Every addition is engineered properly with load-bearing calculations where required. We&apos;ve successfully managed additions involving taking down load-bearing walls and major structural work.
                </p>
              </div>
              <div className="mt-8">
                <h3 className="font-serif text-xl font-bold text-brand-charcoal mb-4">What&apos;s Included</h3>
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
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h3 className="font-serif text-xl font-bold text-brand-charcoal mb-6">Get a Free Addition Estimate</h3>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
      <InlineCta heading="Ready to Add More Space?" subtext="Contact us today for a free home addition estimate in Chester County, PA." />
    </>
  )
}

import type { Metadata } from 'next'
import { CheckCircle } from 'lucide-react'
import ServicePageHero from '@/components/sections/ServicePageHero'
import InlineCta from '@/components/sections/InlineCta'
import ContactForm from '@/components/sections/ContactForm'

export const metadata: Metadata = {
  title: 'Bathroom Remodeling | Chester County PA | Call 484-467-7925',
  description:
    'Luxury bathroom remodeling in Chester County PA. Full renovations, walk-in showers, accessibility upgrades, and more. Licensed & insured. Free estimates — 484-467-7925.',
  alternates: { canonical: '/bathroom-remodeling/' },
}

const included = [
  'Walk-in showers and soaking tubs',
  'Vanity and fixture replacement',
  'Custom tile work (floors, walls, showers)',
  'Accessibility upgrades (grab bars, walk-in options)',
  'Lighting and ventilation improvements',
  'Plumbing updates and re-piping',
  'Full gut and rebuild available',
]

export default function BathroomRemodelingPage() {
  return (
    <>
      <ServicePageHero
        title="Bathroom Remodeling in Chester County, PA"
        subtitle="If you've had your home for years and your bathroom is looking less than stellar, the time may be right for a remodeling job. You deserve a luxurious one."
        breadcrumb="Bathroom Remodeling"
      />
      <section className="py-20 bg-white">
        <div className="container-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <div className="section-badge">Bathroom Experts</div>
              <h2 className="section-heading">Your Dream Bathroom Awaits</h2>
              <div className="mt-4 space-y-4 text-gray-600 leading-relaxed">
                <p>
                  A bathroom remodel can transform your daily routine and dramatically increase your home&apos;s value. Augustine Home Improvements specializes in full bathroom renovations — from cosmetic updates to complete gut jobs — serving homeowners across Chester County and suburban Philadelphia.
                </p>
                <p>
                  We offer accessibility-aware designs for aging-in-place needs, including walk-in showers, grab bars, and barrier-free layouts. Whether you want a luxurious spa-inspired retreat or a practical family bathroom, we deliver it on time and on budget.
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
              <h3 className="font-serif text-xl font-bold text-brand-charcoal mb-6">Get a Free Bathroom Estimate</h3>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
      <InlineCta heading="Ready to Remodel Your Bathroom?" subtext="Contact us today for a free bathroom remodeling estimate in Chester County, PA." />
    </>
  )
}

import type { Metadata } from 'next'
import { CheckCircle } from 'lucide-react'
import ServicePageHero from '@/components/sections/ServicePageHero'
import InlineCta from '@/components/sections/InlineCta'
import ContactForm from '@/components/sections/ContactForm'

export const metadata: Metadata = {
  title: 'Kitchen Renovations | Chester County PA | Call 484-467-7925',
  description:
    'Expert kitchen remodeling in Chester County PA. From new appliances and cabinets to full gut renovations. Licensed pros. Free estimates — call 484-467-7925.',
  alternates: { canonical: '/kitchen-renovations/' },
}

const included = [
  'Custom cabinetry and hardware selection',
  'Countertop installation (granite, quartz, laminate)',
  'Appliance installation and plumbing fixtures',
  'Tile backsplash and flooring',
  'Lighting design and electrical updates',
  'Pantry and storage optimization',
  'Full design-to-build project management',
]

export default function KitchenRenovationsPage() {
  return (
    <>
      <ServicePageHero
        title="Kitchen Renovations in Chester County, PA"
        subtitle="From modern appliances to custom cabinetry — our licensed pros design and build your ultimate kitchen to meet your needs and budget."
        breadcrumb="Kitchen Renovations"
      />
      <section className="py-20 bg-white">
        <div className="container-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <div className="section-badge">Kitchen Experts</div>
              <h2 className="section-heading">The Kitchen You&apos;ve Always Wanted</h2>
              <div className="mt-4 space-y-4 text-gray-600 leading-relaxed">
                <p>
                  A kitchen renovation is one of the highest-ROI investments you can make in your Chester County home. Whether you want to modernize an outdated kitchen, maximize storage, or create a chef&apos;s dream workspace, Augustine Home Improvements delivers exceptional results.
                </p>
                <p>
                  From installing new, modern appliances to custom plumbing fixtures, our licensed pros will design your ultimate kitchen to meet your needs and budget. We handle everything from demolition to the finishing touches — so you don&apos;t have to coordinate multiple contractors.
                </p>
                <p>
                  &ldquo;From start to finish of our kitchen remodel, Brandon kept us informed of the time frame. His crews were courteous and efficient. Work area was cleaned after every day.&rdquo; — Charmaine P.
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
              <h3 className="font-serif text-xl font-bold text-brand-charcoal mb-6">Get a Free Kitchen Estimate</h3>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
      <InlineCta heading="Ready to Remodel Your Kitchen?" subtext="Contact us today for a free kitchen renovation estimate in Chester County, PA." />
    </>
  )
}

import type { Metadata } from 'next'
import { CheckCircle } from 'lucide-react'
import { draftMode } from 'next/headers'
import { getDraftContent, getPublishedContent } from '@/lib/content'
import ServicePageHero from '@/components/sections/ServicePageHero'
import InlineCta from '@/components/sections/InlineCta'
import ContactForm from '@/components/sections/ContactForm'

export const metadata: Metadata = {
  title: 'Home Renovations | Chester County PA | Call 484-467-7925',
  description:
    'Whole-home renovation experts in Chester County PA. Full gut jobs, large-scale remodels, and multi-room renovations. Licensed & insured. Free estimates — 484-467-7925.',
  alternates: { canonical: '/home-renovations/' },
}

export default async function HomeRenovationsPage() {
  const { isEnabled } = await draftMode()
  const content = isEnabled ? await getDraftContent() : await getPublishedContent()
  const page = content.servicePages['home-renovations']
  const included = page.included
  return (
    <>
      <ServicePageHero
        title={page.title}
        subtitle={page.subtitle}
        breadcrumb="Home Renovations"
      />
      <section className="py-20 bg-white">
        <div className="container-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <div className="section-badge">Whole-Home Experts</div>
              <h2 className="section-heading">Transform Your Entire Home</h2>
              <div className="mt-4 space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Augustine Home Improvements LLC provides whole home renovations to the Chester County, PA area. Whether you&apos;ve purchased a fixer-upper or want to bring your aging home into the modern era, our team handles projects of any scale.
                </p>
                <p>
                  One of our recent projects was a full gut job that cost over $200K, including taking down load-bearing walls (with engineering approval), replacing all flooring, two total bathroom replacements, and almost a full house of drywall replacement as well as extensive electrical and plumbing work.
                </p>
                <p>
                  &ldquo;The work was timely, professional and done well... I highly recommend them for any of your home improvement needs!&rdquo; — Matthew G.
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
              <h3 className="font-serif text-xl font-bold text-brand-charcoal mb-6">Get a Free Renovation Estimate</h3>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
      <InlineCta heading="Ready to Renovate Your Home?" subtext="Contact us today for a free whole-home renovation estimate in Chester County, PA." />
    </>
  )
}

import type { Metadata } from 'next'
import { CheckCircle } from 'lucide-react'
import { draftMode } from 'next/headers'
import { getDraftContent, getPublishedContent } from '@/lib/content'
import ServicePageHero from '@/components/sections/ServicePageHero'
import InlineCta from '@/components/sections/InlineCta'
import ContactForm from '@/components/sections/ContactForm'

export const metadata: Metadata = {
  title: 'Basement Renovation & Finishing | Chester County PA | 484-467-7925',
  description:
    'Professional basement finishing and renovation in Chester County PA. Rec rooms, home offices, bars, and more. Free estimates — call 484-467-7925.',
  alternates: { canonical: '/basement-renovation/' },
}

export default async function BasementRenovationPage() {
  const { isEnabled } = await draftMode()
  const content = isEnabled ? await getDraftContent() : await getPublishedContent()
  const page = content.servicePages['basement-renovation']
  const included = page.included
  return (
    <>
      <ServicePageHero
        title={page.title}
        subtitle={page.subtitle}
        breadcrumb="Basement Renovation"
      />
      <section className="py-20 bg-white">
        <div className="container-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <div className="section-badge">Basement Specialists</div>
              <h2 className="section-heading">Turn Your Basement Into Livable Space</h2>
              <div className="mt-4 space-y-4 text-gray-600 leading-relaxed">
                <p>
                  An unfinished basement is untapped square footage just waiting to be transformed. Augustine Home Improvements can convert your basement into a fully finished living area — rec room, home theater, bar, home office, guest suite, or playroom.
                </p>
                <p>
                  We handle all aspects of the build, from framing and insulation to flooring, lighting, and finishing. Our team coordinates all trades so you get a seamless, professionally finished space that adds real value to your Chester County home.
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
              <h3 className="font-serif text-xl font-bold text-brand-charcoal mb-6">Get a Free Basement Estimate</h3>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
      <InlineCta heading="Ready to Finish Your Basement?" subtext="Contact us today for a free basement renovation estimate in Chester County, PA." />
    </>
  )
}

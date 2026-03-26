import type { Metadata } from 'next'
import { Phone, Clock, MapPin, Share2 } from 'lucide-react'
import Link from 'next/link'
import ContactForm from '@/components/sections/ContactForm'

export const metadata: Metadata = {
  title: 'Contact Us | Free Estimate | Chester County PA | 484-467-7925',
  description:
    'Contact Augustine Home Improvements for a free home improvement estimate in Chester County PA. Call 484-467-7925 or fill out our form. We respond within 1 business day.',
  alternates: { canonical: '/contact-us/' },
}

export default function ContactUsPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact Augustine Home Improvements',
    description: 'Request a free home improvement estimate in Chester County, PA.',
    url: 'https://www.augustinehomeimprovements.com/contact-us/',
    mainEntity: {
      '@type': 'HomeAndConstructionBusiness',
      name: 'Augustine Home Improvements LLC',
      telephone: '+14844677925',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Chester County',
        addressRegion: 'PA',
        addressCountry: 'US',
      },
    },
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
              <li className="text-white/80" aria-current="page">Contact Us</li>
            </ol>
          </nav>
          <h1 className="font-serif text-4xl md:text-5xl text-white font-bold">
            Get Your Free Estimate
          </h1>
          <p className="mt-3 text-white/80 text-lg max-w-xl">
            Fill out the form below and a Augustine Home Improvements representative will contact you within the next business day. If you need immediate assistance, please call us.
          </p>
          <a
            href="tel:+14844677925"
            className="mt-5 inline-flex items-center gap-2 bg-white text-brand-red font-bold px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Phone size={18} aria-hidden="true" />
            Call 484-467-7925
          </a>
        </div>
      </section>

      {/* Main content */}
      <section className="py-20 bg-white">
        <div className="container-xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact info sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-brand-charcoal mb-4">
                  Contact Information
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-red/10 flex items-center justify-center flex-shrink-0">
                      <Phone size={18} className="text-brand-red" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="font-semibold text-brand-charcoal">Phone</div>
                      <a href="tel:+14844677925" className="text-brand-red hover:underline font-medium">
                        484-467-7925
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-red/10 flex items-center justify-center flex-shrink-0">
                      <Clock size={18} className="text-brand-red" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="font-semibold text-brand-charcoal">Hours</div>
                      <div className="text-gray-600 text-sm">
                        <div>Mon–Fri: 8:00 AM – 6:00 PM</div>
                        <div>Saturday: 9:00 AM – 3:00 PM</div>
                        <div>Sunday: Closed</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-red/10 flex items-center justify-center flex-shrink-0">
                      <MapPin size={18} className="text-brand-red" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="font-semibold text-brand-charcoal">Service Area</div>
                      <div className="text-gray-600 text-sm">
                        Chester County, PA and surrounding communities including Phoenixville, Malvern, Downingtown, West Chester, and greater Philadelphia suburbs.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-red/10 flex items-center justify-center flex-shrink-0">
                      <Share2 size={18} className="text-brand-red" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="font-semibold text-brand-charcoal">Facebook</div>
                      <a
                        href="https://www.facebook.com/augustinehomeimprovements"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-red hover:underline text-sm"
                      >
                        @augustinehomeimprovements
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service area note */}
              <div className="bg-brand-cream rounded-xl p-5 border border-brand-brick/15">
                <div className="font-semibold text-brand-charcoal mb-2 text-sm">Payment Methods</div>
                <p className="text-gray-600 text-sm">We currently accept Cash and Check.</p>
              </div>

              {/* Response time */}
              <div className="bg-brand-red/5 border border-brand-red/15 rounded-xl p-5">
                <p className="text-brand-charcoal text-sm font-medium">
                  ⏱️ We typically respond within 1 business day. For urgent requests, please call us directly at 484-467-7925.
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <h2 className="font-serif text-2xl font-bold text-brand-charcoal mb-2">
                  Request a Free Estimate
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  * Indicates required fields. We typically respond within the next business day.
                </p>
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

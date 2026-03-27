import Link from 'next/link'
import { Phone, ArrowRight } from 'lucide-react'

interface InlineCtaProps {
  heading?: string
  subtext?: string
}

export default function InlineCta({
  heading = 'Ready to Start Your Project?',
  subtext = 'Contact us today for a free, no-obligation estimate. We typically respond within 1 business day.',
}: InlineCtaProps) {
  return (
    <section className="bg-brand-cream border-y border-brand-brick/20 py-14">
      <div className="container-xl text-center">
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-brand-charcoal">
          {heading}
        </h2>
        <p className="mt-3 text-gray-600 max-w-xl mx-auto text-lg">
          {subtext}
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/contact-us/" className="btn-primary">
            Request a Free Estimate
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <a href="tel:+14844677925" className="flex items-center justify-center gap-2 font-semibold text-brand-red hover:text-brand-red-dark transition-colors">
            <Phone size={18} aria-hidden="true" />
            Or Call 484-467-7925
          </a>
        </div>
        <p className="mt-6 text-sm text-gray-500">
          Veteran-Owned · Licensed &amp; Insured · Serving Chester County PA
        </p>
      </div>
    </section>
  )
}

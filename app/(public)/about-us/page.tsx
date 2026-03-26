import type { Metadata } from 'next'
import { Award, Shield, Star, CheckCircle, Heart } from 'lucide-react'
import Link from 'next/link'
import InlineCta from '@/components/sections/InlineCta'

export const metadata: Metadata = {
  title: 'About Us | Veteran-Owned Contractor | Chester County PA',
  description:
    'Learn about Brandon Augustine and Augustine Home Improvements LLC — a veteran-owned home improvement contractor serving Chester County PA since 2020. Honor, courage, commitment.',
  alternates: { canonical: '/about-us/' },
}

const values = [
  { icon: Award, label: 'Honor', desc: 'We stand behind our work and our word, always.' },
  { icon: Shield, label: 'Courage', desc: 'We tackle the toughest projects with confidence.' },
  { icon: Star, label: 'Commitment', desc: 'Every project receives our full dedication.' },
  { icon: Heart, label: 'Craftsmanship', desc: 'We take pride in quality that lasts a lifetime.' },
]

export default function AboutUsPage() {
  return (
    <>
      {/* Hero */}
      <section
        className="relative min-h-[45vh] flex items-center"
        style={{ background: 'linear-gradient(135deg, #4d1006 0%, #671609 40%, #8d1e0c 100%)' }}
      >
        <div className="container-xl py-24 pt-40">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-2 text-sm text-white/60">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-white/80" aria-current="page">About Us</li>
            </ol>
          </nav>
          <div className="inline-block bg-white/15 text-white text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-4">
            Veteran-Owned Business
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-white font-bold leading-tight max-w-2xl">
            About Augustine Home Improvements
          </h1>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-white">
        <div className="container-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="section-badge">Our Story</div>
              <h2 className="section-heading">Our Mission Statement</h2>
              <p className="mt-4 text-gray-700 italic text-lg leading-relaxed border-l-4 border-brand-red pl-4">
                &ldquo;Our mission is to transmit our core values of honor, courage, commitment, and craftsmanship to each customer and project. Our vision is to be the home improvement company that current and future customers can rely on through our core values, communication, and reliability.&rdquo;
              </p>
              <div className="mt-6 space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Augustine Home Improvements was started in March 2020, though Brandon&apos;s journey began in 1995 when he joined the US Navy. It was then he knew he would be in this field, as he adapted well to this line of work and accepted the Navy&apos;s core values of honor, courage and commitment as his own.
                </p>
                <p>
                  Over the years Brandon has worked in many different roles, learned from different trades, and built a network of trustworthy, talented tradesmen who have taught him a plethora of skills. He has learned from peers in the field, but most importantly, he has learned from the customer.
                </p>
                <p>
                  &ldquo;I understand how important communication is whether you hire us for a handyman job or an addition to your home. I absolutely love my job and the work that I do and take a lot of pride in making sure it is done right the first time.&rdquo; — Brandon Augustine
                </p>
              </div>
            </div>
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: '2020', label: 'Year Founded' },
                  { value: '5★', label: 'Customer Rating' },
                  { value: 'TrexPro', label: 'Certified Installer' },
                  { value: 'US Navy', label: 'Veteran-Owned' },
                ].map(({ value, label }) => (
                  <div key={label} className="bg-brand-cream rounded-xl p-5 text-center">
                    <div className="font-serif text-2xl font-bold text-brand-red">{value}</div>
                    <div className="text-sm text-gray-600 mt-1">{label}</div>
                  </div>
                ))}
              </div>
              {/* Services list */}
              <div className="bg-brand-cream rounded-xl p-6">
                <h3 className="font-semibold text-brand-charcoal mb-3">What We Do</h3>
                <ul className="space-y-2">
                  {[
                    'Whole Home Renovations',
                    'Kitchen Renovations',
                    'Bathroom Remodeling',
                    'Deck Installation (TrexPro Certified)',
                    'Basement Finishing',
                    'Home Additions',
                    'Painting — Interior & Exterior',
                    'Estate & Rental Property Maintenance',
                  ].map((s) => (
                    <li key={s} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle size={14} className="text-brand-red flex-shrink-0" aria-hidden="true" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-brand-cream" aria-labelledby="values-heading">
        <div className="container-xl">
          <div className="text-center mb-12">
            <div className="section-badge">Core Values</div>
            <h2 id="values-heading" className="section-heading">
              The Values We Bring to Every Project
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="bg-white rounded-2xl p-6 text-center border border-brand-brick/15">
                <div className="w-14 h-14 rounded-xl bg-brand-red/10 flex items-center justify-center mx-auto mb-4">
                  <Icon size={26} className="text-brand-red" aria-hidden="true" />
                </div>
                <h3 className="font-serif text-xl font-bold text-brand-charcoal mb-2">{label}</h3>
                <p className="text-gray-600 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <InlineCta heading="Ready to Work With Us?" subtext="Contact us today for a free estimate and experience the Augustine difference." />
    </>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Phone,
  ArrowRight,
  Shield,
  Star,
  Award,
  CheckCircle,
  Layers,
  UtensilsCrossed,
  Bath,
  Home,
  Plus,
  Hammer,
  ChevronRight,
} from 'lucide-react'
import { draftMode } from 'next/headers'
import { getDraftContent, getPublishedContent } from '@/lib/content'
import ContactForm from '@/components/sections/ContactForm'

export const metadata: Metadata = {
  title: 'Augustine Home Improvements | Chester County PA Contractor | 484-467-7925',
  description:
    'Veteran-owned home improvement contractor serving Chester County PA & suburban Philadelphia. Expert deck installation, kitchen remodeling, bathroom renovations & more. Free estimates — call 484-467-7925.',
  alternates: { canonical: '/' },
}

const services = [
  {
    icon: Layers,
    title: 'Deck Installation',
    href: '/deck-installation/',
    desc: 'TrexPro certified deck builders. Transform your backyard into an outdoor retreat — custom decks built to last.',
  },
  {
    icon: UtensilsCrossed,
    title: 'Kitchen Renovations',
    href: '/kitchen-renovations/',
    desc: 'From new appliances to custom cabinetry and countertops — we design and build kitchens you will love for years.',
  },
  {
    icon: Bath,
    title: 'Bathroom Remodeling',
    href: '/bathroom-remodeling/',
    desc: 'Luxury bathroom upgrades with expert craftsmanship. Accessibility-aware designs available.',
  },
  {
    icon: Home,
    title: 'Basement Renovation',
    href: '/basement-renovation/',
    desc: 'Finish your basement into livable space — rec rooms, home offices, bars, and more.',
  },
  {
    icon: Plus,
    title: 'Home Additions',
    href: '/home-additions/',
    desc: 'Need more space? We design and build seamless structural additions that complement your existing home.',
  },
  {
    icon: Hammer,
    title: 'Home Renovations',
    href: '/home-renovations/',
    desc: "Whole-home gut jobs and large-scale renovations. Chester County's trusted full-service remodeling team.",
  },
]

export default async function HomePage() {
  const { isEnabled } = await draftMode()
  const content = isEnabled ? await getDraftContent() : await getPublishedContent()
  const reviews = content.reviews.slice(0, 3)
  return (
    <>
      {/* HERO */}
      <section
        className="relative min-h-screen flex items-center overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #4d1006 0%, #671609 45%, #8d1e0c 100%)',
        }}
        aria-label="Hero section"
      >
        {/* Subtle grid/texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
          aria-hidden="true"
        />

        {/* Diagonal accent shape */}
        <div
          className="absolute right-0 top-0 bottom-0 w-1/3 hidden xl:block opacity-10"
          style={{
            background: 'linear-gradient(to bottom left, rgba(255,255,255,0.2) 0%, transparent 60%)',
          }}
          aria-hidden="true"
        />

        <div className="container-xl relative z-10 py-24 pt-40 pb-28">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/15 text-white/90 text-sm font-semibold px-4 py-2 rounded-full mb-6 animate-fade-in-up">
              <Award size={15} aria-hidden="true" />
              Veteran-Owned · Chester County PA · Est. 2020
            </div>

            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-white font-bold leading-tight animate-fade-in-up animate-delay-100">
              Expert Home Improvements
              <span className="block text-brand-brick mt-2">
                Done Right.
              </span>
            </h1>

            <p className="mt-6 text-white/80 text-xl leading-relaxed max-w-2xl animate-fade-in-up animate-delay-200">
              From TrexPro-certified decks to whole-home renovations — Augustine Home Improvements brings military precision and craftsmanship to every project in Chester County and greater Philadelphia.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 animate-fade-in-up animate-delay-300">
              <Link href="/contact-us/" className="btn-primary text-lg px-8 py-4">
                Get Your Free Estimate
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <a
                href="tel:+14844677925"
                className="btn-outline text-lg px-8 py-4"
              >
                <Phone size={18} aria-hidden="true" />
                Call 484-467-7925
              </a>
            </div>

            {/* Quick trust signals */}
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 animate-fade-in-up animate-delay-400">
              {[
                'Free Estimates',
                'Licensed & Insured',
                'TrexPro Certified',
                'No Job Too Large',
              ].map((sig) => (
                <div key={sig} className="flex items-center gap-2 text-white/70 text-sm">
                  <CheckCircle size={15} className="text-brand-brick" aria-hidden="true" />
                  {sig}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div
          className="absolute bottom-0 left-0 right-0"
          aria-hidden="true"
        >
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80L48 69.3C96 58.7 192 37.3 288 32C384 26.7 480 37.3 576 48C672 58.7 768 69.3 864 64C960 58.7 1056 37.3 1152 32C1248 26.7 1344 37.3 1392 42.7L1440 48V80H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="py-8 bg-white border-b border-gray-100" aria-label="Trust signals">
        <div className="container-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Award, label: 'Veteran-Owned', sub: 'US Navy veteran' },
              { icon: Shield, label: 'Licensed & Insured', sub: 'Fully protected' },
              { icon: Star, label: 'TrexPro Certified', sub: 'Premier deck installer' },
              { icon: CheckCircle, label: 'Est. 2020', sub: 'Chester County PA' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3 p-4 rounded-xl bg-brand-cream">
                <div className="w-10 h-10 rounded-lg bg-brand-red/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={20} className="text-brand-red" aria-hidden="true" />
                </div>
                <div>
                  <div className="font-semibold text-brand-charcoal text-sm">{label}</div>
                  <div className="text-xs text-gray-500">{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES GRID */}
      <section className="py-20 bg-white" aria-labelledby="services-heading">
        <div className="container-xl">
          <div className="text-center mb-12">
            <div className="section-badge">Our Services</div>
            <h2 id="services-heading" className="section-heading">
              Home Improvements You Can Trust
            </h2>
            <p className="section-subheading max-w-2xl mx-auto">
              From your deck to your dream kitchen, we handle every aspect of your home improvement project with expertise and attention to detail.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(({ icon: Icon, title, href, desc }) => (
              <Link key={href} href={href} className="service-card group block">
                <div className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-brand-red/10 flex items-center justify-center mb-4 group-hover:bg-brand-red transition-colors">
                    <Icon size={22} className="text-brand-red group-hover:text-white transition-colors" aria-hidden="true" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-brand-charcoal mb-2 group-hover:text-brand-red transition-colors">
                    {title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
                  <div className="flex items-center gap-1 mt-4 text-brand-red text-sm font-semibold">
                    Learn more <ChevronRight size={14} aria-hidden="true" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT SNIPPET */}
      <section className="py-20 bg-brand-cream" aria-labelledby="about-heading">
        <div className="container-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="section-badge">About Us</div>
              <h2 id="about-heading" className="section-heading">
                Military Precision. Master Craftsmanship.
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Augustine Home Improvements was founded in 2020 by Brandon Augustine, a US Navy veteran who brings the Navy&apos;s core values of <strong>honor, courage, and commitment</strong> to every project.
              </p>
              <p className="mt-3 text-gray-600 leading-relaxed">
                Brandon&apos;s journey began in 1995 when he joined the US Navy. Over the years he has worked in many different trades and built a network of trustworthy, talented craftsmen. Today, Augustine Home Improvements provides whole-home renovations, decks, kitchens, bathrooms, and basements to Chester County, PA and suburban Philadelphia.
              </p>
              <p className="mt-3 text-gray-600 leading-relaxed">
                &ldquo;I absolutely love my job and take a lot of pride in making sure it is done right the first time.&rdquo; — Brandon Augustine
              </p>
              <div className="mt-6">
                <Link href="/about-us/" className="btn-primary">
                  Our Story
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] bg-brand-red/10 rounded-2xl overflow-hidden flex items-center justify-center">
                <div className="text-center p-8">
                  <Award size={64} className="text-brand-red/30 mx-auto mb-4" aria-hidden="true" />
                  <p className="text-brand-red/50 text-sm font-medium">
                    Project photos coming soon
                  </p>
                  <p className="text-brand-red/30 text-xs mt-1">
                    Upload via admin panel
                  </p>
                </div>
              </div>
              {/* Stats overlay */}
              <div className="absolute -bottom-4 -right-4 bg-brand-red text-white p-5 rounded-xl shadow-xl">
                <div className="text-3xl font-bold font-serif">5★</div>
                <div className="text-white/80 text-xs mt-0.5">Customer Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="py-20 bg-white" aria-labelledby="reviews-heading">
        <div className="container-xl">
          <div className="text-center mb-12">
            <div className="section-badge">Customer Reviews</div>
            <h2 id="reviews-heading" className="section-heading">
              What Our Clients Say
            </h2>
            <p className="section-subheading">
              Real reviews from homeowners in Chester County and surrounding communities.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.map((review) => (
              <article
                key={review.id}
                className="bg-brand-cream rounded-2xl p-6 border border-brand-brick/15"
              >
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} size={16} className="text-yellow-400 fill-yellow-400" aria-hidden="true" />
                  ))}
                </div>
                <blockquote className="text-gray-700 text-sm leading-relaxed italic">
                  &ldquo;{review.text}&rdquo;
                </blockquote>
                <footer className="mt-4">
                  <cite className="not-italic">
                    <div className="font-bold text-brand-charcoal">{review.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{review.project}</div>
                  </cite>
                </footer>
              </article>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/reviews/" className="text-brand-red font-semibold hover:underline text-sm">
              Read All Reviews →
            </Link>
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section className="py-20 bg-brand-cream" id="contact" aria-labelledby="contact-heading">
        <div className="container-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <div className="section-badge">Get In Touch</div>
              <h2 id="contact-heading" className="section-heading">
                Request Your Free Estimate
              </h2>
              <p className="section-subheading">
                Fill out the form and a Augustine Home Improvements representative will contact you within the next business day.
              </p>
              <div className="mt-8 flex flex-col gap-4">
                <a
                  href="tel:+14844677925"
                  className="flex items-center gap-3 text-brand-charcoal hover:text-brand-red transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-brand-red/10 flex items-center justify-center">
                    <Phone size={18} className="text-brand-red" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg">484-467-7925</div>
                    <div className="text-sm text-gray-500">Mon–Fri 8am–6pm, Sat 9am–3pm</div>
                  </div>
                </a>
              </div>
              <div className="mt-8 p-5 bg-white rounded-xl border border-brand-brick/20">
                <div className="font-semibold text-brand-charcoal mb-3">Why Choose Augustine?</div>
                <ul className="space-y-2">
                  {[
                    'Veteran-owned — Honor, courage, commitment in every project',
                    'Free, no-obligation estimates',
                    'Licensed and fully insured',
                    'TrexPro certified deck installer',
                    'Serving Chester County since 2020',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle size={15} className="text-brand-red flex-shrink-0 mt-0.5" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

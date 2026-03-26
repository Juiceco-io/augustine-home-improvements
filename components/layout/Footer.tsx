import Link from 'next/link'
import { Phone, MapPin, Shield, Star, Award, Share2 } from 'lucide-react'

const services = [
  { label: 'Deck Installation', href: '/deck-installation/' },
  { label: 'Kitchen Renovations', href: '/kitchen-renovations/' },
  { label: 'Bathroom Remodeling', href: '/bathroom-remodeling/' },
  { label: 'Basement Renovation', href: '/basement-renovation/' },
  { label: 'Home Additions', href: '/home-additions/' },
  { label: 'Home Renovations', href: '/home-renovations/' },
]

const quickLinks = [
  { label: 'About Us', href: '/about-us/' },
  { label: 'Gallery', href: '/gallery/' },
  { label: 'Customer Reviews', href: '/reviews/' },
  { label: 'Contact Us', href: '/contact-us/' },
  { label: 'Privacy Policy', href: '/privacy-policy/' },
]

const serviceAreas = [
  'Chester County, PA',
  'Phoenixville, PA',
  'Malvern, PA',
  'Downingtown, PA',
  'Exton, PA',
  'West Chester, PA',
  'Coatesville, PA',
  'Suburban Philadelphia',
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-brand-charcoal text-gray-300" role="contentinfo">
      {/* CTA Strip */}
      <div className="bg-brand-red">
        <div className="container-xl py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div>
            <p className="font-serif text-white text-2xl font-bold">
              Ready to Transform Your Home?
            </p>
            <p className="text-white/80 mt-1 text-sm">
              Free estimates · Licensed &amp; Insured · Veteran-Owned
            </p>
          </div>
          <a
            href="tel:+14844677925"
            className="flex items-center gap-2 bg-white text-brand-red font-bold text-lg px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors shadow-lg whitespace-nowrap"
          >
            <Phone size={20} aria-hidden="true" />
            484-467-7925
          </a>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-xl py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-brand-red flex items-center justify-center font-serif font-bold text-white text-xl">
                A
              </div>
              <div>
                <div className="font-serif font-bold text-white text-lg leading-tight">Augustine</div>
                <div className="text-xs text-gray-400 tracking-wide">HOME IMPROVEMENTS</div>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Veteran-owned home improvement contractor serving Chester County PA and the greater Philadelphia suburbs since 2020.
            </p>
            <div className="flex flex-col gap-2 text-sm">
              <a
                href="tel:+14844677925"
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
              >
                <Phone size={14} aria-hidden="true" />
                484-467-7925
              </a>
              <span className="flex items-center gap-2 text-gray-400">
                <MapPin size={14} aria-hidden="true" />
                Chester County, PA
              </span>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <a
                href="https://www.facebook.com/augustinehomeimprovements"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-red transition-colors"
                aria-label="Facebook"
              >
                <Share2 size={16} aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-widest mb-4">
              Services
            </h3>
            <ul className="space-y-2">
              {services.map((s) => (
                <li key={s.href}>
                  <Link
                    href={s.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-widest mb-4">
              Company
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Service Areas + Trust */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-widest mb-4">
              Service Area
            </h3>
            <ul className="space-y-1.5">
              {serviceAreas.map((area) => (
                <li key={area} className="text-sm text-gray-400">
                  {area}
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Shield size={12} className="text-brand-red" aria-hidden="true" />
                Licensed &amp; Insured
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Star size={12} className="text-brand-red" aria-hidden="true" />
                TrexPro Certified Installer
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Award size={12} className="text-brand-red" aria-hidden="true" />
                Veteran-Owned &amp; Operated
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container-xl py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>
            &copy; {year} Augustine Home Improvements LLC. All rights reserved.
          </p>
          <p>
            Serving Chester County PA &amp; Suburban Philadelphia
          </p>
        </div>
      </div>
    </footer>
  )
}

import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, Facebook, Shield, Award, Star } from "lucide-react";

const services = [
  { href: "/deck-installation/", label: "Deck Installation" },
  { href: "/kitchen-renovations/", label: "Kitchen Renovations" },
  { href: "/bathroom-remodeling/", label: "Bathroom Remodeling" },
  { href: "/basement-renovation/", label: "Basement Renovation" },
  { href: "/home-additions/", label: "Home Additions" },
  { href: "/home-renovations/", label: "Home Renovations" },
];

const serviceArea = [
  "Chester County, PA",
  "Phoenixville, PA",
  "Malvern, PA",
  "Downingtown, PA",
  "Exton, PA",
  "West Chester, PA",
  "Coatesville, PA",
  "Suburban Philadelphia",
];

export default function Footer() {
  return (
    <footer className="bg-brand-charcoal text-white">
      <div className="container-xl py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-4">
              <Image
                src="/images/augustine-logo.png"
                alt="Augustine Home Improvements"
                width={160}
                height={149}
                className="h-20 w-auto object-contain"
              />
            </div>
            <p className="text-sm text-gray-400 mb-4 leading-relaxed">
              Veteran-owned home improvement contractor serving Chester County PA
              and suburban Philadelphia since 2020.
            </p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Shield size={12} className="text-[color:var(--brand-primary)]" aria-hidden="true" />
                Licensed &amp; Insured
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Star size={12} className="text-[color:var(--brand-primary)]" aria-hidden="true" />
                TrexPro Certified Installer
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Award size={12} className="text-[color:var(--brand-primary)]" aria-hidden="true" />
                Veteran-Owned &amp; Operated
              </div>
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

          {/* Service area */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-widest mb-4">
              Service Area
            </h3>
            <ul className="space-y-1.5">
              {serviceArea.map((area) => (
                <li key={area} className="text-sm text-gray-400">
                  {area}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-widest mb-4">
              Contact
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="tel:+14844677925"
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <Phone size={14} className="text-[color:var(--brand-primary)] flex-shrink-0" aria-hidden="true" />
                  484-467-7925
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@augustinehomeimprovements.com"
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <Mail size={14} className="text-[color:var(--brand-primary)] flex-shrink-0" aria-hidden="true" />
                  <span className="break-all">info@augustinehomeimprovements.com</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.facebook.com/augustinehomeimprovements"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <Facebook size={14} className="text-[color:var(--brand-primary)] flex-shrink-0" aria-hidden="true" />
                  Facebook
                </a>
              </li>
            </ul>
            <div className="mt-6">
              <Link
                href="/contact-us/"
                className="btn-primary text-sm py-2.5 px-4 w-full justify-center"
              >
                Get a Free Estimate
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Augustine Home Improvements LLC. All rights reserved.
          </p>
          <nav className="flex items-center gap-4 text-sm text-gray-500">
            <Link href="/privacy-policy/" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/contact-us/" className="hover:text-white transition-colors">
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

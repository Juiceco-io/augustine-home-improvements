"use client";

import Link from "next/link";
import { Facebook, Shield, Award, Star } from "lucide-react";
import { CmsPhoneLink, CmsEmailLink, CmsLogo, CmsServiceArea } from "./CmsContact";
import { useSiteConfig } from "@/lib/useSiteConfig";

const services = [
  { href: "/deck-installation/", label: "Deck Installation" },
  { href: "/kitchen-renovations/", label: "Kitchen Renovations" },
  { href: "/bathroom-remodeling/", label: "Bathroom Remodeling" },
  { href: "/basement-renovation/", label: "Basement Renovation" },
  { href: "/home-additions/", label: "Home Additions" },
  { href: "/home-renovations/", label: "Home Renovations" },
];

export default function Footer() {
  const config = useSiteConfig();
  const trustIcons = [Shield, Star, Award];

  return (
    <footer
      className="bg-brand-charcoal text-white"
      style={{ borderTop: "3px solid var(--brand-primary)" }}
    >
      <div className="container-xl py-14 md:py-20">
        {/* Main grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] gap-10 md:gap-12">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-5 inline-block bg-white/95 rounded-lg px-3 py-2.5 shadow">
              <CmsLogo className="h-16 w-auto object-contain" />
            </div>
            <p className="text-sm text-gray-300 leading-relaxed mb-6 max-w-xs">
              {config.company.footerBlurb}
            </p>
            {/* Trust badges */}
            <div className="flex flex-col gap-2.5">
              {config.company.trustBadges.map((badge, index) => {
                const Icon = trustIcons[index] ?? Shield;
                return (
                  <div key={`${badge}-${index}`} className="flex items-center gap-2.5 text-xs font-medium text-gray-200">
                    <Icon
                      size={13}
                      className="text-[color:var(--brand-primary)] flex-shrink-0"
                      aria-hidden="true"
                    />
                    {badge}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold text-xs uppercase tracking-widest mb-4 pb-3 border-b border-white/10">
              Services
            </h3>
            <ul className="space-y-2.5">
              {services.map((s) => (
                <li key={s.href}>
                  <Link
                    href={s.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors duration-150"
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Service area */}
          <div>
            <h3 className="text-white font-semibold text-xs uppercase tracking-widest mb-4 pb-3 border-b border-white/10">
              Service Area
            </h3>
            <div className="text-sm text-gray-400 leading-relaxed">
              <CmsServiceArea />
            </div>
          </div>

          {/* Contact */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-white font-semibold text-xs uppercase tracking-widest mb-4 pb-3 border-b border-white/10">
              Contact Us
            </h3>
            <ul className="space-y-4 mb-7">
              <li>
                <CmsPhoneLink className="flex items-center gap-3 text-sm text-gray-300 hover:text-white transition-colors duration-150 [&>svg]:text-[color:var(--brand-primary)]" />
              </li>
              <li>
                <CmsEmailLink className="flex items-start gap-3 text-sm text-gray-300 hover:text-white transition-colors duration-150 [&>svg]:text-[color:var(--brand-primary)]" />
              </li>
              <li>
                <a
                  href="https://www.facebook.com/augustinehomeimprovements"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-gray-300 hover:text-white transition-colors duration-150"
                >
                  <Facebook
                    size={15}
                    className="text-[color:var(--brand-primary)] flex-shrink-0"
                    aria-hidden="true"
                  />
                  Follow on Facebook
                </a>
              </li>
            </ul>
            <Link
              href="/contact-us/"
              className="btn-primary text-sm py-2.5 px-5 w-full justify-center sm:w-auto lg:w-full"
            >
              Get a Free Estimate
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} Augustine Home Improvements LLC.
            All rights reserved.
          </p>
          <nav className="flex items-center gap-5" aria-label="Footer legal links">
            <Link
              href="/privacy-policy/"
              className="hover:text-gray-300 transition-colors duration-150"
            >
              Privacy Policy
            </Link>
            <Link
              href="/contact-us/"
              className="hover:text-gray-300 transition-colors duration-150"
            >
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

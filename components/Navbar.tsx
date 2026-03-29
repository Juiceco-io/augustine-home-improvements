"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Phone, ChevronDown, Menu, X } from "lucide-react";

const services = [
  { href: "/deck-installation/", label: "Deck Installation" },
  { href: "/kitchen-renovations/", label: "Kitchen Renovations" },
  { href: "/bathroom-remodeling/", label: "Bathroom Remodeling" },
  { href: "/basement-renovation/", label: "Basement Renovation" },
  { href: "/home-additions/", label: "Home Additions" },
  { href: "/home-renovations/", label: "Home Renovations" },
];

const navLinks = [
  { href: "/gallery/", label: "Gallery" },
  { href: "/reviews/", label: "Reviews" },
  { href: "/about-us/", label: "About" },
  { href: "/contact-us/", label: "Contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? "navbar-scrolled py-2"
          : "bg-transparent py-3 md:py-4"
      }`}
      role="banner"
    >
      <div className="container-xl flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 group"
          aria-label="Augustine Home Improvements — Home"
        >
          <div className="flex items-center">
            <Image
              src="/images/augustine-logo.jpg"
              alt="Augustine Home Improvements"
              width={180}
              height={64}
              className="h-10 md:h-12 w-auto rounded-sm bg-white/95 p-1 shadow-sm"
              priority
            />
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav
          className="hidden lg:flex items-center gap-6"
          aria-label="Main navigation"
        >
          {/* Services dropdown */}
          <div className="relative group">
            <button
              className={`flex items-center gap-1 font-semibold text-sm transition-colors py-2 ${
                scrolled
                  ? "text-gray-700 hover:text-brand-primary"
                  : "text-white/90 hover:text-white"
              }`}
              aria-expanded={servicesOpen}
              aria-haspopup="true"
              onClick={() => setServicesOpen(!servicesOpen)}
            >
              Services
              <ChevronDown size={14} />
            </button>
            <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              {services.map((s) => (
                <Link
                  key={s.href}
                  href={s.href}
                  className="block px-4 py-3 text-sm font-medium text-gray-700 hover:text-[color:var(--brand-primary)] hover:bg-brand-cream transition-colors first:rounded-t-lg last:rounded-b-lg"
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </div>

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-semibold text-sm transition-colors ${
                scrolled
                  ? "text-gray-700 hover:text-brand-primary"
                  : "text-white/90 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}

          <a
            href="tel:+14844677925"
            className="flex items-center gap-2 btn-primary text-sm py-2.5 px-5"
          >
            <Phone size={15} aria-hidden="true" />
            484-467-7925
          </a>
        </nav>

        {/* Mobile: phone + hamburger */}
        <div className="flex lg:hidden items-center gap-3">
          <a
            href="tel:+14844677925"
            className="flex items-center gap-1.5 text-sm font-bold"
            aria-label="Call us"
          >
            <Phone
              size={16}
              className={scrolled ? "text-[color:var(--brand-primary)]" : "text-white"}
              aria-hidden="true"
            />
            <span className={scrolled ? "text-brand-charcoal" : "text-white"}>
              Call
            </span>
          </a>
          <button
            className={`p-2 rounded-md transition-colors ${
              scrolled
                ? "text-gray-700 hover:bg-gray-100"
                : "text-white hover:bg-white/10"
            }`}
            aria-label="Open menu"
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={`lg:hidden bg-white border-t border-gray-100 overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-screen" : "max-h-0"
        }`}
        aria-hidden={!isOpen}
      >
        <nav
          className="container-xl py-4 flex flex-col gap-1"
          aria-label="Mobile navigation"
        >
          <div className="pb-2 mb-2 border-b border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-3 mb-2">
              Services
            </p>
            {services.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-[color:var(--brand-primary)] hover:bg-brand-cream rounded-md transition-colors"
              >
                {s.label}
              </Link>
            ))}
          </div>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="px-3 py-2.5 text-sm font-semibold text-gray-800 hover:text-[color:var(--brand-primary)] hover:bg-brand-cream rounded-md transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <a
              href="tel:+14844677925"
              className="btn-primary w-full justify-center text-sm"
            >
              <Phone size={15} aria-hidden="true" />
              Call 484-467-7925
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Phone, ChevronDown, Menu, X } from "lucide-react";
import NavbarLogo from "./NavbarLogo";
import { useCmsContact } from "./CmsContact";

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
  const [isMobile, setIsMobile] = useState(false);
  const { phone } = useCmsContact();
  const tel = `tel:+1${phone.replace(/\D/g, "")}`;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isMobile) setIsOpen(false);
  }, [isMobile]);

  const isSolid = isMobile || scrolled;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 navbar-base ${
        isSolid ? "navbar-solid py-3 lg:py-4" : "navbar-hero py-4 lg:pt-7"
      }`}
      role="banner"
    >
      <div className="container-xl flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center group flex-shrink-0"
          aria-label="Augustine Home Improvements — Home"
        >
          <NavbarLogo isSolid={isSolid} />
        </Link>

        <nav className="hidden lg:flex items-center gap-6" aria-label="Main navigation">
          <div className="relative nav-dropdown-parent group">
            <button
              className={`flex items-center gap-1 font-semibold text-sm transition-colors py-2 nav-link-underline ${
                isSolid
                  ? "text-gray-700 hover:text-brand-primary"
                  : "text-white/90 hover:text-white"
              }`}
              aria-haspopup="true"
            >
              Services
              <ChevronDown
                size={14}
                className="transition-transform duration-200 group-hover:rotate-180"
                aria-hidden="true"
              />
            </button>
            <div className="nav-dropdown absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 py-1">
              {services.map((s) => (
                <Link
                  key={s.href}
                  href={s.href}
                  className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-[color:var(--brand-primary)] hover:bg-brand-cream transition-colors"
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
              className={`font-semibold text-sm transition-colors nav-link-underline ${
                isSolid
                  ? "text-gray-700 hover:text-brand-primary"
                  : "text-white/90 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}

          <a href={tel} className="flex items-center gap-2 btn-primary text-sm py-2.5 px-5">
            <Phone size={15} aria-hidden="true" />
            {phone}
          </a>
        </nav>

        <div className="flex lg:hidden items-center gap-1">
          <a
            href={tel}
            className="flex items-center gap-1.5 text-sm font-semibold py-2 px-2.5 rounded-lg hover:bg-brand-mist transition-colors"
            aria-label="Call Augustine Home Improvements"
          >
            <Phone size={16} className="text-brand-primary" aria-hidden="true" />
            <span className="text-brand-charcoal">Call</span>
          </a>
          <button
            className="p-2 rounded-lg text-brand-charcoal hover:bg-brand-mist transition-colors"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        className={`lg:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${
          isOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
        aria-hidden={!isOpen}
      >
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mx-4" />
        <nav className="container-xl pt-3 pb-5 flex flex-col gap-0.5" aria-label="Mobile navigation">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-3 pt-1 pb-1.5">
            Services
          </p>
          {services.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-[color:var(--brand-primary)] hover:bg-brand-cream rounded-lg transition-colors"
            >
              {s.label}
            </Link>
          ))}

          <div className="h-px bg-gray-100 mx-1 my-2" />

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2.5 text-sm font-semibold text-gray-800 hover:text-[color:var(--brand-primary)] hover:bg-brand-cream rounded-lg transition-colors"
            >
              {link.label}
            </Link>
          ))}

          <div className="mt-3">
            <a href={tel} className="btn-primary w-full justify-center" onClick={() => setIsOpen(false)}>
              <Phone size={15} aria-hidden="true" />
              Call {phone}
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Phone, Menu, X, ChevronDown } from 'lucide-react'
import clsx from 'clsx'

const navLinks = [
  {
    label: 'Services',
    children: [
      { label: 'Deck Installation', href: '/deck-installation/' },
      { label: 'Kitchen Renovations', href: '/kitchen-renovations/' },
      { label: 'Bathroom Remodeling', href: '/bathroom-remodeling/' },
      { label: 'Basement Renovation', href: '/basement-renovation/' },
      { label: 'Home Additions', href: '/home-additions/' },
      { label: 'Home Renovations', href: '/home-renovations/' },
    ],
  },
  { label: 'Gallery', href: '/gallery/' },
  { label: 'Reviews', href: '/reviews/' },
  { label: 'About', href: '/about-us/' },
  { label: 'Contact', href: '/contact-us/' },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={clsx(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
        scrolled
          ? 'bg-white shadow-md py-2'
          : 'bg-transparent py-4'
      )}
      role="banner"
    >
      <div className="container-xl flex items-center justify-between">
        {/* Logo / Brand */}
        <Link
          href="/"
          className="flex items-center gap-3 group"
          aria-label="Augustine Home Improvements — Home"
        >
          <div
            className={clsx(
              'w-10 h-10 rounded-lg flex items-center justify-center font-serif font-bold text-white text-xl transition-colors',
              scrolled ? 'bg-brand-red' : 'bg-brand-red'
            )}
            aria-hidden="true"
          >
            A
          </div>
          <div className="leading-tight">
            <div
              className={clsx(
                'font-serif font-bold text-lg transition-colors',
                scrolled ? 'text-brand-charcoal' : 'text-white'
              )}
            >
              Augustine
            </div>
            <div
              className={clsx(
                'text-xs font-medium tracking-wide transition-colors',
                scrolled ? 'text-brand-brick' : 'text-white/80'
              )}
            >
              HOME IMPROVEMENTS
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6" aria-label="Main navigation">
          {navLinks.map((link) =>
            link.children ? (
              <div key={link.label} className="relative group">
                <button
                  className={clsx(
                    'flex items-center gap-1 font-semibold text-sm transition-colors py-2',
                    scrolled ? 'text-brand-charcoal hover:text-brand-red' : 'text-white/90 hover:text-white'
                  )}
                  aria-expanded={servicesOpen}
                  aria-haspopup="true"
                  onClick={() => setServicesOpen((v) => !v)}
                  onBlur={() => setTimeout(() => setServicesOpen(false), 150)}
                >
                  {link.label}
                  <ChevronDown size={14} />
                </button>
                <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  {link.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="block px-4 py-3 text-sm font-medium text-gray-700 hover:text-brand-red hover:bg-brand-cream transition-colors first:rounded-t-lg last:rounded-b-lg"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                key={link.href}
                href={link.href!}
                className={clsx(
                  'font-semibold text-sm transition-colors',
                  scrolled ? 'text-brand-charcoal hover:text-brand-red' : 'text-white/90 hover:text-white'
                )}
              >
                {link.label}
              </Link>
            )
          )}
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
              className={scrolled ? 'text-brand-red' : 'text-white'}
              aria-hidden="true"
            />
            <span className={scrolled ? 'text-brand-charcoal' : 'text-white'}>
              484-467-7925
            </span>
          </a>
          <button
            className={clsx(
              'p-2 rounded-md transition-colors',
              scrolled ? 'text-brand-charcoal hover:bg-gray-100' : 'text-white hover:bg-white/10'
            )}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className={clsx(
          'lg:hidden bg-white border-t border-gray-100 overflow-hidden transition-all duration-300',
          mobileOpen ? 'max-h-screen shadow-xl' : 'max-h-0'
        )}
        aria-hidden={!mobileOpen}
      >
        <nav className="container-xl py-4 flex flex-col gap-1" aria-label="Mobile navigation">
          <div className="pb-2 mb-2 border-b border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-3 mb-2">
              Services
            </p>
            {navLinks[0].children?.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-brand-red hover:bg-brand-cream rounded-md transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {child.label}
              </Link>
            ))}
          </div>
          {navLinks.slice(1).map((link) => (
            <Link
              key={link.href}
              href={link.href!}
              className="px-3 py-2.5 text-sm font-semibold text-gray-800 hover:text-brand-red hover:bg-brand-cream rounded-md transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <a
              href="tel:+14844677925"
              className="btn-primary w-full justify-center text-sm"
              onClick={() => setMobileOpen(false)}
            >
              <Phone size={15} aria-hidden="true" />
              Call 484-467-7925
            </a>
          </div>
        </nav>
      </div>
    </header>
  )
}

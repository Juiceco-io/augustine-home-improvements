'use client'

import { Phone } from 'lucide-react'

export default function StickyCtaMobile() {
  return (
    <div className="sticky-cta-mobile" role="complementary" aria-label="Call to action">
      <Phone size={18} aria-hidden="true" />
      <a
        href="tel:+14844677925"
        className="font-bold text-white"
        aria-label="Call Augustine Home Improvements at 484-467-7925"
      >
        Call Now: 484-467-7925
      </a>
      <span className="text-white/70 text-sm">· Free Estimates</span>
    </div>
  )
}

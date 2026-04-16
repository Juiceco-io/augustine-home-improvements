"use client";

/**
 * GalleryCta — CMS-driven CTA section at the bottom of the Gallery page.
 * Pulls the phone number from live CMS config with defaultConfig fallback.
 */

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useSiteConfig } from "@/lib/useSiteConfig";
import { trackEvent } from "@/lib/analytics";

export default function GalleryCta() {
  const config = useSiteConfig();
  const phone = config.contact.phone || "484-467-7925";
  const tel = `tel:+1${phone.replace(/\D/g, "")}`;

  return (
    <section className="py-14 md:py-20 bg-brand-charcoal text-white hero-gradient-animated">
      <div className="container-xl">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 sm:p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-mist mb-3">
              Ready for your own transformation?
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold leading-tight mb-3">
              Let&apos;s talk about what you want to improve next.
            </h2>
            <p className="text-white/80 text-lg leading-relaxed">
              From decks and additions to kitchens and baths, Augustine Home
              Improvements delivers thoughtful design, durable workmanship, and
              a smooth remodeling experience from start to finish.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/contact-us/" className="btn-primary w-full sm:w-auto justify-center" onClick={() => trackEvent("CTA_CLICK", { label: "gallery_estimate" })}>
              Start Your Project <ArrowRight size={18} />
            </Link>
            <a
              href={tel}
              className="btn-outline border-white text-white hover:bg-white hover:text-brand-charcoal w-full sm:w-auto justify-center cta-link-white"
              onClick={() => trackEvent("CTA_CLICK", { label: "gallery_phone" })}
            >
              Call {phone}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

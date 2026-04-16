"use client";

/**
 * AboutCta — CMS-driven CTA block at the bottom of the About page.
 * Pulls the phone number from live CMS config with defaultConfig fallback.
 */

import Link from "next/link";
import { Phone } from "lucide-react";
import { useSiteConfig } from "@/lib/useSiteConfig";
import { trackEvent } from "@/lib/analytics";

export default function AboutCta() {
  const config = useSiteConfig();
  const cta = config.homepage.bottomCta;
  const phone = config.contact.phone || "484-467-7925";
  const primaryHref = cta.primaryHref || "/contact-us/";
  const tel = cta.secondaryHref || `tel:+1${phone.replace(/\D/g, "")}`;

  return (
    <div
      className="hero-gradient-animated rounded-2xl p-6 sm:p-8 md:p-10 text-center text-white"
      style={{
        background:
          "linear-gradient(135deg, #26463f 0%, #365c52 45%, #4b776b 100%)",
      }}
    >
      <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-3">
        {cta.title}
      </h2>
      <p className="text-white/80 mb-6 max-w-xl mx-auto">{cta.body}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
        <Link
          href={primaryHref}
          className="bg-white text-brand-red font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors w-full sm:w-auto text-center cta-link-white"
          onClick={() => trackEvent("CTA_CLICK", { label: "about_estimate" })}
        >
          {cta.primaryLabel}
        </Link>
        <a
          href={tel}
          className="flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 text-white font-semibold py-3 px-8 rounded-lg transition-colors w-full sm:w-auto cta-link-white"
          onClick={() => trackEvent("CTA_CLICK", { label: "about_phone" })}
        >
          <Phone size={15} aria-hidden="true" />
          {cta.secondaryLabel || phone}
        </a>
      </div>
      {cta.footnote && (
        <p className="text-white/70 text-sm mt-4">{cta.footnote}</p>
      )}
    </div>
  );
}

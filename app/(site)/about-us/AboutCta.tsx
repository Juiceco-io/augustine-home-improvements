"use client";

/**
 * AboutCta — CMS-driven CTA block at the bottom of the About page.
 * Pulls the phone number from live CMS config with defaultConfig fallback.
 */

import Link from "next/link";
import { Phone } from "lucide-react";
import { useSiteConfig } from "@/lib/useSiteConfig";

export default function AboutCta() {
  const config = useSiteConfig();
  const phone = config.contact.phone || "484-467-7925";
  const tel = `tel:+1${phone.replace(/\D/g, "")}`;

  return (
    <div
      className="hero-gradient-animated rounded-2xl p-6 sm:p-8 md:p-10 text-center text-white"
      style={{
        background:
          "linear-gradient(135deg, #26463f 0%, #365c52 45%, #4b776b 100%)",
      }}
    >
      <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-3">
        Ready to Work with Us?
      </h2>
      <p className="text-white/80 mb-6 max-w-xl mx-auto">
        Get a free, no-obligation estimate. We&apos;ll come to your home,
        assess the project, and give you a clear, written quote.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
        <Link
          href="/contact-us/"
          className="bg-white text-brand-red font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors w-full sm:w-auto text-center cta-link-white"
        >
          Request a Free Estimate
        </Link>
        <a
          href={tel}
          className="flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 text-white font-semibold py-3 px-8 rounded-lg transition-colors w-full sm:w-auto cta-link-white"
        >
          <Phone size={15} aria-hidden="true" />
          {phone}
        </a>
      </div>
    </div>
  );
}

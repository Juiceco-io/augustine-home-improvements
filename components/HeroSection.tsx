"use client";

/**
 * HeroSection — renders the homepage hero driven by CMS config.
 *
 * Reads headline, subheadline, and optional hero image URL from site config.
 * Falls back to defaults (matching the original hardcoded values) when the
 * CDN is unavailable so the page never breaks.
 */

import Link from "next/link";
import Image from "next/image";
import { Phone, Award, Shield, Star, CheckCircle } from "lucide-react";
import { useSiteConfig } from "@/lib/useSiteConfig";

export default function HeroSection() {
  const config = useSiteConfig();

  const headline = config.hero.headline || "Expert Home Improvements";
  const subheadline =
    config.hero.subheadline ||
    "Serving Chester County PA and suburban Philadelphia. Decks, kitchens, bathrooms, basements, additions — one contractor you can trust from start to finish.";
  const heroImageUrl = config.hero.imageUrl;
  const showVeteranBadge = config.features.showVeteranBadge;
  const showTrexProBadge = config.features.showTrexProBadge;
  const heroEnabled = config.features.heroEnabled;

  if (!heroEnabled) return null;

  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      style={
        heroImageUrl
          ? undefined
          : {
              background:
                "linear-gradient(135deg, #26463f 0%, #365c52 45%, #4b776b 100%)",
            }
      }
      aria-label="Hero section"
    >
      {/* Optional hero background image */}
      {heroImageUrl && (
        <>
          <Image
            src={heroImageUrl}
            alt="Hero background"
            fill
            className="object-cover"
            priority
            unoptimized
          />
          {/* Dark overlay for text legibility */}
          <div className="absolute inset-0 bg-black/55" aria-hidden="true" />
        </>
      )}

      {/* Subtle pattern overlay (gradient only) */}
      {!heroImageUrl && (
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
          aria-hidden="true"
        />
      )}

      <div className="container-xl relative z-10 pt-28 pb-16 md:pt-40 md:pb-28">
        <div className="max-w-3xl">
          {/* Badge */}
          {(showVeteranBadge || showTrexProBadge) && (
            <div className="inline-flex items-center gap-2 bg-white/15 text-white/90 text-sm font-semibold px-4 py-2 rounded-full mb-5 animate-fade-in-up">
              <Award size={15} aria-hidden="true" />
              {showVeteranBadge && showTrexProBadge
                ? "Veteran-Owned & TrexPro Certified"
                : showVeteranBadge
                ? "Veteran-Owned & Operated"
                : "TrexPro Certified"}
            </div>
          )}

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white font-bold leading-tight animate-fade-in-up animate-delay-100">
            {headline}
            <span className="block mt-2" style={{ color: "#a8cfc4" }}>
              Done Right.
            </span>
          </h1>

          <p className="mt-5 text-white/80 text-lg md:text-xl leading-relaxed max-w-2xl animate-fade-in-up animate-delay-200">
            {subheadline}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 animate-fade-in-up animate-delay-300">
            <Link
              href="/contact-us/"
              className="btn-primary text-base py-3.5 px-7 justify-center sm:justify-start"
            >
              Get a Free Estimate
            </Link>
            <a
              href={`tel:+1${config.contact.phone.replace(/\D/g, "")}`}
              className="flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 text-white font-semibold py-3.5 px-7 rounded-lg transition-colors text-base cta-link-white"
            >
              <Phone size={16} aria-hidden="true" />
              {config.contact.phone}
            </a>
          </div>

          {/* Trust badges */}
          <div className="mt-8 flex flex-wrap gap-4 sm:gap-6 animate-fade-in-up animate-delay-400">
            {[
              { icon: Shield, text: "Licensed & Insured" },
              { icon: Star, text: "5-Star Rated" },
              { icon: CheckCircle, text: "Free Estimates" },
            ].map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-2 text-white/70 text-sm"
              >
                <Icon size={14} aria-hidden="true" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

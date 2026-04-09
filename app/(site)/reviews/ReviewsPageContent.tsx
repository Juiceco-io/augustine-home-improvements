"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { useSiteConfig } from "@/lib/useSiteConfig";

export default function ReviewsPageContent() {
  const config = useSiteConfig();

  return (
    <>
      <ScrollReveal variant="fade-up">
        <div className="max-w-2xl mb-8 md:mb-12">
          <h1 className="section-heading mb-4">{config.reviews.heading}</h1>
          <div className="flex items-center gap-2 mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={22} className="fill-yellow-400 text-yellow-400" aria-hidden="true" />
            ))}
            <span className="text-gray-600 text-sm ml-1">{config.reviews.averageLabel}</span>
          </div>
          <p className="section-subheading">{config.reviews.subheading}</p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 mb-12 md:mb-16">
        {config.reviews.items.map((review, i) => (
          <ScrollReveal key={`${review.name}-${i}`} variant="fade-up" delay={i * 100}>
            <div className="review-card bg-brand-cream border border-gray-200 rounded-xl p-6 h-full">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: review.rating }).map((_, j) => (
                  <Star key={j} size={14} className="fill-yellow-400 text-yellow-400" aria-hidden="true" />
                ))}
              </div>
              <p className="text-gray-700 text-sm leading-relaxed mb-4">&ldquo;{review.text}&rdquo;</p>
              <div>
                <div className="font-bold text-brand-charcoal text-sm">{review.name}</div>
                <div className="text-gray-500 text-xs">{review.location} &middot; {review.service}</div>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>

      <ScrollReveal variant="fade-up" delay={300}>
        <div className="hero-gradient-animated rounded-2xl p-6 sm:p-8 md:p-10 text-center text-white" style={{ background: "linear-gradient(135deg, #26463f 0%, #365c52 45%, #4b776b 100%)" }}>
          <h2 className="font-serif text-xl sm:text-2xl font-bold mb-3">{config.reviews.ctaTitle}</h2>
          <p className="text-white/80 mb-6">{config.reviews.ctaBody}</p>
          <Link href="/contact-us/" className="bg-white text-brand-red font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors inline-block cta-link-white">
            {config.reviews.ctaLabel}
          </Link>
        </div>
      </ScrollReveal>
    </>
  );
}

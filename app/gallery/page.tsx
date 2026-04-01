import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import GalleryGrid from "./GalleryGrid";

export const metadata: Metadata = {
  title: "Project Gallery | Augustine Home Improvements",
  description:
    "Explore decks, kitchens, bathrooms, basements, and renovation work completed by Augustine Home Improvements across Chester County and the surrounding suburbs.",
};

export default function GalleryPage() {
  return (
    <>
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 bg-gradient-to-b from-brand-cream via-white to-white hero-gradient-animated">
        <div className="container-xl">
          <div className="max-w-3xl">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-brand-mist text-brand-primary text-sm font-semibold mb-6">
              Crafted spaces. Lasting quality.
            </span>
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-brand-charcoal leading-tight mb-6">
              See the craftsmanship behind Augustine Home Improvements.
            </h1>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl">
              Browse a curated look at the decks, kitchens, bathrooms, basements,
              and full-home renovations that reflect Augustine&apos;s standard of
              care, detail, and clean execution.
            </p>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20 bg-white">
        <div className="container-xl">
          <GalleryGrid />
        </div>
      </section>

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
              <Link href="/contact-us/" className="btn-primary w-full sm:w-auto justify-center">
                Start Your Project <ArrowRight size={18} />
              </Link>
              <a
                href="tel:+14844677925"
                className="btn-outline border-white text-white hover:bg-white hover:text-brand-charcoal w-full sm:w-auto justify-center cta-link-white"
              >
                Call 484-467-7925
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

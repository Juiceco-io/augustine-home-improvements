"use client";

import ClientOnly from "@/components/ClientOnly";
import GalleryGrid from "@/app/(site)/gallery/GalleryGrid";
import GalleryCta from "@/app/(site)/gallery/GalleryCta";

export default function PreviewGalleryPage() {
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
          <ClientOnly>
            <GalleryGrid />
          </ClientOnly>
        </div>
      </section>

      <ClientOnly>
        <GalleryCta />
      </ClientOnly>
    </>
  );
}

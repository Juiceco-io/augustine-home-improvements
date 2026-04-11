"use client";

import { useSiteConfig } from "@/lib/useSiteConfig";
import ScrollReveal from "@/components/ScrollReveal";
import Image from "next/image";

export default function GalleryGrid() {
  const config = useSiteConfig();
  const items = config.gallery
    .filter((item) => item.active)
    .sort((a, b) => a.order - b.order);

  if (items.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <ScrollReveal key={i} variant="fade-up" delay={i * 50}>
            <div className="gallery-card aspect-video rounded-xl bg-brand-cream border border-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-sm">Photo coming soon</span>
            </div>
          </ScrollReveal>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item, i) => (
        <ScrollReveal key={item.id} variant="fade-up" delay={i * 50}>
          <div className="gallery-card rounded-xl overflow-hidden border border-gray-200 group">
            <div className="relative aspect-video bg-brand-cream">
              <Image
                src={item.url}
                alt={item.caption}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                unoptimized
              />
            </div>
            {item.caption && (
              <div className="px-4 py-3 bg-white">
                <p className="text-sm text-gray-600">{item.caption}</p>
                {item.category && (
                  <span className="inline-block mt-1 text-xs text-brand-red font-medium capitalize">
                    {item.category}
                  </span>
                )}
              </div>
            )}
          </div>
        </ScrollReveal>
      ))}
    </div>
  );
}

'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Images } from 'lucide-react'
import type { GalleryItem } from '@/types/content'

const CATEGORIES = ['All', 'Decks', 'Kitchens', 'Bathrooms', 'Basements', 'Home Additions', 'Renovations']

export default function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered =
    activeCategory === 'All' ? items : items.filter((item) => item.category === activeCategory)

  return (
    <>
      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-10 justify-center">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all ${
              activeCategory === cat
                ? 'bg-brand-red text-white border-brand-red'
                : 'bg-white text-gray-700 border-gray-300 hover:border-brand-red hover:text-brand-red'
            }`}
            aria-pressed={activeCategory === cat}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-2xl bg-brand-red/10 flex items-center justify-center mb-6">
            <Images size={36} className="text-brand-red/50" aria-hidden="true" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-brand-charcoal mb-3">
            {items.length === 0 ? 'Photos Coming Soon' : 'No photos in this category'}
          </h2>
          <p className="text-gray-500 max-w-md mb-6">
            {items.length === 0
              ? "Project photos are uploaded and managed by the site owner. Check back soon to see Augustine Home Improvements' latest completed projects."
              : 'Try selecting a different category above.'}
          </p>
          {items.length === 0 && (
            <Link href="/contact-us/" className="btn-primary">
              Request a Free Estimate
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <figure
              key={item.id}
              className="group relative overflow-hidden rounded-2xl bg-gray-100 aspect-[4/3]"
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              {(item.caption || item.category) && (
                <figcaption className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-4 text-white translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  {item.caption && (
                    <p className="font-semibold text-sm">{item.caption}</p>
                  )}
                  {item.category && (
                    <p className="text-xs text-white/70 mt-0.5">{item.category}</p>
                  )}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )}
    </>
  )
}

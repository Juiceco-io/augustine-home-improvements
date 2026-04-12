"use client";

import { useState } from "react";
import type { SiteConfig } from "../lib/types";

interface Props {
  config: SiteConfig;
  onSave: (config: SiteConfig) => Promise<void>;
  saving: boolean;
}

export default function ReviewsTab({ config, onSave, saving }: Props) {
  const [reviews, setReviews] = useState(config.reviews);

  async function handleSave() {
    await onSave({ ...config, reviews });
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Reviews Content</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Edit testimonials used on the reviews page and homepage featured reviews preview.
        </p>
      </div>

      <section className="space-y-4">
        <input type="text" value={reviews.heading} onChange={(e) => setReviews((prev) => ({ ...prev, heading: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-sm" />
        <textarea value={reviews.subheading} onChange={(e) => setReviews((prev) => ({ ...prev, subheading: e.target.value }))} rows={3} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-sm resize-none" />
        <input type="text" value={reviews.averageLabel} onChange={(e) => setReviews((prev) => ({ ...prev, averageLabel: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-sm" />
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Reviews Page CTA</h3>
        <input type="text" value={reviews.ctaTitle} onChange={(e) => setReviews((prev) => ({ ...prev, ctaTitle: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-sm" />
        <textarea value={reviews.ctaBody} onChange={(e) => setReviews((prev) => ({ ...prev, ctaBody: e.target.value }))} rows={3} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-sm resize-none" />
        <input type="text" value={reviews.ctaLabel} onChange={(e) => setReviews((prev) => ({ ...prev, ctaLabel: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-sm" />
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Testimonials</h3>
        {reviews.items.map((item, index) => (
          <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input type="text" value={item.name} onChange={(e) => setReviews((prev) => ({ ...prev, items: prev.items.map((entry, i) => i === index ? { ...entry, name: e.target.value } : entry) }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-sm" placeholder="Customer name" />
              <input type="text" value={item.location} onChange={(e) => setReviews((prev) => ({ ...prev, items: prev.items.map((entry, i) => i === index ? { ...entry, location: e.target.value } : entry) }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-sm" placeholder="Phoenixville, PA" />
              <input type="text" value={item.service} onChange={(e) => setReviews((prev) => ({ ...prev, items: prev.items.map((entry, i) => i === index ? { ...entry, service: e.target.value } : entry) }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-sm" placeholder="Deck Installation" />
              <input type="number" min={1} max={5} value={item.rating} onChange={(e) => setReviews((prev) => ({ ...prev, items: prev.items.map((entry, i) => i === index ? { ...entry, rating: Number(e.target.value) || 5 } : entry) }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-sm" />
            </div>
            <textarea value={item.text} onChange={(e) => setReviews((prev) => ({ ...prev, items: prev.items.map((entry, i) => i === index ? { ...entry, text: e.target.value } : entry) }))} rows={4} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-sm resize-none" />
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <input type="checkbox" checked={item.featured} onChange={(e) => setReviews((prev) => ({ ...prev, items: prev.items.map((entry, i) => i === index ? { ...entry, featured: e.target.checked } : entry) }))} />
              Show on homepage featured reviews
            </label>
          </div>
        ))}
      </section>

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60 transition-opacity"
        style={{ background: "linear-gradient(135deg, #26463f, #4b776b)" }}
      >
        {saving ? "Saving…" : "Save Reviews Content"}
      </button>
    </div>
  );
}

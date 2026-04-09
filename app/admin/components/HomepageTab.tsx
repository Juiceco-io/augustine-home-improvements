"use client";

import { useState } from "react";
import type { SiteConfig } from "../lib/types";

interface Props {
  config: SiteConfig;
  onSave: (config: SiteConfig) => Promise<void>;
  saving: boolean;
}

export default function HomepageTab({ config, onSave, saving }: Props) {
  const [homepage, setHomepage] = useState(config.homepage);

  async function handleSave() {
    await onSave({ ...config, homepage });
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Homepage Content</h2>
        <p className="text-sm text-gray-500">
          Edit homepage stats, service cards, why-choose-us points, featured review
          preview, and both CTA blocks.
        </p>
      </div>

      <section>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Stats</h3>
        <div className="space-y-3">
          {homepage.stats.map((stat, index) => (
            <div key={index} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={stat.value}
                onChange={(e) =>
                  setHomepage((prev) => ({
                    ...prev,
                    stats: prev.stats.map((item, i) =>
                      i === index ? { ...item, value: e.target.value } : item
                    ),
                  }))
                }
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm"
                placeholder="100+"
              />
              <input
                type="text"
                value={stat.label}
                onChange={(e) =>
                  setHomepage((prev) => ({
                    ...prev,
                    stats: prev.stats.map((item, i) =>
                      i === index ? { ...item, label: e.target.value } : item
                    ),
                  }))
                }
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm"
                placeholder="Projects Completed"
              />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Services Section</h3>
        <div className="space-y-4">
          <input
            type="text"
            value={homepage.servicesHeading}
            onChange={(e) => setHomepage((prev) => ({ ...prev, servicesHeading: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm"
            placeholder="Our Services"
          />
          <textarea
            value={homepage.servicesSubheading}
            onChange={(e) => setHomepage((prev) => ({ ...prev, servicesSubheading: e.target.value }))}
            rows={3}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm resize-none"
          />
          <div className="space-y-4">
            {homepage.services.map((service, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-4 space-y-3">
                <input
                  type="text"
                  value={service.title}
                  onChange={(e) =>
                    setHomepage((prev) => ({
                      ...prev,
                      services: prev.services.map((item, i) =>
                        i === index ? { ...item, title: e.target.value } : item
                      ),
                    }))
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm"
                  placeholder="Service title"
                />
                <input
                  type="text"
                  value={service.href}
                  onChange={(e) =>
                    setHomepage((prev) => ({
                      ...prev,
                      services: prev.services.map((item, i) =>
                        i === index ? { ...item, href: e.target.value } : item
                      ),
                    }))
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm"
                  placeholder="/deck-installation/"
                />
                <textarea
                  value={service.description}
                  onChange={(e) =>
                    setHomepage((prev) => ({
                      ...prev,
                      services: prev.services.map((item, i) =>
                        i === index ? { ...item, description: e.target.value } : item
                      ),
                    }))
                  }
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm resize-none"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Why Choose Us</h3>
        <div className="space-y-4">
          <input
            type="text"
            value={homepage.whyChooseUsHeading}
            onChange={(e) => setHomepage((prev) => ({ ...prev, whyChooseUsHeading: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm"
          />
          {homepage.whyChooseUsItems.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-xl p-4 space-y-3">
              <input
                type="text"
                value={item.title}
                onChange={(e) =>
                  setHomepage((prev) => ({
                    ...prev,
                    whyChooseUsItems: prev.whyChooseUsItems.map((entry, i) =>
                      i === index ? { ...entry, title: e.target.value } : entry
                    ),
                  }))
                }
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm"
              />
              <textarea
                value={item.description}
                onChange={(e) =>
                  setHomepage((prev) => ({
                    ...prev,
                    whyChooseUsItems: prev.whyChooseUsItems.map((entry, i) =>
                      i === index ? { ...entry, description: e.target.value } : entry
                    ),
                  }))
                }
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm resize-none"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Featured Reviews Preview</h3>
        <input
          type="text"
          value={homepage.featuredReviews.heading}
          onChange={(e) =>
            setHomepage((prev) => ({
              ...prev,
              featuredReviews: { ...prev.featuredReviews, heading: e.target.value },
            }))
          }
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm"
        />
        <input
          type="text"
          value={homepage.featuredReviews.subheading}
          onChange={(e) =>
            setHomepage((prev) => ({
              ...prev,
              featuredReviews: { ...prev.featuredReviews, subheading: e.target.value },
            }))
          }
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            value={homepage.featuredReviews.countLabel}
            onChange={(e) =>
              setHomepage((prev) => ({
                ...prev,
                featuredReviews: { ...prev.featuredReviews, countLabel: e.target.value },
              }))
            }
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm"
            placeholder="verified reviews"
          />
          <input
            type="number"
            min={1}
            max={6}
            value={homepage.featuredReviews.visibleCount}
            onChange={(e) =>
              setHomepage((prev) => ({
                ...prev,
                featuredReviews: {
                  ...prev.featuredReviews,
                  visibleCount: Number(e.target.value) || 1,
                },
              }))
            }
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm"
          />
        </div>
      </section>

      {([
        { key: "miniCta", label: "Homepage Side CTA" },
        { key: "bottomCta", label: "Homepage Bottom CTA" },
      ] as const).map(({ key, label }) => {
        const cta = homepage[key];
        return (
          <section key={key} className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">{label}</h3>
            <input type="text" value={cta.title} onChange={(e) => setHomepage((prev) => ({ ...prev, [key]: { ...prev[key], title: e.target.value } }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm" />
            <textarea value={cta.body} onChange={(e) => setHomepage((prev) => ({ ...prev, [key]: { ...prev[key], body: e.target.value } }))} rows={3} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm resize-none" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input type="text" value={cta.primaryLabel} onChange={(e) => setHomepage((prev) => ({ ...prev, [key]: { ...prev[key], primaryLabel: e.target.value } }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm" />
              <input type="text" value={cta.primaryHref} onChange={(e) => setHomepage((prev) => ({ ...prev, [key]: { ...prev[key], primaryHref: e.target.value } }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm" />
              <input type="text" value={cta.secondaryLabel} onChange={(e) => setHomepage((prev) => ({ ...prev, [key]: { ...prev[key], secondaryLabel: e.target.value } }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm" />
              <input type="text" value={cta.secondaryHref} onChange={(e) => setHomepage((prev) => ({ ...prev, [key]: { ...prev[key], secondaryHref: e.target.value } }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm" />
            </div>
            <input type="text" value={cta.footnote} onChange={(e) => setHomepage((prev) => ({ ...prev, [key]: { ...prev[key], footnote: e.target.value } }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm" placeholder="Optional footnote" />
          </section>
        );
      })}

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60 transition-opacity"
        style={{ background: "linear-gradient(135deg, #26463f, #4b776b)" }}
      >
        {saving ? "Saving…" : "Save Homepage Content"}
      </button>
    </div>
  );
}

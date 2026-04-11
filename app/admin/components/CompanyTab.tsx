"use client";

import { useState } from "react";
import type { SiteConfig } from "../lib/types";

interface Props {
  config: SiteConfig;
  onSave: (config: SiteConfig) => Promise<void>;
  saving: boolean;
}

export default function CompanyTab({ config, onSave, saving }: Props) {
  const [company, setCompany] = useState(config.company);

  async function handleSave() {
    await onSave({ ...config, company });
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Company Content</h2>
        <p className="text-sm text-gray-500">
          Manage About page copy, company profile details, hours, footer blurb,
          and trust/certification messaging.
        </p>
      </div>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">About Page Copy</h3>
        <input
          type="text"
          value={company.aboutHeading}
          onChange={(e) => setCompany((prev) => ({ ...prev, aboutHeading: e.target.value }))}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm"
        />
        <textarea
          value={company.aboutSubheading}
          onChange={(e) => setCompany((prev) => ({ ...prev, aboutSubheading: e.target.value }))}
          rows={3}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm resize-none"
        />
        {company.aboutBody.map((paragraph, index) => (
          <textarea
            key={index}
            value={paragraph}
            onChange={(e) =>
              setCompany((prev) => ({
                ...prev,
                aboutBody: prev.aboutBody.map((item, i) => (i === index ? e.target.value : item)),
              }))
            }
            rows={4}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm resize-none"
          />
        ))}
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Values</h3>
        <input
          type="text"
          value={company.valuesHeading}
          onChange={(e) => setCompany((prev) => ({ ...prev, valuesHeading: e.target.value }))}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm"
        />
        {company.values.map((value, index) => (
          <div key={index} className="border border-gray-200 rounded-xl p-4 space-y-3">
            <input
              type="text"
              value={value.title}
              onChange={(e) =>
                setCompany((prev) => ({
                  ...prev,
                  values: prev.values.map((item, i) =>
                    i === index ? { ...item, title: e.target.value } : item
                  ),
                }))
              }
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm"
            />
            <textarea
              value={value.description}
              onChange={(e) =>
                setCompany((prev) => ({
                  ...prev,
                  values: prev.values.map((item, i) =>
                    i === index ? { ...item, description: e.target.value } : item
                  ),
                }))
              }
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm resize-none"
            />
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Hours</h3>
        <input type="text" value={company.hours.weekdays} onChange={(e) => setCompany((prev) => ({ ...prev, hours: { ...prev.hours, weekdays: e.target.value } }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm" />
        <input type="text" value={company.hours.saturday} onChange={(e) => setCompany((prev) => ({ ...prev, hours: { ...prev.hours, saturday: e.target.value } }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm" />
        <input type="text" value={company.hours.sunday} onChange={(e) => setCompany((prev) => ({ ...prev, hours: { ...prev.hours, sunday: e.target.value } }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm" />
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Footer + Trust Messaging</h3>
        <textarea value={company.footerBlurb} onChange={(e) => setCompany((prev) => ({ ...prev, footerBlurb: e.target.value }))} rows={3} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm resize-none" />
        {company.trustBadges.map((badge, index) => (
          <input
            key={index}
            type="text"
            value={badge}
            onChange={(e) =>
              setCompany((prev) => ({
                ...prev,
                trustBadges: prev.trustBadges.map((item, i) => (i === index ? e.target.value : item)),
              }))
            }
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm"
          />
        ))}
      </section>

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60 transition-opacity"
        style={{ background: "linear-gradient(135deg, #26463f, #4b776b)" }}
      >
        {saving ? "Saving…" : "Save Company Content"}
      </button>
    </div>
  );
}

"use client";

import { useState } from "react";
import type { SiteConfig } from "../lib/types";

interface Props {
  config: SiteConfig;
  onSave: (config: SiteConfig) => Promise<void>;
  saving: boolean;
}

interface FeatureToggle {
  key: keyof SiteConfig["features"];
  label: string;
  description: string;
}

const FEATURE_TOGGLES: FeatureToggle[] = [
  {
    key: "showVeteranBadge",
    label: "Veteran-Owned Badge",
    description:
      "Show the 'Veteran-Owned & TrexPro Certified' badge in the hero section.",
  },
  {
    key: "showTrexProBadge",
    label: "TrexPro Badge",
    description:
      "Show the TrexPro Certified badge and callout in 'Why Choose Us'.",
  },
  {
    key: "heroEnabled",
    label: "Hero Section",
    description:
      "Show the full hero section on the home page. Disable to show a minimal header instead.",
  },
];

export default function FeaturesTab({ config, onSave, saving }: Props) {
  const [features, setFeatures] = useState({ ...config.features });

  function toggle(key: keyof SiteConfig["features"]) {
    setFeatures((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSave() {
    await onSave({ ...config, features });
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Feature Flags</h2>
      <p className="text-sm text-gray-500 mb-8">
        Toggle site features on or off without touching the code.
      </p>

      <div className="space-y-4 mb-8">
        {FEATURE_TOGGLES.map(({ key, label, description }) => (
          <div
            key={key}
            className="flex items-start justify-between gap-4 p-4 rounded-xl border border-gray-200 bg-white"
          >
            <div>
              <p className="text-sm font-semibold text-gray-800">{label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{description}</p>
            </div>
            <button
              onClick={() => toggle(key)}
              className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                features[key] ? "bg-green-600" : "bg-gray-200"
              }`}
              role="switch"
              aria-checked={features[key]}
              aria-label={label}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  features[key] ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60 transition-opacity"
        style={{ background: "linear-gradient(135deg, #26463f, #4b776b)" }}
      >
        {saving ? "Saving…" : "Save Changes"}
      </button>
    </div>
  );
}

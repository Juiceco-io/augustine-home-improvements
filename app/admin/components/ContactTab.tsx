"use client";

import { useState } from "react";
import type { SiteConfig } from "../lib/types";

interface Props {
  config: SiteConfig;
  onSave: (config: SiteConfig) => Promise<void>;
  saving: boolean;
}

export default function ContactTab({ config, onSave, saving }: Props) {
  const [phone, setPhone] = useState(config.contact.phone);
  const [email, setEmail] = useState(config.contact.email);
  const [serviceArea, setServiceArea] = useState(config.contact.serviceArea);

  async function handleSave() {
    await onSave({
      ...config,
      contact: { phone, email, serviceArea },
    });
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Contact Info</h2>
      <p className="text-sm text-gray-500 mb-8">
        Update the phone number, email, and service area shown on the site.
      </p>

      <div className="space-y-5 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Phone Number
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="484-467-7925"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="info@augustinehomeimprovements.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Service Area Description
          </label>
          <textarea
            value={serviceArea}
            onChange={(e) => setServiceArea(e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            placeholder="Chester County, PA and surrounding communities…"
          />
          <p className="text-xs text-gray-400 mt-1">
            This appears in the Contact page and footer.
          </p>
        </div>
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

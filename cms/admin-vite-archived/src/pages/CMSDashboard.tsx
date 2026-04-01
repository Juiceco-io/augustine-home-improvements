import { useState, useEffect } from "react";
import { getConfig, putConfig } from "../lib/api";
import { getCurrentUserEmail } from "../lib/auth";
import type { SiteConfig } from "../lib/types";
import BrandingTab from "../components/BrandingTab";
import HeroTab from "../components/HeroTab";
import GalleryTab from "../components/GalleryTab";
import ContactTab from "../components/ContactTab";
import FeaturesTab from "../components/FeaturesTab";

type Tab = "branding" | "hero" | "gallery" | "contact" | "features";

interface Props {
  onLogout: () => void;
}

export default function CMSDashboard({ onLogout }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("branding");
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const email = getCurrentUserEmail();

  useEffect(() => {
    getConfig()
      .then(setConfig)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(updated: SiteConfig) {
    setSaving(true);
    setError(null);
    try {
      await putConfig(updated);
      setConfig(updated);
      setSavedAt(new Date().toLocaleTimeString());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "branding", label: "Branding" },
    { id: "hero", label: "Hero" },
    { id: "gallery", label: "Gallery" },
    { id: "contact", label: "Contact" },
    { id: "features", label: "Features" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #26463f, #4b776b)" }}
            >
              <span className="text-white text-sm font-bold">A</span>
            </div>
            <span className="font-semibold text-gray-900">Augustine CMS</span>
          </div>
          <div className="flex items-center gap-4">
            {email && (
              <span className="text-sm text-gray-500 hidden sm:block">{email}</span>
            )}
            <a
              href="https://www.augustinehomeimprovements.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
              View Site ↗
            </a>
            <button
              onClick={onLogout}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Status bar */}
        {(error || savedAt || saving) && (
          <div
            className={`mb-6 px-4 py-3 rounded-lg text-sm ${
              error
                ? "bg-red-50 border border-red-200 text-red-700"
                : "bg-green-50 border border-green-200 text-green-700"
            }`}
          >
            {error
              ? `Error: ${error}`
              : saving
              ? "Saving…"
              : `Saved at ${savedAt}. Changes appear on the site within ~60 seconds.`}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20">
            <p className="text-gray-400 text-sm">Loading config…</p>
          </div>
        )}

        {!loading && config && (
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Sidebar nav */}
            <nav className="sm:w-44 flex-shrink-0">
              <ul className="space-y-1">
                {tabs.map((tab) => (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? "text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                      style={
                        activeTab === tab.id
                          ? { background: "linear-gradient(135deg, #26463f, #4b776b)" }
                          : {}
                      }
                    >
                      {tab.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Content panel */}
            <div className="flex-1 bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
              {activeTab === "branding" && (
                <BrandingTab
                  config={config}
                  onSave={handleSave}
                  saving={saving}
                />
              )}
              {activeTab === "hero" && (
                <HeroTab config={config} onSave={handleSave} saving={saving} />
              )}
              {activeTab === "gallery" && (
                <GalleryTab
                  config={config}
                  onSave={handleSave}
                  saving={saving}
                />
              )}
              {activeTab === "contact" && (
                <ContactTab
                  config={config}
                  onSave={handleSave}
                  saving={saving}
                />
              )}
              {activeTab === "features" && (
                <FeaturesTab
                  config={config}
                  onSave={handleSave}
                  saving={saving}
                />
              )}
            </div>
          </div>
        )}

        {/* Version info */}
        {config && (
          <p className="text-xs text-gray-400 text-center mt-6">
            Config v{config._version} · Last saved by {config._updatedBy} at{" "}
            {new Date(config._updatedAt).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}

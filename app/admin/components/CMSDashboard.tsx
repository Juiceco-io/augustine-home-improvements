"use client";

import { useState, useEffect } from "react";
import { Sun, Moon, X, Loader2 } from "lucide-react";
import { getConfig, putConfig } from "../lib/api";
import { getCurrentUserEmail } from "../lib/auth";
import type { SiteConfig } from "../lib/types";
import { normalizeSiteConfig } from "@/lib/siteConfig";
import BrandingTab from "./BrandingTab";
import HeroTab from "./HeroTab";
import GalleryTab from "./GalleryTab";
import ContactTab from "./ContactTab";
import FeaturesTab from "./FeaturesTab";
import HomepageTab from "./HomepageTab";
import CompanyTab from "./CompanyTab";
import ReviewsTab from "./ReviewsTab";
import ServiceAreasTab from "./ServiceAreasTab";
import dynamic from "next/dynamic";

const AnalyticsTab = dynamic(() => import("./AnalyticsTab"), { ssr: false });

const PUBLIC_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.augustinehomeimprovements.com";

const PENDING_CHANGES_KEY = "cms-pending-changes";

const TAB_LABELS: Record<string, string> = {
  branding:  "Branding",
  hero:      "Hero",
  homepage:  "Homepage",
  company:   "Company",
  reviews:   "Reviews",
  gallery:   "Gallery",
  contact:   "Contact",
  features:  "Features",
  analytics: "Analytics",
};

type PendingChange = { tab: string; label: string; time: string; snapshot?: unknown };

type CMSTab = "branding" | "hero" | "homepage" | "company" | "reviews" | "gallery" | "contact" | "features" | "serviceAreas";
type Tab = CMSTab | "analytics";

const TAB_TO_CONFIG_KEY: Record<CMSTab, keyof SiteConfig> = {
  branding: "brand",
  hero: "hero",
  homepage: "homepage",
  company: "company",
  reviews: "reviews",
  gallery: "gallery",
  contact: "contact",
  features: "features",
  serviceAreas: "serviceAreas",
};

interface Props {
  onLogout: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export default function CMSDashboard({ onLogout, isDark, onToggleTheme }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("branding");
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(PENDING_CHANGES_KEY) ?? "[]");
    } catch {
      return [];
    }
  });
  const [discarding, setDiscarding] = useState<string | null>(null);

  const email = getCurrentUserEmail();

  useEffect(() => {
    getConfig()
      .then((data) => setConfig(normalizeSiteConfig(data)))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(updated: SiteConfig) {
    setSaving(true);
    setError(null);
    try {
      // Capture the pre-save value for this tab so discard can revert it.
      // If there's already a pending entry for this tab, preserve its original snapshot.
      const key = TAB_TO_CONFIG_KEY[activeTab as CMSTab];
      const existingEntry = pendingChanges.find((c) => c.tab === activeTab);
      const snapshot = existingEntry?.snapshot ?? (config ? config[key] : undefined);

      await putConfig(updated);
      setConfig(updated);
      const time = new Date().toLocaleTimeString();
      setSavedAt(time);
      const newEntry: PendingChange = {
        tab: activeTab,
        label: TAB_LABELS[activeTab] ?? activeTab,
        time,
        snapshot,
      };
      const updatedChanges = [
        ...pendingChanges.filter((c) => c.tab !== activeTab),
        newEntry,
      ];
      setPendingChanges(updatedChanges);
      localStorage.setItem(PENDING_CHANGES_KEY, JSON.stringify(updatedChanges));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDiscard(tab: Tab) {
    if (!config) return;
    const change = pendingChanges.find((c) => c.tab === tab);
    if (!change?.snapshot) {
      // No snapshot available (e.g. old entry before this feature) — just remove the indicator.
      const updatedChanges = pendingChanges.filter((c) => c.tab !== tab);
      setPendingChanges(updatedChanges);
      localStorage.setItem(PENDING_CHANGES_KEY, JSON.stringify(updatedChanges));
      return;
    }
    setDiscarding(tab);
    setError(null);
    try {
      const key = TAB_TO_CONFIG_KEY[tab as CMSTab];
      const reverted = { ...config, [key]: change.snapshot } as SiteConfig;
      await putConfig(reverted);
      setConfig(reverted);
      const updatedChanges = pendingChanges.filter((c) => c.tab !== tab);
      setPendingChanges(updatedChanges);
      localStorage.setItem(PENDING_CHANGES_KEY, JSON.stringify(updatedChanges));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Discard failed");
    } finally {
      setDiscarding(null);
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "branding",  label: "Branding" },
    { id: "hero",      label: "Hero" },
    { id: "homepage",  label: "Homepage" },
    { id: "company",   label: "Company" },
    { id: "reviews",   label: "Reviews" },
    { id: "gallery",   label: "Gallery" },
    { id: "contact",      label: "Contact" },
    { id: "features",     label: "Features" },
    { id: "serviceAreas", label: "Service Areas" },
    { id: "analytics",    label: "Analytics" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #26463f, #4b776b)" }}
            >
              <span className="text-white text-sm font-bold">A</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">Augustine CMS</span>
          </div>
          <div className="flex items-center gap-4">
            {email && (
              <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                {email}
              </span>
            )}
            <a
              href={PUBLIC_SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              View Live Site ↗
            </a>
            <button
              onClick={() => window.open("/admin/preview/", "_blank")}
              className="text-sm font-medium text-white px-3 py-1.5 rounded-lg transition-colors"
              style={{ background: "linear-gradient(135deg, #26463f, #4b776b)" }}
            >
              Preview Site →
            </button>
            <button
              onClick={onToggleTheme}
              className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              onClick={onLogout}
              className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Pending changes */}
        {pendingChanges.length > 0 && (
          <div className="mb-6 px-4 py-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-300">
                Pending Changes — {pendingChanges.length} section{pendingChanges.length !== 1 ? "s" : ""} saved, not yet published
              </h3>
              <span className="text-xs text-amber-600 dark:text-amber-400 hidden sm:block">Preview then Publish to go live</span>
            </div>
            <ul className="flex flex-wrap gap-2">
              {pendingChanges.map((change) => (
                <li
                  key={change.tab}
                  className="flex items-center gap-0.5 bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-700/50 rounded-md overflow-hidden"
                >
                  <button
                    onClick={() => setActiveTab(change.tab as Tab)}
                    className="flex items-center gap-1.5 px-2.5 py-1 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors cursor-pointer"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                    <span className="text-xs font-medium text-amber-800 dark:text-amber-300">{change.label}</span>
                    <span className="text-xs text-amber-400 dark:text-amber-500">· {change.time}</span>
                  </button>
                  <button
                    onClick={() => handleDiscard(change.tab as Tab)}
                    disabled={discarding === change.tab}
                    className="px-1.5 py-1 text-amber-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 border-l border-amber-100 dark:border-amber-800/40"
                    title={`Discard ${change.label} changes`}
                    aria-label={`Discard ${change.label} changes`}
                  >
                    {discarding === change.tab ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <X size={12} />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Status bar */}
        {(error || savedAt || saving) && (
          <div
            className={`mb-6 px-4 py-3 rounded-lg text-sm ${
              error
                ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 text-red-700 dark:text-red-400"
                : "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/50 text-green-700 dark:text-green-400"
            }`}
          >
            {error
              ? `Error: ${error}`
              : saving
                ? "Saving…"
                : `Draft saved at ${savedAt}. Click 'Preview Site' to review, then Publish when ready.`}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20">
            <p className="text-gray-400 dark:text-gray-500 text-sm">Loading config…</p>
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
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                      style={
                        activeTab === tab.id
                          ? {
                              background:
                                "linear-gradient(135deg, #26463f, #4b776b)",
                            }
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
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
              {activeTab === "branding" && (
                <BrandingTab
                  config={config}
                  onSave={handleSave}
                  saving={saving}
                />
              )}
              {activeTab === "hero" && (
                <HeroTab
                  config={config}
                  onSave={handleSave}
                  saving={saving}
                />
              )}
              {activeTab === "homepage" && (
                <HomepageTab
                  config={config}
                  onSave={handleSave}
                  saving={saving}
                />
              )}
              {activeTab === "company" && (
                <CompanyTab
                  config={config}
                  onSave={handleSave}
                  saving={saving}
                />
              )}
              {activeTab === "reviews" && (
                <ReviewsTab
                  config={config}
                  onSave={handleSave}
                  saving={saving}
                />
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
              {activeTab === "serviceAreas" && (
                <ServiceAreasTab
                  config={config}
                  onSave={handleSave}
                  saving={saving}
                />
              )}
              {activeTab === "analytics" && <AnalyticsTab />}
            </div>
          </div>
        )}

        {/* Version info */}
        {config && (
          <p className="text-xs text-gray-400 dark:text-gray-600 text-center mt-6">
            Config v{config._version} · Last saved by {config._updatedBy} at{" "}
            {new Date(config._updatedAt).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}

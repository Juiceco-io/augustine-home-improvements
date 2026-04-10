"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getIdToken } from "../lib/auth";
import { getConfig, publishConfig } from "../lib/api";
import { normalizeSiteConfig } from "@/lib/siteConfig";
import type { SiteConfig } from "@/lib/siteConfig";
import { SiteConfigProvider } from "@/lib/SiteConfigContext";
import ClientOnly from "@/components/ClientOnly";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Height of the preview banner in pixels (used to offset the fixed Navbar).
const BANNER_HEIGHT = 40;

export default function PreviewShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState<{
    ok?: boolean;
    error?: string;
  } | null>(null);

  // Auth check + draft config fetch on mount
  useEffect(() => {
    getIdToken().then((token) => {
      if (!token) {
        router.replace("/admin");
        return;
      }
      setAuthChecked(true);
      getConfig()
        .then((data) => setConfig(normalizeSiteConfig(data)))
        .catch((e) => console.error("[preview] failed to load draft config:", e));
    });
  }, [router]);

  async function handlePublish() {
    setPublishing(true);
    setPublishStatus(null);
    try {
      await publishConfig();
      setPublishStatus({ ok: true });
    } catch (e) {
      setPublishStatus({
        error: e instanceof Error ? e.message : "Publish failed",
      });
    } finally {
      setPublishing(false);
    }
  }

  if (!authChecked || !config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-400 text-sm">Loading preview…</p>
      </div>
    );
  }

  return (
    <SiteConfigProvider config={config}>
      {/* ── Preview banner ─────────────────────────────────────────────────── */}
      <div
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 text-sm font-medium text-white"
        style={{
          height: BANNER_HEIGHT,
          background: "linear-gradient(90deg, #92400e 0%, #b45309 100%)",
        }}
      >
        <span className="hidden sm:block text-white/90 text-xs">
          Preview Mode — draft changes, not yet live
        </span>
        <span className="sm:hidden text-white/90 text-xs">Preview</span>

        <div className="flex items-center gap-3">
          {publishStatus?.ok && (
            <span className="text-green-200 text-xs">✓ Published!</span>
          )}
          {publishStatus?.error && (
            <span className="text-red-200 text-xs truncate max-w-[160px]">
              {publishStatus.error}
            </span>
          )}
          <a
            href="/admin"
            className="text-white/80 hover:text-white transition-colors text-xs"
          >
            ← Back to CMS
          </a>
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="bg-white text-amber-700 font-semibold text-xs px-3 py-1 rounded-md hover:bg-amber-50 transition-colors disabled:opacity-60"
          >
            {publishing ? "Publishing…" : "Publish"}
          </button>
        </div>
      </div>

      {/* ── Site shell ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col min-h-screen">
        <ClientOnly>
          {/* Offset Navbar below the fixed preview banner */}
          <Navbar basePath="/admin/preview" topOffset={BANNER_HEIGHT} />
        </ClientOnly>
        <main className="flex-1">{children}</main>
        <ClientOnly>
          <Footer basePath="/admin/preview" />
        </ClientOnly>
      </div>
    </SiteConfigProvider>
  );
}

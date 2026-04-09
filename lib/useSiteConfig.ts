/**
 * Augustine CMS — client-side hook for fetching live site config.
 *
 * Fetches site-config.json from the same site origin on mount and re-checks
 * every 60s.
 * Falls back to `defaultConfig` if the request fails (CDN down, network error).
 *
 * CloudFront serves /site-config.json from the CMS config bucket with a 60s
 * TTL, so admin changes appear on the live site within ~1 minute without the
 * browser needing a separate CMS config origin.
 *
 * Usage (client components only — add "use client" at top of consuming file):
 *
 *   const config = useSiteConfig();
 *   <img src={config.brand.logoUrl || '/images/augustine-logo.png'} />
 */

"use client";

import { useState, useEffect } from "react";
import { type SiteConfig, defaultConfig, normalizeSiteConfig } from "./siteConfig";

const CONFIG_URL = "/site-config.json";

let cached: SiteConfig | null = null;
let lastFetchedAt = 0;
const DEDUPE_MS = 60_000;

async function fetchConfig(): Promise<SiteConfig> {
  const now = Date.now();
  if (cached && now - lastFetchedAt < DEDUPE_MS) return cached;

  try {
    const res = await fetch(CONFIG_URL, {
      // browser cache respects CDN TTL (60s); this is a backstop
      next: undefined,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = normalizeSiteConfig((await res.json()) as Partial<SiteConfig>);
    cached = data;
    lastFetchedAt = now;
    return data;
  } catch (err) {
    // Fail gracefully — site continues working with defaults
    if (process.env.NODE_ENV !== "production") {
      console.warn("[useSiteConfig] fetch failed, using defaultConfig:", err);
    }
    return cached ?? defaultConfig;
  }
}

export function useSiteConfig(): SiteConfig {
  const [config, setConfig] = useState<SiteConfig>(cached ?? defaultConfig);

  useEffect(() => {
    let cancelled = false;
    fetchConfig().then((data) => {
      if (!cancelled) setConfig(data);
    });
    // Refresh on a 60-second interval so long-lived tabs pick up changes
    const interval = setInterval(() => {
      // Force a new fetch by clearing the dedupe window
      lastFetchedAt = 0;
      fetchConfig().then((data) => {
        if (!cancelled) setConfig(data);
      });
    }, DEDUPE_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return config;
}

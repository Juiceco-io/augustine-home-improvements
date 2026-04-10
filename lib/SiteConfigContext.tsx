"use client";

/**
 * SiteConfigContext — allows the admin preview to inject draft config into
 * the full component tree so all site components display draft data without
 * fetching from the CDN.
 *
 * Usage:
 *   // In the preview layout:
 *   <SiteConfigProvider config={draftConfig}>
 *     {children}
 *   </SiteConfigProvider>
 *
 *   // useSiteConfig() automatically reads from this context when present,
 *   // skipping the CDN fetch and polling loop entirely.
 */

import { createContext, useContext, type ReactNode } from "react";
import type { SiteConfig } from "./siteConfig";

const SiteConfigContext = createContext<SiteConfig | null>(null);

export function SiteConfigProvider({
  config,
  children,
}: {
  config: SiteConfig;
  children: ReactNode;
}) {
  return (
    <SiteConfigContext.Provider value={config}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfigContext(): SiteConfig | null {
  return useContext(SiteConfigContext);
}

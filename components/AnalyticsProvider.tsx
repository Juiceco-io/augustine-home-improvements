"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackPageView, trackWebVitals, trackEvent } from "@/lib/analytics";

// Re-export trackEvent so components can import from a single place
export { trackEvent };

export default function AnalyticsProvider() {
  const pathname = usePathname();
  const initialized = useRef(false);
  const pageEntryTime = useRef<number>(0);

  // One-time setup: web vitals + visibility-based exit tracking
  useEffect(() => {
    // Dynamically import web-vitals to avoid adding to the initial JS bundle
    import("web-vitals")
      .then(({ onLCP, onINP, onCLS, onTTFB, onFCP }) => {
        onLCP(({ name, value, rating }) => trackWebVitals(name, value, rating));
        onINP(({ name, value, rating }) => trackWebVitals(name, value, rating));
        onCLS(({ name, value, rating }) => trackWebVitals(name, value, rating));
        onTTFB(({ name, value, rating }) => trackWebVitals(name, value, rating));
        onFCP(({ name, value, rating }) => trackWebVitals(name, value, rating));
      })
      .catch(() => {
        // web-vitals not available — silently skip
      });

    const onHide = () => {
      if (document.visibilityState === "hidden") {
        trackEvent("PAGE_EXIT", {
          durationMs: String(Date.now() - pageEntryTime.current),
        });
      }
    };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, []);

  // Track page views — fires on mount (initial load) and on every route change
  useEffect(() => {
    // Use document.referrer only on the very first page load
    const referrer = !initialized.current
      ? (typeof document !== "undefined" ? document.referrer : "")
      : "";
    initialized.current = true;
    pageEntryTime.current = Date.now();
    trackPageView(pathname, referrer);
  }, [pathname]);

  return null;
}

/**
 * Analytics tracking client for Augustine Home Improvements.
 *
 * Sends events to the analytics-ingest Lambda via POST beacon.
 * Uses sessionStorage for session ID — no cookies, no PII stored.
 * Silently no-ops when NEXT_PUBLIC_ANALYTICS_API_URL is not set (dev).
 */

const API_URL = (process.env.NEXT_PUBLIC_ANALYTICS_API_URL ?? "").trim();
const SESSION_KEY = "_ahia";

let _sessionId: string | null = null;

function getSessionId(): string {
  if (_sessionId) return _sessionId;
  if (typeof window === "undefined") return "server";
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      _sessionId = stored;
      return stored;
    }
    const id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
    _sessionId = id;
    return id;
  } catch {
    return "anonymous";
  }
}

function getDeviceType(): string {
  if (typeof window === "undefined") return "unknown";
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

function send(payload: object): void {
  if (!API_URL) return;
  const body = JSON.stringify(payload);
  try {
    // Use fetch with keepalive (survives page unload) and credentials: 'omit'
    // so it's compatible with Access-Control-Allow-Origin: * on the ingest endpoint.
    fetch(API_URL, {
      method: "POST",
      body,
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      credentials: "omit",
    }).catch(() => {});
  } catch {
    // Never surface analytics errors — tracking must not affect UX
  }
}

export function trackPageView(page: string, referrer: string): void {
  send({
    eventType:  "PAGE_VIEW",
    page,
    sessionId:  getSessionId(),
    referrer,
    deviceType: getDeviceType(),
  });
}

export function trackEvent(type: string, data?: Record<string, string>): void {
  send({
    eventType: type,
    page:      typeof window !== "undefined" ? window.location.pathname : "/",
    sessionId: getSessionId(),
    data:      data ?? {},
  });
}

export function trackWebVitals(name: string, value: number, rating: string): void {
  send({
    eventType: "WEB_VITAL",
    page:      typeof window !== "undefined" ? window.location.pathname : "/",
    sessionId: getSessionId(),
    data:      { metric: name, value: String(Math.round(value * 100) / 100), rating },
  });
}

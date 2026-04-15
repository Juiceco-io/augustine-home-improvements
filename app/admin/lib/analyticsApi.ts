import { getIdToken } from "./auth";

// Analytics query endpoint is on the same CMS API Gateway
const CMS_API_URL = (process.env.NEXT_PUBLIC_CMS_API_URL ?? "").replace(/\/$/, "");

export interface PageViewStat {
  page: string;
  count: number;
}

export interface ReferrerStat {
  source: string;
  count: number;
}

export interface DailyStat {
  date: string;
  pageViews: number;
  sessions: number;
}

export interface WebVitalStat {
  metric: string;
  avg: number;
  count: number;
}

export interface CtaStat {
  label: string;
  count: number;
}

export interface CountryStat {
  country: string;
  sessions: number;
}

export interface DeviceBreakdown {
  mobile: number;
  desktop: number;
  tablet: number;
}

export interface AnalyticsData {
  range: string;
  totalPageViews: number;
  uniqueSessions: number;
  formSubmissions: number;
  totalCtaClicks: number;
  topPages: PageViewStat[];
  referrers: ReferrerStat[];
  deviceBreakdown: DeviceBreakdown;
  countryBreakdown: CountryStat[];
  dailyTrend: DailyStat[];
  ctaBreakdown: CtaStat[];
  webVitals: WebVitalStat[];
}

export async function fetchAnalytics(
  range: "7d" | "30d" | "90d"
): Promise<AnalyticsData> {
  const token = await getIdToken();
  if (!token) throw new Error("Not authenticated");
  const res = await fetch(`${CMS_API_URL}/analytics?range=${range}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`GET /analytics failed: ${res.status}`);
  return res.json();
}

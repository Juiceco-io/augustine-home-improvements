"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { fetchAnalytics, type AnalyticsData } from "../lib/analyticsApi";

type Range = "7d" | "30d" | "90d";

// Google Core Web Vitals thresholds
const VITAL_THRESHOLDS: Record<string, { good: number; needs: number; unit: string }> = {
  LCP:  { good: 2500,  needs: 4000,  unit: "ms" },
  INP:  { good: 200,   needs: 500,   unit: "ms" },
  CLS:  { good: 0.1,   needs: 0.25,  unit: "" },
  TTFB: { good: 800,   needs: 1800,  unit: "ms" },
  FCP:  { good: 1800,  needs: 3000,  unit: "ms" },
};

type VitalRating = "good" | "needs-improvement" | "poor";

function vitalRating(name: string, avg: number): VitalRating {
  const t = VITAL_THRESHOLDS[name];
  if (!t) return "good";
  if (avg <= t.good) return "good";
  if (avg <= t.needs) return "needs-improvement";
  return "poor";
}

const RATING_CONFIG: Record<VitalRating, { label: string; className: string }> = {
  "good":             { label: "Good",    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  "needs-improvement":{ label: "Improve", className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" },
  "poor":             { label: "Poor",    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
};

const DEVICE_COLORS: Record<string, string> = {
  mobile:  "#4b776b",
  desktop: "#26463f",
  tablet:  "#7aaa9e",
};

function KPICard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-100 dark:border-gray-600">
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
      {sub && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>
      )}
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
      {children}
    </h3>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-100 dark:border-gray-600">
      {children}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <p className="text-sm text-gray-400 dark:text-gray-500 py-6 text-center">
      {message}
    </p>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00Z");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDateFull(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00Z");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatPageLabel(page: string) {
  if (page === "/") return "Home";
  return page.replace(/^\/|\/$/g, "").replace(/-/g, " ");
}

export default function AnalyticsTab() {
  const [range, setRange] = useState<Range>("30d");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchAnalytics(range)
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [range]);

  const totalDevices = data
    ? data.deviceBreakdown.mobile + data.deviceBreakdown.desktop + data.deviceBreakdown.tablet
    : 0;

  const devicePieData = data
    ? [
        { name: "Mobile",  value: data.deviceBreakdown.mobile },
        { name: "Desktop", value: data.deviceBreakdown.desktop },
        { name: "Tablet",  value: data.deviceBreakdown.tablet },
      ].filter((d) => d.value > 0)
    : [];

  const conversionRate =
    data && data.totalPageViews > 0
      ? (Math.round((data.formSubmissions / data.totalPageViews) * 1000) / 10).toFixed(1)
      : "0.0";

  const ctaRate =
    data && data.totalPageViews > 0
      ? (Math.round((data.totalCtaClicks / data.totalPageViews) * 1000) / 10).toFixed(1)
      : "0.0";

  return (
    <div>
      {/* Header + range selector */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Analytics</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Site traffic and engagement metrics
          </p>
        </div>
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {(["7d", "30d", "90d"] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                range === r
                  ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              {r === "7d" ? "7 days" : r === "30d" ? "30 days" : "90 days"}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-lg px-4 py-3 text-sm text-red-700 dark:text-red-400 mb-6">
          Failed to load analytics: {error}
        </div>
      )}

      {/* Initial loading */}
      {loading && !data && (
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-gray-400 dark:text-gray-500">Loading analytics…</p>
        </div>
      )}

      {/* Dashboard */}
      {data && (
        <div className={loading ? "opacity-50 pointer-events-none transition-opacity" : "transition-opacity"}>

          {/* ── KPI Cards ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <KPICard label="Page Views"       value={data.totalPageViews.toLocaleString()} />
            <KPICard label="Unique Sessions"  value={data.uniqueSessions.toLocaleString()} />
            <KPICard label="Form Submissions" value={data.formSubmissions} sub={`${conversionRate}% conversion`} />
            <KPICard label="CTA Clicks"       value={data.totalCtaClicks} sub={`${ctaRate}% of views`} />
          </div>

          {/* ── Daily Trend ── */}
          <div className="mb-8">
            <SectionHeading>Daily Traffic</SectionHeading>
            <Panel>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data.dailyTrend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    tickFormatter={formatDate}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      value,
                      name === "pageViews" ? "Page Views" : "Sessions",
                    ]}
                    labelFormatter={formatDateFull}
                  />
                  <Legend
                    formatter={(value: string) =>
                      value === "pageViews" ? "Page Views" : "Sessions"
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="pageViews"
                    stroke="#4b776b"
                    strokeWidth={2}
                    dot={false}
                    name="pageViews"
                  />
                  <Line
                    type="monotone"
                    dataKey="sessions"
                    stroke="#26463f"
                    strokeWidth={2}
                    dot={false}
                    strokeDasharray="4 2"
                    name="sessions"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Panel>
          </div>

          {/* ── Top Pages + Traffic Sources ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div>
              <SectionHeading>Top Pages</SectionHeading>
              <Panel>
                {data.topPages.length === 0 ? (
                  <EmptyState message="No page views recorded yet" />
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={data.topPages.slice(0, 6)}
                      layout="vertical"
                      margin={{ top: 0, right: 8, left: 4, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                      <YAxis
                        type="category"
                        dataKey="page"
                        tick={{ fontSize: 10 }}
                        width={92}
                        tickFormatter={formatPageLabel}
                      />
                      <Tooltip
                        formatter={(v: number) => [v, "Views"]}
                        labelFormatter={formatPageLabel}
                      />
                      <Bar dataKey="count" fill="#4b776b" radius={[0, 3, 3, 0]} name="Views" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Panel>
            </div>

            <div>
              <SectionHeading>Traffic Sources</SectionHeading>
              <Panel>
                {data.referrers.length === 0 ? (
                  <EmptyState message="No referrer data yet" />
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={data.referrers}
                      layout="vertical"
                      margin={{ top: 0, right: 8, left: 4, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                      <YAxis type="category" dataKey="source" tick={{ fontSize: 11 }} width={64} />
                      <Tooltip formatter={(v: number) => [v, "Views"]} />
                      <Bar dataKey="count" fill="#26463f" radius={[0, 3, 3, 0]} name="Views" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Panel>
            </div>
          </div>

          {/* ── Device Breakdown + Country Breakdown ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div>
              <SectionHeading>Device Breakdown</SectionHeading>
              <Panel>
                {devicePieData.length === 0 ? (
                  <EmptyState message="No device data yet" />
                ) : (
                  <div className="flex items-center gap-4">
                    <ResponsiveContainer width="55%" height={160}>
                      <PieChart>
                        <Pie
                          data={devicePieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={65}
                          paddingAngle={2}
                        >
                          {devicePieData.map((entry) => (
                            <Cell
                              key={entry.name}
                              fill={DEVICE_COLORS[entry.name.toLowerCase()] ?? "#9ca3af"}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(v: number) => [
                            `${v} (${totalDevices > 0 ? Math.round((v / totalDevices) * 100) : 0}%)`,
                            "",
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-col gap-2.5">
                      {devicePieData.map((d) => (
                        <div key={d.name} className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ background: DEVICE_COLORS[d.name.toLowerCase()] ?? "#9ca3af" }}
                          />
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {d.name}
                          </span>
                          <span className="text-xs font-medium text-gray-900 dark:text-white ml-auto pl-2">
                            {totalDevices > 0
                              ? Math.round((d.value / totalDevices) * 100)
                              : 0}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Panel>
            </div>

            <div>
              <SectionHeading>Top Countries</SectionHeading>
              <Panel>
                {data.countryBreakdown.length === 0 ? (
                  <EmptyState message="Country data available once live traffic flows through CloudFront" />
                ) : (
                  <div className="space-y-2.5 py-1">
                    {data.countryBreakdown.slice(0, 6).map(({ country, sessions }) => {
                      const maxSessions = data.countryBreakdown[0]?.sessions ?? 1;
                      return (
                        <div key={country} className="flex items-center gap-2">
                          <span className="text-xs text-gray-600 dark:text-gray-400 w-7 font-mono">
                            {country}
                          </span>
                          <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.round((sessions / maxSessions) * 100)}%`,
                                background: "#4b776b",
                              }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300 w-7 text-right">
                            {sessions}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Panel>
            </div>
          </div>

          {/* ── Conversion Funnel ── */}
          <div className="mb-8">
            <SectionHeading>Conversion Funnel</SectionHeading>
            <Panel>
              <div className="flex items-end gap-3 justify-center h-36">
                {[
                  { label: "Page Views",   value: data.totalPageViews, pct: 100 },
                  {
                    label: "CTA Clicks",
                    value: data.totalCtaClicks,
                    pct: data.totalPageViews > 0
                      ? Math.round((data.totalCtaClicks / data.totalPageViews) * 100)
                      : 0,
                  },
                  {
                    label: "Form Submits",
                    value: data.formSubmissions,
                    pct: data.totalPageViews > 0
                      ? Math.round((data.formSubmissions / data.totalPageViews) * 100)
                      : 0,
                  },
                ].map((step, i) => (
                  <div key={step.label} className="flex flex-col items-center gap-1 flex-1">
                    {i > 0 && (
                      <span className="hidden sm:block text-gray-300 dark:text-gray-600 text-lg self-center mb-2">
                        →
                      </span>
                    )}
                    <div
                      className="w-full rounded-t-lg flex items-end justify-center text-white text-xs font-bold pb-1 transition-all"
                      style={{
                        background: "linear-gradient(135deg, #26463f, #4b776b)",
                        opacity: 0.35 + 0.65 * (step.pct / 100),
                        height: `${Math.max(32, (step.pct / 100) * 80)}px`,
                      }}
                    >
                      {step.pct}%
                    </div>
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">
                      {step.value.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center leading-tight">
                      {step.label}
                    </p>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          {/* ── Core Web Vitals ── */}
          <div>
            <SectionHeading>Core Web Vitals</SectionHeading>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600 overflow-hidden">
              {data.webVitals.length === 0 ? (
                <EmptyState message="Web Vitals accumulate after real browser visits — check back once traffic flows" />
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-600">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Metric
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Avg
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Samples
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Rating
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.webVitals.map(({ metric, avg, count }) => {
                      const rating = vitalRating(metric, avg);
                      const t = VITAL_THRESHOLDS[metric];
                      const display = t?.unit === "ms"
                        ? `${avg.toLocaleString()}ms`
                        : String(avg);
                      return (
                        <tr
                          key={metric}
                          className="border-b border-gray-100 dark:border-gray-700 last:border-0"
                        >
                          <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                            {metric}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                            {display}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-500 dark:text-gray-400">
                            {count}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span
                              className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${RATING_CONFIG[rating].className}`}
                            >
                              {RATING_CONFIG[rating].label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

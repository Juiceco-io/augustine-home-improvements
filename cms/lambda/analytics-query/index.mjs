/**
 * Lambda: analytics-query
 *
 * GET /analytics?range=7d|30d|90d
 *
 * Requires Cognito ID token — the COGNITO_USER_POOLS authorizer validates
 * the token before this Lambda is invoked.
 *
 * Queries DynamoDB for all events in the requested date range, aggregates
 * them in memory, and returns a single dashboard-ready JSON object.
 *
 * Environment variables (set via Terraform):
 *   ANALYTICS_TABLE — DynamoDB table name
 *   ALLOWED_ORIGINS — Comma-separated allowed CORS origins
 */

import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";

const dynamo = new DynamoDBClient({});
const TABLE = process.env.ANALYTICS_TABLE;

const ALLOWED_ORIGINS = new Set(
  (process.env.ALLOWED_ORIGINS ?? "*")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean)
);

function corsOrigin(requestOrigin) {
  if (!requestOrigin) return "*";
  if (ALLOWED_ORIGINS.has("*")) return "*";
  return ALLOWED_ORIGINS.has(requestOrigin) ? requestOrigin : ALLOWED_ORIGINS.values().next().value;
}

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": corsOrigin(origin),
    "Access-Control-Allow-Headers": "Authorization,Content-Type",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
  };
}

function response(statusCode, body, origin) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
    body: JSON.stringify(body),
  };
}

/** Return array of YYYY-MM-DD strings covering the last `days` days (UTC). */
function buildDateRange(days) {
  const dates = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

/** Bucket a referrer URL into a readable source category. */
function categoriseReferrer(referrer) {
  if (!referrer) return "Direct";
  let host;
  try {
    host = new URL(referrer).hostname.toLowerCase();
  } catch {
    return "Other";
  }
  if (/google|bing|yahoo|duckduckgo|baidu|search/.test(host)) return "Search";
  if (/facebook|instagram|linkedin|twitter|x\.com|tiktok|social/.test(host)) return "Social";
  if (/augustinehomeimprovements/.test(host)) return "Internal";
  return "Other";
}

export async function handler(event) {
  const origin = event.headers?.origin ?? event.headers?.Origin ?? "";

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders(origin), body: "" };
  }

  const rangeParam = event.queryStringParameters?.range ?? "30d";
  const days = rangeParam === "7d" ? 7 : rangeParam === "90d" ? 90 : 30;
  const dates = buildDateRange(days);

  // ── Fetch all items for the date range ──────────────────────────

  const allItems = [];
  for (const date of dates) {
    let lastKey;
    do {
      const cmd = new QueryCommand({
        TableName: TABLE,
        KeyConditionExpression: "pk = :date",
        ExpressionAttributeValues: { ":date": { S: date } },
        ExclusiveStartKey: lastKey,
      });
      const res = await dynamo.send(cmd);
      if (res.Items) allItems.push(...res.Items);
      lastKey = res.LastEvaluatedKey;
    } while (lastKey);
  }

  // ── Segment by event type ────────────────────────────────────────

  const pageViews   = allItems.filter((i) => i.eventType?.S === "PAGE_VIEW");
  const ctaClicks   = allItems.filter((i) => i.eventType?.S === "CTA_CLICK");
  const formSubmits = allItems.filter((i) => i.eventType?.S === "FORM_SUBMIT");
  const webVitals   = allItems.filter((i) => i.eventType?.S === "WEB_VITAL");

  // Unique sessions across all event types
  const uniqueSessions = new Set(
    allItems.map((i) => i.sessionId?.S).filter(Boolean)
  ).size;

  // ── Top pages ────────────────────────────────────────────────────

  const pageCounts = {};
  for (const item of pageViews) {
    const p = item.page?.S ?? "/";
    pageCounts[p] = (pageCounts[p] ?? 0) + 1;
  }
  const topPages = Object.entries(pageCounts)
    .map(([page, count]) => ({ page, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // ── Traffic sources ──────────────────────────────────────────────

  const referrerCounts = {};
  for (const item of pageViews) {
    const cat = categoriseReferrer(item.referrer?.S ?? "");
    referrerCounts[cat] = (referrerCounts[cat] ?? 0) + 1;
  }
  const referrers = Object.entries(referrerCounts)
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);

  // ── Device breakdown ─────────────────────────────────────────────

  const deviceCounts = { mobile: 0, tablet: 0, desktop: 0 };
  for (const item of allItems) {
    const d = item.deviceType?.S ?? "desktop";
    if (d in deviceCounts) deviceCounts[d]++;
    else deviceCounts.desktop++;
  }

  // ── Country breakdown (top 10) ───────────────────────────────────

  const countryCounts = {};
  for (const item of allItems) {
    const c = item.country?.S;
    if (c) countryCounts[c] = (countryCounts[c] ?? 0) + 1;
  }
  const countryBreakdown = Object.entries(countryCounts)
    .map(([country, sessions]) => ({ country, sessions }))
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 10);

  // ── Daily trend ──────────────────────────────────────────────────

  const trendMap = Object.fromEntries(
    dates.map((d) => [d, { date: d, pageViews: 0, sessions: new Set() }])
  );
  for (const item of pageViews) {
    const d = item.pk?.S;
    if (trendMap[d]) trendMap[d].pageViews++;
  }
  for (const item of allItems) {
    const d = item.pk?.S;
    if (trendMap[d] && item.sessionId?.S) {
      trendMap[d].sessions.add(item.sessionId.S);
    }
  }
  const dailyTrend = dates.map((d) => ({
    date: d,
    pageViews: trendMap[d].pageViews,
    sessions:  trendMap[d].sessions.size,
  }));

  // ── CTA clicks by label ──────────────────────────────────────────

  const ctaByLabel = {};
  for (const item of ctaClicks) {
    const label = item.data?.M?.label?.S ?? "unknown";
    ctaByLabel[label] = (ctaByLabel[label] ?? 0) + 1;
  }
  const ctaBreakdown = Object.entries(ctaByLabel)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);

  // ── Web Vitals — average per metric ─────────────────────────────

  const vitalAccum = {};
  for (const item of webVitals) {
    const metric = item.data?.M?.metric?.S;
    const value  = parseFloat(item.data?.M?.value?.S ?? "NaN");
    if (!metric || isNaN(value)) continue;
    if (!vitalAccum[metric]) vitalAccum[metric] = { sum: 0, count: 0 };
    vitalAccum[metric].sum   += value;
    vitalAccum[metric].count += 1;
  }
  const webVitalsAgg = Object.entries(vitalAccum).map(([metric, { sum, count }]) => ({
    metric,
    avg:   Math.round((sum / count) * 100) / 100,
    count,
  }));

  return response(200, {
    range:           rangeParam,
    totalPageViews:  pageViews.length,
    uniqueSessions,
    formSubmissions: formSubmits.length,
    totalCtaClicks:  ctaClicks.length,
    topPages,
    referrers,
    deviceBreakdown: deviceCounts,
    countryBreakdown,
    dailyTrend,
    ctaBreakdown,
    webVitals:       webVitalsAgg,
  }, origin);
}

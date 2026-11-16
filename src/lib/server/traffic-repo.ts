import "server-only";
import { createHmac } from "node:crypto";
import { getPool } from "./db";
import type { UserAgentInfo } from "./user-agent";
import type { TrafficPeriod } from "@/lib/traffic-period";

export type PageViewInput = UserAgentInfo & {
  path: string;
  referrerHost: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  country: string | null;
};

export type CountRow = { label: string; count: number };
export type DailyPoint = { day: string; visitors: number; pageviews: number };

export type TrafficSummary = {
  period: TrafficPeriod;
  visitors: number;
  pageviews: number;
  visitorsToday: number;
  signups: number;
  daily: DailyPoint[];
  topPages: CountRow[];
  referrers: CountRow[];
  sources: CountRow[];
  devices: CountRow[];
  browsers: CountRow[];
  countries: CountRow[];
};

const TOP_N = 8;

function getSalt(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not configured");
  return secret;
}

/** Anonymous per-day visitor id: the same person gets a new id each UTC day. */
export function visitorHash(
  ip: string,
  userAgent: string,
  now = new Date(),
): string {
  const day = now.toISOString().slice(0, 10);
  return createHmac("sha256", getSalt())
    .update(`visitor:${day}:${ip}:${userAgent}`)
    .digest("hex");
}

export async function recordPageView(
  input: PageViewInput,
  hash: string,
): Promise<void> {
  await getPool().query(
    `INSERT INTO page_views
       (path, referrer_host, utm_source, utm_medium, utm_campaign, device, browser, os, country, visitor_hash)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      input.path,
      input.referrerHost,
      input.utmSource,
      input.utmMedium,
      input.utmCampaign,
      input.device,
      input.browser,
      input.os,
      input.country,
      hash,
    ],
  );
}

// Visitor ids rotate daily, so "unique visitors" over a range = sum of daily uniques.
const VISITORS_SQL = `count(DISTINCT (visitor_hash, (created_at AT TIME ZONE 'UTC')::date))::int`;

/** Half-open UTC bounds [since, until) covering every day of the period. */
function bounds(period: TrafficPeriod): { since: string; until: string } {
  const until = new Date(`${period.to}T00:00:00Z`);
  until.setUTCDate(until.getUTCDate() + 1);
  return { since: `${period.from}T00:00:00Z`, until: until.toISOString() };
}

async function topBy(
  column: string,
  since: string,
  until: string,
  where = "",
): Promise<CountRow[]> {
  const result = await getPool().query(
    `SELECT ${column} AS label, ${VISITORS_SQL} AS count
     FROM page_views
     WHERE created_at >= $1 AND created_at < $2 ${where}
     GROUP BY 1 ORDER BY count DESC, label LIMIT ${TOP_N}`,
    [since, until],
  );
  return result.rows;
}

export async function getTrafficSummary(
  period: TrafficPeriod,
): Promise<TrafficSummary> {
  const pool = getPool();
  const { since, until } = bounds(period);

  const [
    totals,
    today,
    signups,
    daily,
    topPages,
    referrers,
    sources,
    devices,
    browsers,
    countries,
  ] = await Promise.all([
    pool.query(
      `SELECT ${VISITORS_SQL} AS visitors, count(*)::int AS pageviews FROM page_views
         WHERE created_at >= $1 AND created_at < $2`,
      [since, until],
    ),
    pool.query(
      `SELECT count(DISTINCT visitor_hash)::int AS visitors FROM page_views
         WHERE created_at >= date_trunc('day', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC'`,
    ),
    pool.query(
      `SELECT count(*)::int AS total FROM waitlist_signups WHERE created_at >= $1 AND created_at < $2`,
      [since, until],
    ),
    pool.query(
      `SELECT to_char(d.day, 'YYYY-MM-DD') AS day,
                coalesce(count(DISTINCT p.visitor_hash), 0)::int AS visitors,
                count(p.id)::int AS pageviews
         FROM generate_series($1::date, $2::date, interval '1 day') AS d(day)
         LEFT JOIN page_views p
           ON p.created_at >= $3 AND p.created_at < $4
          AND (p.created_at AT TIME ZONE 'UTC')::date = d.day::date
         GROUP BY d.day ORDER BY d.day`,
      [period.from, period.to, since, until],
    ),
    topBy("path", since, until),
    topBy("referrer_host", since, until, "AND referrer_host IS NOT NULL"),
    topBy("utm_source", since, until, "AND utm_source IS NOT NULL"),
    topBy("device", since, until),
    topBy("browser", since, until),
    topBy("country", since, until, "AND country IS NOT NULL"),
  ]);

  return {
    period,
    visitors: totals.rows[0].visitors,
    pageviews: totals.rows[0].pageviews,
    visitorsToday: today.rows[0].visitors,
    signups: signups.rows[0].total,
    daily: daily.rows,
    topPages,
    referrers,
    sources,
    devices,
    browsers,
    countries,
  };
}

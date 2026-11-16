import "server-only";
import { getPool } from "./db";

// ---------- In-memory limiter (high-volume, low-stakes: analytics beacons) ----------

type Window = { count: number; resetAt: number };
const windows = new Map<string, Window>();
const MAX_TRACKED_KEYS = 10_000;

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const current = windows.get(key);

  if (!current || current.resetAt <= now) {
    if (windows.size >= MAX_TRACKED_KEYS) windows.clear();
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (current.count >= limit) return false;
  windows.set(key, { ...current, count: current.count + 1 });
  return true;
}

// ---------- Persistent limiter (auth and forms) ----------

const CLEANUP_PROBABILITY = 0.01;

/**
 * Fixed-window limiter stored in Postgres, so limits survive restarts and are shared by every
 * instance. The single upsert is atomic, so concurrent requests can't slip past the limit.
 * Fails closed: if the database is unreachable the request is refused.
 */
export async function rateLimitPersistent(key: string, limit: number, windowMs: number): Promise<boolean> {
  try {
    const result = await getPool().query(
      `INSERT INTO auth_rate_limits (key, count, reset_at)
       VALUES ($1, 1, now() + ($2 || ' milliseconds')::interval)
       ON CONFLICT (key) DO UPDATE SET
         count    = CASE WHEN auth_rate_limits.reset_at <= now() THEN 1 ELSE auth_rate_limits.count + 1 END,
         reset_at = CASE WHEN auth_rate_limits.reset_at <= now() THEN EXCLUDED.reset_at ELSE auth_rate_limits.reset_at END
       RETURNING count`,
      [key, String(windowMs)],
    );
    if (Math.random() < CLEANUP_PROBABILITY) {
      getPool()
        .query(`DELETE FROM auth_rate_limits WHERE reset_at < now() - interval '1 day'`)
        .catch((error) => console.error("[rate-limit] cleanup failed", error));
    }
    return result.rows[0].count <= limit;
  } catch (error) {
    console.error("[rate-limit] persistent limiter unavailable", error);
    return false;
  }
}

/** Clears a limiter key, e.g. the per-account login counter after a successful sign-in. */
export async function resetRateLimit(key: string): Promise<void> {
  await getPool().query(`DELETE FROM auth_rate_limits WHERE key = $1`, [key]);
}

// ---------- Client IP ----------

/**
 * Number of reverse proxies in front of the app that append to X-Forwarded-For.
 * Railway's edge is 1. Add one for each extra layer (e.g. 2 behind Cloudflare → Railway).
 */
const TRUSTED_PROXY_HOPS = Math.max(1, Number.parseInt(process.env.TRUSTED_PROXY_HOPS ?? "1", 10) || 1);

/**
 * Client IP for rate limiting. Visitors can send their own X-Forwarded-For, so the leftmost
 * entries are attacker-controlled; only the entries appended by our own proxies (counted from
 * the right) can be trusted.
 */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const hops = forwarded.split(",").map((part) => part.trim()).filter(Boolean);
    const trusted = hops[Math.max(0, hops.length - TRUSTED_PROXY_HOPS)];
    if (trusted) return trusted;
  }
  return request.headers.get("x-real-ip") || "unknown";
}

export function clientUserAgent(request: Request): string {
  return (request.headers.get("user-agent") ?? "").slice(0, 512);
}

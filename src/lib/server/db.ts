import "server-only";
import { Pool, type PoolConfig } from "pg";

const globalForDb = globalThis as unknown as { pgPool?: Pool };

const PRIVATE_HOST = /(^localhost$|^127\.|\.railway\.internal$)/;
const SSL_MODES = ["disable", "require", "verify"] as const;
type SslMode = (typeof SSL_MODES)[number];

/**
 * DATABASE_SSL: "disable" | "require" (encrypt, don't verify) | "verify" (encrypt + verify cert,
 * optionally against DATABASE_CA_CERT). Defaults to "disable" for localhost and Railway's private
 * network, otherwise "require" — Railway's public proxy uses a self-signed certificate.
 * Keep in sync with scripts/lib/pg-config.mjs.
 */
export function sslConfig(connectionString: string): PoolConfig["ssl"] {
  const configured = process.env.DATABASE_SSL as SslMode | undefined;
  if (configured && !SSL_MODES.includes(configured)) {
    throw new Error(`DATABASE_SSL must be one of: ${SSL_MODES.join(", ")}`);
  }
  const mode = configured ?? (PRIVATE_HOST.test(new URL(connectionString).hostname) ? "disable" : "require");
  if (mode === "disable") return false;
  if (mode === "verify") {
    const ca = process.env.DATABASE_CA_CERT;
    return ca ? { ca, rejectUnauthorized: true } : { rejectUnauthorized: true };
  }
  return { rejectUnauthorized: false };
}

const POOL_MAX = 10;
const IDLE_TIMEOUT_MS = 5 * 60 * 1000;
const DEFAULT_CONNECT_TIMEOUT_MS = 20_000;

/** DATABASE_CONNECT_TIMEOUT_MS overrides how long to wait for a connection before giving up. */
function connectTimeoutMs(): number {
  const configured = Number(process.env.DATABASE_CONNECT_TIMEOUT_MS);
  return Number.isFinite(configured) && configured > 0 ? configured : DEFAULT_CONNECT_TIMEOUT_MS;
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured");
  }
  const pool = new Pool({
    connectionString,
    ssl: sslConfig(connectionString),
    max: POOL_MAX,
    // Opening a connection over Railway's public proxy costs ~2s from far away, so keep idle
    // connections around instead of reconnecting for every page.
    idleTimeoutMillis: IDLE_TIMEOUT_MS,
    keepAlive: true,
    // Covers both opening a connection and waiting for a free one in the pool.
    connectionTimeoutMillis: connectTimeoutMs(),
  });
  pool.on("error", (error) => console.error("[db] idle client error", error));
  return pool;
}

// Reuse one pool across hot reloads in dev and across requests in prod.
export function getPool(): Pool {
  if (!globalForDb.pgPool) {
    globalForDb.pgPool = createPool();
  }
  return globalForDb.pgPool;
}

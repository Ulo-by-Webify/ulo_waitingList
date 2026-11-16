// Shared Postgres connection config for CLI scripts. Mirrors src/lib/server/db-config.ts.
import { existsSync } from "node:fs";

export function loadLocalEnv() {
  if (existsSync(".env.local") && typeof process.loadEnvFile === "function") {
    process.loadEnvFile(".env.local");
  }
}

const PRIVATE_HOST = /(^localhost$|^127\.|\.railway\.internal$)/;

/**
 * DATABASE_SSL: "disable" | "require" (encrypt, don't verify) | "verify" (encrypt + verify cert).
 * Default: off for localhost / Railway private network, "require" for anything else (e.g. the public proxy,
 * which presents a self-signed certificate).
 */
export function sslConfig(connectionString, mode = process.env.DATABASE_SSL) {
  const host = new URL(connectionString).hostname;
  const resolved = mode || (PRIVATE_HOST.test(host) ? "disable" : "require");
  if (resolved === "disable") return false;
  if (resolved === "verify") {
    return process.env.DATABASE_CA_CERT ? { ca: process.env.DATABASE_CA_CERT, rejectUnauthorized: true } : { rejectUnauthorized: true };
  }
  return { rejectUnauthorized: false };
}

/** Scripts (migrations, seeding, admin creation) prefer an owner-level MIGRATION_DATABASE_URL when set. */
export function pgConfig() {
  const connectionString = process.env.MIGRATION_DATABASE_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL (or MIGRATION_DATABASE_URL) is not set.");
    process.exit(1);
  }
  return { connectionString, ssl: sslConfig(connectionString) };
}

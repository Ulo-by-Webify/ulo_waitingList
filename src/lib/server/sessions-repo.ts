import "server-only";
import { getPool } from "./db";
import { PENDING_MFA_TTL_SECONDS, SESSION_TTL_SECONDS } from "@/lib/auth/session";

export type SessionRow = {
  id: string;
  adminId: string;
  pendingMfa: boolean;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
  lastSeenAt: string;
  expiresAt: string;
};

/** Avoid a write on every request: only refresh last_seen_at this often. */
const TOUCH_INTERVAL_SECONDS = 5 * 60;

function toSession(row: Record<string, unknown>): SessionRow {
  return {
    id: row.id as string,
    adminId: row.admin_id as string,
    pendingMfa: row.pending_mfa as boolean,
    ip: (row.ip as string | null) ?? null,
    userAgent: (row.user_agent as string | null) ?? null,
    createdAt: (row.created_at as Date).toISOString(),
    lastSeenAt: (row.last_seen_at as Date).toISOString(),
    expiresAt: (row.expires_at as Date).toISOString(),
  };
}

const ACTIVE = `revoked_at IS NULL AND expires_at > now()`;

export async function createSession(
  adminId: string,
  options: { pendingMfa: boolean; ip: string; userAgent: string },
): Promise<SessionRow> {
  const ttl = options.pendingMfa ? PENDING_MFA_TTL_SECONDS : SESSION_TTL_SECONDS;
  const result = await getPool().query(
    `INSERT INTO admin_sessions (admin_id, pending_mfa, ip, user_agent, expires_at)
     VALUES ($1, $2, $3, $4, now() + ($5 || ' seconds')::interval) RETURNING *`,
    [adminId, options.pendingMfa, options.ip.slice(0, 64), options.userAgent.slice(0, 512), String(ttl)],
  );
  return toSession(result.rows[0]);
}

export async function getActiveSession(id: string): Promise<SessionRow | null> {
  const result = await getPool().query(`SELECT * FROM admin_sessions WHERE id = $1 AND ${ACTIVE}`, [id]);
  return result.rows[0] ? toSession(result.rows[0]) : null;
}

export async function touchSession(session: SessionRow): Promise<void> {
  if (Date.now() - new Date(session.lastSeenAt).getTime() < TOUCH_INTERVAL_SECONDS * 1000) return;
  await getPool().query(`UPDATE admin_sessions SET last_seen_at = now() WHERE id = $1`, [session.id]);
}

/** Upgrades a pending-2FA session into a full session with a fresh 12-hour lifetime. */
export async function completeMfa(id: string): Promise<SessionRow | null> {
  const result = await getPool().query(
    `UPDATE admin_sessions
     SET pending_mfa = false, last_seen_at = now(), expires_at = now() + ($2 || ' seconds')::interval
     WHERE id = $1 AND pending_mfa AND ${ACTIVE} RETURNING *`,
    [id, String(SESSION_TTL_SECONDS)],
  );
  return result.rows[0] ? toSession(result.rows[0]) : null;
}

export async function listActiveSessions(adminId: string): Promise<SessionRow[]> {
  const result = await getPool().query(
    `SELECT * FROM admin_sessions WHERE admin_id = $1 AND NOT pending_mfa AND ${ACTIVE}
     ORDER BY last_seen_at DESC`,
    [adminId],
  );
  return result.rows.map(toSession);
}

export async function revokeSession(adminId: string, sessionId: string): Promise<boolean> {
  const result = await getPool().query(
    `UPDATE admin_sessions SET revoked_at = now() WHERE id = $1 AND admin_id = $2 AND revoked_at IS NULL`,
    [sessionId, adminId],
  );
  return result.rowCount === 1;
}

/** Revokes every session for the admin, optionally keeping one (the caller's own). Returns the count. */
export async function revokeAllSessions(adminId: string, exceptSessionId?: string): Promise<number> {
  const result = await getPool().query(
    `UPDATE admin_sessions SET revoked_at = now()
     WHERE admin_id = $1 AND revoked_at IS NULL AND ($2::uuid IS NULL OR id <> $2::uuid)`,
    [adminId, exceptSessionId ?? null],
  );
  return result.rowCount ?? 0;
}

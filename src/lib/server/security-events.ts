import "server-only";
import { getPool } from "./db";

export const SECURITY_EVENT_LABELS = {
  login_success: "Signed in",
  login_failed: "Failed sign-in attempt",
  mfa_failed: "Wrong 2FA code",
  account_locked: "Account locked after repeated failures",
  account_unlocked: "Account unlocked",
  logout: "Signed out",
  password_changed: "Password changed",
  password_reset_requested: "Password reset requested",
  password_reset: "Password reset via email link",
  mfa_enabled: "Two-factor authentication turned on",
  mfa_disabled: "Two-factor authentication turned off",
  recovery_code_used: "Signed in with a recovery code",
  recovery_codes_regenerated: "Recovery codes regenerated",
  session_revoked: "Session signed out remotely",
  sessions_revoked: "All other sessions signed out",
  profile_updated: "Profile updated",
  admin_invited: "Team member invited",
  invite_accepted: "Invitation accepted",
  role_changed: "Role changed",
  admin_removed: "Team member removed",
} as const;

export type SecurityEvent = keyof typeof SECURITY_EVENT_LABELS;

export type SecurityEventContext = {
  adminId?: string | null;
  actorId?: string | null;
  email?: string | null;
  detail?: string | null;
  ip?: string | null;
  userAgent?: string | null;
};

/** Best-effort audit logging: a logging failure never blocks the action being logged. */
export async function recordSecurityEvent(event: SecurityEvent, context: SecurityEventContext): Promise<void> {
  try {
    await getPool().query(
      `INSERT INTO security_events (event, admin_id, actor_id, email, detail, ip, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        event,
        context.adminId ?? null,
        context.actorId ?? null,
        context.email?.slice(0, 254) ?? null,
        context.detail?.slice(0, 500) ?? null,
        context.ip?.slice(0, 64) ?? null,
        context.userAgent?.slice(0, 512) ?? null,
      ],
    );
  } catch (error) {
    console.error(`[security-events] failed to record ${event}`, error);
  }
}

export type SecurityEventRow = {
  id: string;
  event: SecurityEvent;
  label: string;
  detail: string | null;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
};

export async function listSecurityEvents(adminId: string, limit = 20): Promise<SecurityEventRow[]> {
  const result = await getPool().query(
    `SELECT id, event, detail, ip, user_agent, created_at FROM security_events
     WHERE admin_id = $1 ORDER BY created_at DESC LIMIT $2`,
    [adminId, limit],
  );
  return result.rows.map((r) => ({
    id: r.id,
    event: r.event,
    label: SECURITY_EVENT_LABELS[r.event as SecurityEvent] ?? r.event,
    detail: r.detail,
    ip: r.ip,
    userAgent: r.user_agent,
    createdAt: r.created_at.toISOString(),
  }));
}

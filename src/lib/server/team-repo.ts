import "server-only";
import { getPool } from "./db";
import { randomToken } from "./crypto";
import { hashPassword } from "./passwords";
import { ADMIN_COLUMNS, toAdmin, type AdminUser } from "./admin-repo";
import type { Role } from "@/lib/permissions";

export type TeamMember = AdminUser & { pendingInvite: boolean; activeSessions: number };

export async function listTeam(): Promise<TeamMember[]> {
  const result = await getPool().query(
    `SELECT ${ADMIN_COLUMNS.split(", ").map((c) => `a.${c}`).join(", ")},
            EXISTS (SELECT 1 FROM admin_tokens t WHERE t.admin_id = a.id AND t.purpose = 'invite'
                    AND t.used_at IS NULL AND t.expires_at > now()) AS pending_invite,
            (SELECT count(*)::int FROM admin_sessions s WHERE s.admin_id = a.id AND NOT s.pending_mfa
                    AND s.revoked_at IS NULL AND s.expires_at > now()) AS active_sessions
     FROM admin_users a
     ORDER BY CASE a.role WHEN 'owner' THEN 0 WHEN 'admin' THEN 1 ELSE 2 END, lower(a.email)`,
  );
  return result.rows.map((r) => ({ ...toAdmin(r), pendingInvite: r.pending_invite, activeSessions: r.active_sessions }));
}

export type InviteResult = { admin: AdminUser } | { error: "email-taken" };

/**
 * Creates the account with an unguessable random password nobody knows; the invitee sets
 * their own through the emailed (or copied) invite link.
 */
export async function createInvitedAdmin(email: string, role: Role, fullName: string | null): Promise<InviteResult> {
  try {
    const result = await getPool().query(
      `INSERT INTO admin_users (email, full_name, role, password_hash) VALUES ($1, $2, $3, $4) RETURNING ${ADMIN_COLUMNS}`,
      [email, fullName, role, await hashPassword(randomToken(32))],
    );
    return { admin: toAdmin(result.rows[0]) };
  } catch (error) {
    if ((error as { code?: string }).code === "23505") return { error: "email-taken" };
    throw error;
  }
}

async function ownerCount(): Promise<number> {
  const result = await getPool().query(`SELECT count(*)::int AS n FROM admin_users WHERE role = 'owner'`);
  return result.rows[0].n;
}

export type TeamChangeResult = { admin: AdminUser } | { error: "not-found" | "last-owner" | "self" };

export async function changeRole(actorId: string, adminId: string, role: Role): Promise<TeamChangeResult> {
  if (actorId === adminId) return { error: "self" };
  const target = await getPool().query(`SELECT role FROM admin_users WHERE id = $1`, [adminId]);
  if (!target.rows[0]) return { error: "not-found" };
  if (target.rows[0].role === "owner" && role !== "owner" && (await ownerCount()) <= 1) return { error: "last-owner" };
  const result = await getPool().query(`UPDATE admin_users SET role = $2 WHERE id = $1 RETURNING ${ADMIN_COLUMNS}`, [adminId, role]);
  return { admin: toAdmin(result.rows[0]) };
}

export async function removeAdmin(actorId: string, adminId: string): Promise<TeamChangeResult> {
  if (actorId === adminId) return { error: "self" };
  const target = await getPool().query(`SELECT ${ADMIN_COLUMNS} FROM admin_users WHERE id = $1`, [adminId]);
  if (!target.rows[0]) return { error: "not-found" };
  if (target.rows[0].role === "owner" && (await ownerCount()) <= 1) return { error: "last-owner" };
  // Sessions, tokens and recovery codes cascade; audit events keep their history (admin_id set NULL).
  await getPool().query(`DELETE FROM admin_users WHERE id = $1`, [adminId]);
  return { admin: toAdmin(target.rows[0]) };
}

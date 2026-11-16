import "server-only";
import { getPool } from "./db";
import { burnPasswordCheck, hashPassword, verifyPassword } from "./passwords";
import { isRole, type Role } from "@/lib/permissions";

export type AdminUser = {
  id: string;
  email: string;
  fullName: string | null;
  role: Role;
  mfaEnabled: boolean;
  lockedUntil: string | null;
  createdAt: string;
  lastLoginAt: string | null;
  passwordChangedAt: string | null;
};

export const ADMIN_COLUMNS = `id, email, full_name, role, totp_enabled_at, locked_until, created_at, last_login_at, password_changed_at`;

/** Failed password or 2FA attempts before the account is locked. */
export const MAX_FAILED_ATTEMPTS = 10;
export const LOCKOUT_MINUTES = 15;

export function toAdmin(row: Record<string, unknown>): AdminUser {
  const iso = (v: unknown) => (v instanceof Date ? v.toISOString() : null);
  const lockedUntil = iso(row.locked_until);
  return {
    id: String(row.id),
    email: row.email as string,
    fullName: (row.full_name as string | null) ?? null,
    role: isRole(row.role) ? row.role : "editor",
    mfaEnabled: row.totp_enabled_at instanceof Date,
    lockedUntil: lockedUntil && new Date(lockedUntil) > new Date() ? lockedUntil : null,
    createdAt: iso(row.created_at) as string,
    lastLoginAt: iso(row.last_login_at),
    passwordChangedAt: iso(row.password_changed_at),
  };
}

export async function getAdminById(id: string): Promise<AdminUser | null> {
  const result = await getPool().query(`SELECT ${ADMIN_COLUMNS} FROM admin_users WHERE id = $1`, [id]);
  return result.rows[0] ? toAdmin(result.rows[0]) : null;
}

// ---------- Sign-in & lockout ----------

export type PasswordCheck =
  | { status: "ok"; admin: AdminUser }
  | { status: "invalid"; admin: AdminUser | null; justLocked: boolean }
  | { status: "locked"; admin: AdminUser };

/**
 * Verifies email + password. Locked accounts are refused without checking the password, and
 * unknown emails still run a dummy hash so timing doesn't reveal which accounts exist.
 */
export async function checkPassword(email: string, password: string): Promise<PasswordCheck> {
  const result = await getPool().query(
    `SELECT ${ADMIN_COLUMNS}, password_hash FROM admin_users WHERE lower(email) = lower($1)`,
    [email],
  );
  const row = result.rows[0];
  if (!row) {
    await burnPasswordCheck(password);
    return { status: "invalid", admin: null, justLocked: false };
  }
  const admin = toAdmin(row);
  if (admin.lockedUntil) {
    await burnPasswordCheck(password);
    return { status: "locked", admin };
  }
  if (!(await verifyPassword(password, row.password_hash))) {
    const justLocked = await registerFailedAttempt(admin.id);
    return { status: "invalid", admin, justLocked };
  }
  return { status: "ok", admin };
}

/** Counts a failed password/2FA attempt. Returns true if this attempt locked the account. */
export async function registerFailedAttempt(adminId: string): Promise<boolean> {
  const result = await getPool().query(
    `UPDATE admin_users SET
       failed_login_count = CASE WHEN failed_login_count + 1 >= $2 THEN 0 ELSE failed_login_count + 1 END,
       locked_until = CASE WHEN failed_login_count + 1 >= $2 THEN now() + ($3 || ' minutes')::interval ELSE locked_until END
     WHERE id = $1
     RETURNING locked_until > now() AS locked`,
    [adminId, MAX_FAILED_ATTEMPTS, String(LOCKOUT_MINUTES)],
  );
  return Boolean(result.rows[0]?.locked);
}

export async function recordSuccessfulLogin(adminId: string): Promise<void> {
  await getPool().query(
    `UPDATE admin_users SET failed_login_count = 0, locked_until = NULL, last_login_at = now() WHERE id = $1`,
    [adminId],
  );
}

export async function unlockAdmin(adminId: string): Promise<void> {
  await getPool().query(`UPDATE admin_users SET failed_login_count = 0, locked_until = NULL WHERE id = $1`, [adminId]);
}

// ---------- Password & profile ----------

export async function passwordMatches(id: string, password: string): Promise<boolean> {
  const result = await getPool().query(`SELECT password_hash FROM admin_users WHERE id = $1`, [id]);
  return Boolean(result.rows[0]) && verifyPassword(password, result.rows[0].password_hash);
}

/** Sets a new password and clears any lockout. Callers decide which sessions to revoke. */
export async function setPassword(id: string, newPassword: string): Promise<void> {
  await getPool().query(
    `UPDATE admin_users
     SET password_hash = $2, password_changed_at = now(), failed_login_count = 0, locked_until = NULL
     WHERE id = $1`,
    [id, await hashPassword(newPassword)],
  );
}

export type ProfileUpdateResult =
  | { ok: true; admin: AdminUser }
  | { ok: false; reason: "wrong-password" | "email-taken" | "not-found" };

export async function updateProfile(
  id: string,
  input: { fullName: string | null; email: string; currentPassword?: string },
): Promise<ProfileUpdateResult> {
  const current = await getAdminById(id);
  if (!current) return { ok: false, reason: "not-found" };

  const emailChanged = current.email.toLowerCase() !== input.email.toLowerCase();
  if (emailChanged && !(input.currentPassword && (await passwordMatches(id, input.currentPassword)))) {
    return { ok: false, reason: "wrong-password" };
  }

  try {
    const result = await getPool().query(
      `UPDATE admin_users SET full_name = $2, email = $3 WHERE id = $1 RETURNING ${ADMIN_COLUMNS}`,
      [id, input.fullName, input.email],
    );
    return { ok: true, admin: toAdmin(result.rows[0]) };
  } catch (error) {
    if ((error as { code?: string }).code === "23505") return { ok: false, reason: "email-taken" };
    throw error;
  }
}

import "server-only";
import { getPool } from "./db";
import {
  decrypt,
  encrypt,
  generateRecoveryCode,
  generateTotpSecret,
  normalizeRecoveryCode,
  sha256,
  totpAuthUri,
  verifyTotp,
} from "./crypto";

export const RECOVERY_CODE_COUNT = 10;

/** Starts (or restarts) enrollment: stores a pending secret until the user proves they scanned it. */
export async function startEnrollment(adminId: string, email: string): Promise<{ secret: string; uri: string }> {
  const secret = generateTotpSecret();
  await getPool().query(`UPDATE admin_users SET totp_pending_secret_enc = $2 WHERE id = $1`, [adminId, encrypt(secret)]);
  return { secret, uri: totpAuthUri(secret, email) };
}

async function replaceRecoveryCodes(adminId: string): Promise<string[]> {
  const codes = Array.from({ length: RECOVERY_CODE_COUNT }, generateRecoveryCode);
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    await client.query(`DELETE FROM admin_recovery_codes WHERE admin_id = $1`, [adminId]);
    for (const code of codes) {
      await client.query(`INSERT INTO admin_recovery_codes (admin_id, code_hash) VALUES ($1, $2)`, [
        adminId,
        sha256(normalizeRecoveryCode(code)),
      ]);
    }
    await client.query("COMMIT");
    return codes;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/** Confirms enrollment with a code from the app. Returns fresh recovery codes, or null if the code is wrong. */
export async function confirmEnrollment(adminId: string, code: string): Promise<string[] | null> {
  const result = await getPool().query(`SELECT totp_pending_secret_enc FROM admin_users WHERE id = $1`, [adminId]);
  const pending = result.rows[0]?.totp_pending_secret_enc as string | null;
  if (!pending) return null;
  const step = verifyTotp(decrypt(pending), code);
  if (step === null) return null;

  await getPool().query(
    `UPDATE admin_users
     SET totp_secret_enc = totp_pending_secret_enc, totp_pending_secret_enc = NULL,
         totp_enabled_at = now(), totp_last_step = $2
     WHERE id = $1`,
    [adminId, step],
  );
  return replaceRecoveryCodes(adminId);
}

export async function disableMfa(adminId: string): Promise<void> {
  await getPool().query(
    `UPDATE admin_users
     SET totp_secret_enc = NULL, totp_pending_secret_enc = NULL, totp_enabled_at = NULL, totp_last_step = NULL
     WHERE id = $1`,
    [adminId],
  );
  await getPool().query(`DELETE FROM admin_recovery_codes WHERE admin_id = $1`, [adminId]);
}

export async function regenerateRecoveryCodes(adminId: string): Promise<string[]> {
  return replaceRecoveryCodes(adminId);
}

export async function remainingRecoveryCodes(adminId: string): Promise<number> {
  const result = await getPool().query(
    `SELECT count(*)::int AS n FROM admin_recovery_codes WHERE admin_id = $1 AND used_at IS NULL`,
    [adminId],
  );
  return result.rows[0].n;
}

export type MfaCheck = { ok: false } | { ok: true; method: "totp" | "recovery" };

/**
 * Accepts a 6-digit authenticator code or a recovery code. Authenticator codes can't be replayed
 * (the matched time step must be newer than the last one used); recovery codes are single-use.
 * Both checks are atomic UPDATEs, so two concurrent requests can't both succeed with one code.
 */
export async function verifyMfaCode(adminId: string, input: string): Promise<MfaCheck> {
  const code = input.trim().replace(/\s+/g, "");

  if (/^\d{6}$/.test(code)) {
    const result = await getPool().query(`SELECT totp_secret_enc FROM admin_users WHERE id = $1`, [adminId]);
    const encrypted = result.rows[0]?.totp_secret_enc as string | null;
    if (!encrypted) return { ok: false };
    const step = verifyTotp(decrypt(encrypted), code);
    if (step === null) return { ok: false };
    const claimed = await getPool().query(
      `UPDATE admin_users SET totp_last_step = $2
       WHERE id = $1 AND (totp_last_step IS NULL OR totp_last_step < $2) RETURNING id`,
      [adminId, step],
    );
    return claimed.rowCount === 1 ? { ok: true, method: "totp" } : { ok: false };
  }

  const normalized = normalizeRecoveryCode(code);
  if (normalized.length !== 10) return { ok: false };
  const used = await getPool().query(
    `UPDATE admin_recovery_codes SET used_at = now()
     WHERE admin_id = $1 AND code_hash = $2 AND used_at IS NULL RETURNING id`,
    [adminId, sha256(normalized)],
  );
  return used.rowCount === 1 ? { ok: true, method: "recovery" } : { ok: false };
}

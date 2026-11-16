import "server-only";
import { getPool } from "./db";
import { randomToken, sha256 } from "./crypto";

export type TokenPurpose = "reset" | "invite";

export const TOKEN_TTL_MINUTES: Record<TokenPurpose, number> = {
  reset: 30,
  invite: 60 * 24 * 7, // 7 days
};

/**
 * Issues a single-use link token. Any earlier unused token of the same purpose for this admin
 * is invalidated, so only the newest emailed link works. Only the SHA-256 is stored.
 */
export async function issueToken(adminId: string, purpose: TokenPurpose): Promise<string> {
  const token = randomToken(32);
  await getPool().query(
    `UPDATE admin_tokens SET used_at = now() WHERE admin_id = $1 AND purpose = $2 AND used_at IS NULL`,
    [adminId, purpose],
  );
  await getPool().query(
    `INSERT INTO admin_tokens (admin_id, purpose, token_hash, expires_at)
     VALUES ($1, $2, $3, now() + ($4 || ' minutes')::interval)`,
    [adminId, purpose, sha256(token), String(TOKEN_TTL_MINUTES[purpose])],
  );
  return token;
}

/** Checks a token without using it up (to render the reset/invite page). */
export async function peekToken(token: string, purpose: TokenPurpose): Promise<{ adminId: string; email: string } | null> {
  if (!/^[A-Za-z0-9_-]{20,100}$/.test(token)) return null;
  const result = await getPool().query(
    `SELECT t.admin_id, a.email FROM admin_tokens t JOIN admin_users a ON a.id = t.admin_id
     WHERE t.token_hash = $1 AND t.purpose = $2 AND t.used_at IS NULL AND t.expires_at > now()`,
    [sha256(token), purpose],
  );
  return result.rows[0] ? { adminId: result.rows[0].admin_id, email: result.rows[0].email } : null;
}

/** Atomically marks the token used. Returns the admin id, or null if invalid, expired or already used. */
export async function consumeToken(token: string, purpose: TokenPurpose): Promise<string | null> {
  if (!/^[A-Za-z0-9_-]{20,100}$/.test(token)) return null;
  const result = await getPool().query(
    `UPDATE admin_tokens SET used_at = now()
     WHERE token_hash = $1 AND purpose = $2 AND used_at IS NULL AND expires_at > now()
     RETURNING admin_id`,
    [sha256(token), purpose],
  );
  return result.rows[0]?.admin_id ?? null;
}

// Signed admin session cookie. Uses Web Crypto so it runs in both the Edge middleware and
// Node route handlers. Token format: sessionUuid.expiresAt.hmacHex
// The middleware only checks the signature and expiry; pages and APIs also load the session row
// from admin_sessions, so revoked sessions stop working immediately.

import { isUuid } from "@/lib/ids";

export const SESSION_COOKIE = "ulo_admin_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours
/** How long a password-verified login may wait for its 2FA code. */
export const PENDING_MFA_TTL_SECONDS = 60 * 5;

export type SessionToken = { sessionId: string; expiresAt: number };

const encoder = new TextEncoder();

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET must be set (32+ chars)");
  }
  return secret;
}

async function hmacHex(message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

const payload = (sessionId: string, expiresAt: number) => `session:${sessionId}:${expiresAt}`;

export async function createSessionToken(sessionId: string, expiresAt: Date): Promise<string> {
  const exp = Math.floor(expiresAt.getTime() / 1000);
  return `${sessionId}.${exp}.${await hmacHex(payload(sessionId, exp))}`;
}

export async function readSessionToken(token: string | undefined, now = Date.now()): Promise<SessionToken | null> {
  if (!token) return null;
  const [sessionId, expiresRaw, signature] = token.split(".");
  const expiresAt = Number(expiresRaw);
  if (!isUuid(sessionId) || !Number.isFinite(expiresAt) || !signature) return null;
  if (expiresAt * 1000 < now) return null;
  try {
    const expected = await hmacHex(payload(sessionId, expiresAt));
    return timingSafeEqual(signature, expected) ? { sessionId, expiresAt } : null;
  } catch (error) {
    console.error("[auth] session verification failed", error);
    return null;
  }
}

import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextResponse } from "next/server";
import { SESSION_COOKIE, createSessionToken, readSessionToken } from "@/lib/auth/session";
import { can, homeFor, type Permission } from "@/lib/permissions";
import { getAdminById, type AdminUser } from "./admin-repo";
import { getActiveSession, touchSession, type SessionRow } from "./sessions-repo";
import { fail, unauthorized } from "./http";

export type AdminContext = { admin: AdminUser; session: SessionRow };

/**
 * Resolves the signed-in admin. Beyond the signature check the middleware does, this requires a
 * live (not revoked/expired) session row that has completed 2FA, for an account that still exists.
 */
export async function getAdminContext(): Promise<AdminContext | null> {
  const token = await readSessionToken(cookies().get(SESSION_COOKIE)?.value);
  if (!token) return null;
  const session = await getActiveSession(token.sessionId);
  if (!session || session.pendingMfa) return null;
  const admin = await getAdminById(session.adminId);
  if (!admin) return null;
  touchSession(session).catch((error) => console.error("[auth] failed to touch session", error));
  return { admin, session };
}

/** A login that passed the password step and is waiting for its 2FA code. */
export async function getPendingMfaSession(): Promise<SessionRow | null> {
  const token = await readSessionToken(cookies().get(SESSION_COOKIE)?.value);
  if (!token) return null;
  const session = await getActiveSession(token.sessionId);
  return session?.pendingMfa ? session : null;
}

/** For admin pages: redirects to login without a session, or to the role's home without permission. */
export async function requireAdmin(permission?: Permission): Promise<AdminContext> {
  const context = await getAdminContext();
  if (!context) redirect("/admin/login");
  if (permission && !can(context.admin.role, permission)) redirect(homeFor(context.admin.role));
  return context;
}

/** For admin API routes: returns the context, or a 401/403 response to send back. */
export async function requireApi(permission?: Permission): Promise<AdminContext | Response> {
  const context = await getAdminContext();
  if (!context) return unauthorized();
  if (permission && !can(context.admin.role, permission)) return fail("You don't have permission to do that", 403);
  return context;
}

export function isResponse(value: unknown): value is Response {
  return value instanceof Response;
}

const cookieOptions = (maxAgeSeconds: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: maxAgeSeconds,
});

export async function setSessionCookie(response: NextResponse, session: SessionRow): Promise<void> {
  const expiresAt = new Date(session.expiresAt);
  const maxAge = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
  response.cookies.set(SESSION_COOKIE, await createSessionToken(session.id, expiresAt), cookieOptions(maxAge));
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE, "", cookieOptions(0));
}

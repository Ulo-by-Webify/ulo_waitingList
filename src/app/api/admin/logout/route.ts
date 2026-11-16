import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, readSessionToken } from "@/lib/auth/session";
import { clearSessionCookie } from "@/lib/server/admin-guard";
import { requestMeta } from "@/lib/server/auth-flow";
import { recordSecurityEvent } from "@/lib/server/security-events";
import { getActiveSession, revokeSession } from "@/lib/server/sessions-repo";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const response = NextResponse.json({ success: true, data: null, error: null });
  clearSessionCookie(response);
  try {
    // Revoke server-side too, so a copied cookie stops working immediately.
    const token = await readSessionToken(cookies().get(SESSION_COOKIE)?.value);
    const session = token ? await getActiveSession(token.sessionId) : null;
    if (session) {
      await revokeSession(session.adminId, session.id);
      await recordSecurityEvent("logout", { adminId: session.adminId, ...requestMeta(request) });
    }
  } catch (error) {
    console.error("[admin-logout] failed to revoke session", error);
  }
  return response;
}

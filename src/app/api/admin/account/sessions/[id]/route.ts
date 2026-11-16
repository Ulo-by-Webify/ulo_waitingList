import { isUuid } from "@/lib/ids";
import { isResponse, requireApi } from "@/lib/server/admin-guard";
import { requestMeta } from "@/lib/server/auth-flow";
import { recordSecurityEvent } from "@/lib/server/security-events";
import { revokeSession } from "@/lib/server/sessions-repo";
import { fail, ok, serverError } from "@/lib/server/http";

export const runtime = "nodejs";

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireApi();
  if (isResponse(auth)) return auth;
  if (!isUuid(params.id)) return fail("Invalid id", 400);
  if (params.id === auth.session.id) return fail("Use Log out to end this session", 400);
  try {
    // Scoped to the caller's admin id, so one admin can't revoke another's sessions here.
    if (!(await revokeSession(auth.admin.id, params.id))) return fail("Session not found", 404);
    await recordSecurityEvent("session_revoked", { adminId: auth.admin.id, detail: params.id, ...requestMeta(request) });
    return ok({ id: params.id });
  } catch (error) {
    return serverError("session-revoke", error);
  }
}

import { isResponse, requireApi } from "@/lib/server/admin-guard";
import { requestMeta } from "@/lib/server/auth-flow";
import { recordSecurityEvent } from "@/lib/server/security-events";
import { revokeAllSessions } from "@/lib/server/sessions-repo";
import { ok, serverError } from "@/lib/server/http";

export const runtime = "nodejs";

/** Signs out every other session, keeping this one. */
export async function DELETE(request: Request) {
  const auth = await requireApi();
  if (isResponse(auth)) return auth;
  try {
    const revoked = await revokeAllSessions(auth.admin.id, auth.session.id);
    await recordSecurityEvent("sessions_revoked", { adminId: auth.admin.id, detail: `${revoked} sessions`, ...requestMeta(request) });
    return ok({ revoked });
  } catch (error) {
    return serverError("sessions-revoke-all", error);
  }
}

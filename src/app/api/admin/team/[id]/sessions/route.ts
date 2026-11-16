import { isUuid } from "@/lib/ids";
import { getAdminById } from "@/lib/server/admin-repo";
import { isResponse, requireApi } from "@/lib/server/admin-guard";
import { requestMeta } from "@/lib/server/auth-flow";
import { recordSecurityEvent } from "@/lib/server/security-events";
import { revokeAllSessions } from "@/lib/server/sessions-repo";
import { fail, ok, serverError } from "@/lib/server/http";

export const runtime = "nodejs";

/** Owner action: sign a team member out everywhere (e.g. a lost laptop). */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireApi("team");
  if (isResponse(auth)) return auth;
  if (!isUuid(params.id)) return fail("Invalid id", 400);
  if (params.id === auth.admin.id) return fail("Use Account → Security to manage your own sessions", 400);
  try {
    const target = await getAdminById(params.id);
    if (!target) return fail("Team member not found", 404);
    const revoked = await revokeAllSessions(target.id);
    await recordSecurityEvent("sessions_revoked", { adminId: target.id, actorId: auth.admin.id, detail: `${revoked} sessions, by ${auth.admin.email}`, ...requestMeta(request) });
    return ok({ revoked });
  } catch (error) {
    return serverError("team-sessions", error);
  }
}

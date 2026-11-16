import { isUuid } from "@/lib/ids";
import { getAdminById, unlockAdmin } from "@/lib/server/admin-repo";
import { isResponse, requireApi } from "@/lib/server/admin-guard";
import { requestMeta } from "@/lib/server/auth-flow";
import { resetRateLimit } from "@/lib/server/rate-limit";
import { recordSecurityEvent } from "@/lib/server/security-events";
import { fail, ok, serverError } from "@/lib/server/http";

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireApi("team");
  if (isResponse(auth)) return auth;
  if (!isUuid(params.id)) return fail("Invalid id", 400);
  try {
    const target = await getAdminById(params.id);
    if (!target) return fail("Team member not found", 404);
    await unlockAdmin(target.id);
    await resetRateLimit(`login-email:${target.email.toLowerCase()}`);
    await recordSecurityEvent("account_unlocked", { adminId: target.id, actorId: auth.admin.id, email: target.email, detail: `by ${auth.admin.email}`, ...requestMeta(request) });
    return ok({ id: target.id });
  } catch (error) {
    return serverError("team-unlock", error);
  }
}

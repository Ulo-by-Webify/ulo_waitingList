import { isUuid } from "@/lib/ids";
import { getAdminById } from "@/lib/server/admin-repo";
import { isResponse, requireApi } from "@/lib/server/admin-guard";
import { issueSetupLink, requestMeta } from "@/lib/server/auth-flow";
import { recordSecurityEvent } from "@/lib/server/security-events";
import { fail, ok, serverError } from "@/lib/server/http";

export const runtime = "nodejs";

/**
 * Owner action: send a fresh setup link. Members who have never signed in get a new invite;
 * everyone else gets a password reset link. Without SMTP the link is returned to copy.
 */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireApi("team");
  if (isResponse(auth)) return auth;
  if (!isUuid(params.id)) return fail("Invalid id", 400);
  if (params.id === auth.admin.id) return fail("Use Forgot password or Account → Security for your own account", 400);
  try {
    const target = await getAdminById(params.id);
    if (!target) return fail("Team member not found", 404);
    const purpose = target.lastLoginAt ? "reset" : "invite";
    const link = await issueSetupLink(target, purpose, auth.admin.fullName || auth.admin.email);
    await recordSecurityEvent(purpose === "invite" ? "admin_invited" : "password_reset_requested", {
      adminId: target.id,
      actorId: auth.admin.id,
      email: target.email,
      detail: `link issued by ${auth.admin.email}`,
      ...requestMeta(request),
    });
    return ok({ purpose, emailed: link.emailed, url: link.emailed ? null : link.url, expiresInMinutes: link.expiresInMinutes });
  } catch (error) {
    return serverError("team-link", error);
  }
}

import { inviteSchema } from "@/lib/validation";
import { isResponse, requireApi } from "@/lib/server/admin-guard";
import { issueSetupLink, requestMeta } from "@/lib/server/auth-flow";
import { recordSecurityEvent } from "@/lib/server/security-events";
import { createInvitedAdmin, listTeam } from "@/lib/server/team-repo";
import { fail, ok, readJson, serverError, validationError } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireApi("team");
  if (isResponse(auth)) return auth;
  try {
    return ok(await listTeam());
  } catch (error) {
    return serverError("team-list", error);
  }
}

export async function POST(request: Request) {
  const auth = await requireApi("team");
  if (isResponse(auth)) return auth;
  const parsed = inviteSchema.safeParse(await readJson(request));
  if (!parsed.success) return validationError(parsed.error);

  try {
    const created = await createInvitedAdmin(parsed.data.email, parsed.data.role, parsed.data.fullName ?? null);
    if ("error" in created) return fail("Someone on the team already uses that email", 409);
    const inviter = auth.admin.fullName || auth.admin.email;
    const link = await issueSetupLink(created.admin, "invite", inviter);
    await recordSecurityEvent("admin_invited", {
      adminId: created.admin.id,
      actorId: auth.admin.id,
      email: created.admin.email,
      detail: `role ${created.admin.role} by ${auth.admin.email}`,
      ...requestMeta(request),
    });
    // Only hand the link back when it couldn't be emailed; it grants account setup.
    return ok({ member: created.admin, emailed: link.emailed, inviteUrl: link.emailed ? null : link.url }, 201);
  } catch (error) {
    return serverError("team-invite", error);
  }
}

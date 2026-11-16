import { isUuid } from "@/lib/ids";
import { ROLE_LABELS } from "@/lib/permissions";
import { roleSchema } from "@/lib/validation";
import { isResponse, requireApi } from "@/lib/server/admin-guard";
import { requestMeta } from "@/lib/server/auth-flow";
import { recordSecurityEvent } from "@/lib/server/security-events";
import { changeRole, removeAdmin } from "@/lib/server/team-repo";
import { fail, ok, readJson, serverError, validationError } from "@/lib/server/http";

export const runtime = "nodejs";

type Params = { params: { id: string } };

const TEAM_ERRORS = {
  "not-found": () => fail("Team member not found", 404),
  "last-owner": () => fail("The team needs at least one owner", 409),
  self: () => fail("You can't change your own role or remove yourself", 400),
} as const;

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireApi("team");
  if (isResponse(auth)) return auth;
  if (!isUuid(params.id)) return fail("Invalid id", 400);
  const parsed = roleSchema.safeParse(await readJson(request));
  if (!parsed.success) return validationError(parsed.error);
  try {
    const result = await changeRole(auth.admin.id, params.id, parsed.data.role);
    if ("error" in result) return TEAM_ERRORS[result.error]();
    await recordSecurityEvent("role_changed", {
      adminId: params.id,
      actorId: auth.admin.id,
      email: result.admin.email,
      detail: `now ${ROLE_LABELS[result.admin.role]} (by ${auth.admin.email})`,
      ...requestMeta(request),
    });
    return ok(result.admin);
  } catch (error) {
    return serverError("team-role", error);
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const auth = await requireApi("team");
  if (isResponse(auth)) return auth;
  if (!isUuid(params.id)) return fail("Invalid id", 400);
  try {
    const result = await removeAdmin(auth.admin.id, params.id);
    if ("error" in result) return TEAM_ERRORS[result.error]();
    await recordSecurityEvent("admin_removed", {
      actorId: auth.admin.id,
      email: result.admin.email,
      detail: `removed by ${auth.admin.email}`,
      ...requestMeta(request),
    });
    return ok({ id: params.id });
  } catch (error) {
    return serverError("team-remove", error);
  }
}

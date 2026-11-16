import { z } from "zod";
import { passwordMatches } from "@/lib/server/admin-repo";
import { isResponse, requireApi } from "@/lib/server/admin-guard";
import { requestMeta } from "@/lib/server/auth-flow";
import { regenerateRecoveryCodes } from "@/lib/server/mfa-repo";
import { rateLimitPersistent } from "@/lib/server/rate-limit";
import { recordSecurityEvent } from "@/lib/server/security-events";
import { fail, ok, readJson, serverError, validationError } from "@/lib/server/http";

export const runtime = "nodejs";

const schema = z.object({ password: z.string().min(1, "Enter your password").max(200) });

/** Replaces all recovery codes (old ones stop working). Requires the password. */
export async function POST(request: Request) {
  const auth = await requireApi();
  if (isResponse(auth)) return auth;
  const { admin } = auth;
  if (!admin.mfaEnabled) return fail("Turn on two-factor authentication first", 400);
  if (!(await rateLimitPersistent(`recovery-regen:${admin.id}`, 5, 15 * 60 * 1000))) {
    return fail("Too many attempts. Try again later.", 429);
  }
  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return validationError(parsed.error);
  try {
    if (!(await passwordMatches(admin.id, parsed.data.password))) return fail("Password is incorrect", 403);
    const recoveryCodes = await regenerateRecoveryCodes(admin.id);
    await recordSecurityEvent("recovery_codes_regenerated", { adminId: admin.id, email: admin.email, ...requestMeta(request) });
    return ok({ recoveryCodes });
  } catch (error) {
    return serverError("recovery-codes", error);
  }
}

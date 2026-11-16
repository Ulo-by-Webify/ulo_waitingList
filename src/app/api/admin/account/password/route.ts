import { passwordChangeSchema } from "@/lib/validation";
import { passwordMatches, registerFailedAttempt, setPassword } from "@/lib/server/admin-repo";
import { isResponse, requireApi } from "@/lib/server/admin-guard";
import { alertLockout, requestMeta } from "@/lib/server/auth-flow";
import { securityAlert } from "@/lib/server/mailer";
import { rateLimitPersistent } from "@/lib/server/rate-limit";
import { recordSecurityEvent } from "@/lib/server/security-events";
import { revokeAllSessions } from "@/lib/server/sessions-repo";
import { fail, ok, readJson, serverError, validationError } from "@/lib/server/http";

export const runtime = "nodejs";

const ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: Request) {
  const auth = await requireApi();
  if (isResponse(auth)) return auth;
  const { admin, session } = auth;
  const meta = requestMeta(request);

  if (!(await rateLimitPersistent(`password-change:${admin.id}`, ATTEMPTS, WINDOW_MS))) {
    return fail("Too many attempts. Try again in 15 minutes.", 429);
  }
  const parsed = passwordChangeSchema.safeParse(await readJson(request));
  if (!parsed.success) return validationError(parsed.error);

  try {
    if (!(await passwordMatches(admin.id, parsed.data.currentPassword))) {
      if (await registerFailedAttempt(admin.id)) {
        await revokeAllSessions(admin.id);
        await alertLockout(admin, meta);
      }
      return fail("Current password is incorrect", 403);
    }
    await setPassword(admin.id, parsed.data.newPassword);
    const revoked = await revokeAllSessions(admin.id, session.id);
    await recordSecurityEvent("password_changed", { adminId: admin.id, email: admin.email, detail: `${revoked} other sessions signed out`, ...meta });
    await securityAlert(admin.email, "your password was changed", `Your password was changed from IP ${meta.ip}. ${revoked} other session(s) were signed out.`);
    return ok({ otherSessionsSignedOut: revoked });
  } catch (error) {
    return serverError("admin-password", error);
  }
}

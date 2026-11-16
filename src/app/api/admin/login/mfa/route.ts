import { mfaCodeSchema } from "@/lib/validation";
import { getAdminById, registerFailedAttempt } from "@/lib/server/admin-repo";
import { getPendingMfaSession } from "@/lib/server/admin-guard";
import { LOCKED_MESSAGE, alertLockout, completeLogin, requestMeta } from "@/lib/server/auth-flow";
import { securityAlert } from "@/lib/server/mailer";
import { remainingRecoveryCodes, verifyMfaCode } from "@/lib/server/mfa-repo";
import { rateLimitPersistent } from "@/lib/server/rate-limit";
import { recordSecurityEvent } from "@/lib/server/security-events";
import { completeMfa, revokeSession } from "@/lib/server/sessions-repo";
import { fail, readJson, serverError, validationError } from "@/lib/server/http";

export const runtime = "nodejs";

const ATTEMPTS = 5;
const WINDOW_MS = 5 * 60 * 1000;
const EXPIRED = "Your sign-in timed out. Enter your email and password again.";

export async function POST(request: Request) {
  const meta = requestMeta(request);
  const pending = await getPendingMfaSession();
  if (!pending) return fail(EXPIRED, 401);

  if (!(await rateLimitPersistent(`mfa:${pending.id}`, ATTEMPTS, WINDOW_MS))) {
    await revokeSession(pending.adminId, pending.id);
    return fail("Too many wrong codes. Sign in again.", 429);
  }

  const parsed = mfaCodeSchema.safeParse(await readJson(request));
  if (!parsed.success) return validationError(parsed.error);

  try {
    const admin = await getAdminById(pending.adminId);
    if (!admin) return fail(EXPIRED, 401);
    if (admin.lockedUntil) {
      await revokeSession(admin.id, pending.id);
      return fail(LOCKED_MESSAGE, 429);
    }

    const check = await verifyMfaCode(admin.id, parsed.data.code);
    if (!check.ok) {
      await recordSecurityEvent("mfa_failed", { adminId: admin.id, email: admin.email, ...meta });
      if (await registerFailedAttempt(admin.id)) {
        await revokeSession(admin.id, pending.id);
        await alertLockout(admin, meta);
        return fail(LOCKED_MESSAGE, 429);
      }
      return fail("That code didn't work. Check your authenticator app and try again.", 401);
    }

    const session = await completeMfa(pending.id);
    if (!session) return fail(EXPIRED, 401);

    if (check.method === "recovery") {
      const left = await remainingRecoveryCodes(admin.id);
      await recordSecurityEvent("recovery_code_used", { adminId: admin.id, email: admin.email, detail: `${left} left`, ...meta });
      await securityAlert(admin.email, "a recovery code was used", `Someone signed in to your account with a recovery code from IP ${meta.ip}. ${left} recovery codes remain.`);
    }
    return completeLogin(admin, session, meta, check.method === "recovery" ? "recovery code" : "authenticator");
  } catch (error) {
    return serverError("admin-login-mfa", error);
  }
}

import { profileSchema } from "@/lib/validation";
import { updateProfile } from "@/lib/server/admin-repo";
import { isResponse, requireApi } from "@/lib/server/admin-guard";
import { requestMeta } from "@/lib/server/auth-flow";
import { securityAlert } from "@/lib/server/mailer";
import { rateLimitPersistent } from "@/lib/server/rate-limit";
import { recordSecurityEvent } from "@/lib/server/security-events";
import { fail, ok, readJson, serverError, unauthorized, validationError } from "@/lib/server/http";

export const runtime = "nodejs";

const ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000;

export async function PATCH(request: Request) {
  const auth = await requireApi();
  if (isResponse(auth)) return auth;
  const { admin } = auth;
  const meta = requestMeta(request);

  if (!(await rateLimitPersistent(`profile:${admin.id}`, ATTEMPTS, WINDOW_MS))) {
    return fail("Too many attempts. Try again later.", 429);
  }
  const parsed = profileSchema.safeParse(await readJson(request));
  if (!parsed.success) return validationError(parsed.error);

  try {
    const { fullName: name, email: newEmail, currentPassword } = parsed.data;
    const result = await updateProfile(admin.id, { fullName: name ?? null, email: newEmail, currentPassword });
    // Narrow with `in`: the project's tsconfig has strictNullChecks off, which disables `ok` narrowing.
    if ("reason" in result) {
      if (result.reason === "wrong-password") return fail("Current password is incorrect", 403);
      if (result.reason === "email-taken") return fail("That email is already used by another admin", 409);
      return unauthorized();
    }
    const { fullName, email } = result.admin;
    const emailChanged = email !== admin.email;
    await recordSecurityEvent("profile_updated", { adminId: admin.id, email, detail: emailChanged ? `email changed from ${admin.email}` : null, ...meta });
    if (emailChanged) {
      // Tell the old address, so a hijacked session can't quietly take over the account.
      await securityAlert(admin.email, "your sign-in email was changed", `The sign-in email for your account was changed to ${email} from IP ${meta.ip}.`);
    }
    return ok({ fullName, email });
  } catch (error) {
    return serverError("admin-profile", error);
  }
}

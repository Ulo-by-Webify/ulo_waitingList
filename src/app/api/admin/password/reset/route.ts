import { z } from "zod";
import { tokenPasswordSchema } from "@/lib/validation";
import { getAdminById, setPassword } from "@/lib/server/admin-repo";
import { requestMeta } from "@/lib/server/auth-flow";
import { securityAlert } from "@/lib/server/mailer";
import { rateLimitPersistent } from "@/lib/server/rate-limit";
import { recordSecurityEvent } from "@/lib/server/security-events";
import { revokeAllSessions } from "@/lib/server/sessions-repo";
import { consumeToken } from "@/lib/server/token-repo";
import { rejectIfNotHuman } from "@/lib/server/turnstile";
import { TURNSTILE_ACTIONS } from "@/lib/turnstile";
import { fail, ok, readJson, serverError, validationError } from "@/lib/server/http";

export const runtime = "nodejs";

const ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000;
const schema = tokenPasswordSchema.and(z.object({ purpose: z.enum(["reset", "invite"]) }));

/** Sets a password from an emailed reset link or an invite link, then signs out everywhere. */
export async function POST(request: Request) {
  const meta = requestMeta(request);
  if (!(await rateLimitPersistent(`reset-ip:${meta.ip}`, ATTEMPTS, WINDOW_MS))) {
    return fail("Too many attempts. Try again later.", 429);
  }
  const body = await readJson(request);
  const notHuman = await rejectIfNotHuman(body, meta.ip, TURNSTILE_ACTIONS.setPassword);
  if (notHuman) return notHuman;

  const parsed = schema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  try {
    const adminId = await consumeToken(parsed.data.token, parsed.data.purpose);
    if (!adminId) return fail("This link is invalid, expired or already used. Request a new one.", 400);

    await setPassword(adminId, parsed.data.password);
    await revokeAllSessions(adminId);
    const admin = await getAdminById(adminId);
    const isInvite = parsed.data.purpose === "invite";
    await recordSecurityEvent(isInvite ? "invite_accepted" : "password_reset", { adminId, email: admin?.email, ...meta });
    if (admin && !isInvite) {
      await securityAlert(admin.email, "your password was reset", `Your password was reset using an emailed link from IP ${meta.ip}. All sessions were signed out.`);
    }
    return ok({ reset: true });
  } catch (error) {
    return serverError("admin-reset-password", error);
  }
}

import { forgotPasswordSchema } from "@/lib/validation";
import { getPool } from "@/lib/server/db";
import { getAdminById } from "@/lib/server/admin-repo";
import { issueSetupLink, requestMeta } from "@/lib/server/auth-flow";
import { isEmailConfigured } from "@/lib/server/mailer";
import { rateLimitPersistent } from "@/lib/server/rate-limit";
import { recordSecurityEvent } from "@/lib/server/security-events";
import { rejectIfNotHuman } from "@/lib/server/turnstile";
import { TURNSTILE_ACTIONS } from "@/lib/turnstile";
import { fail, ok, readJson, serverError, validationError } from "@/lib/server/http";

export const runtime = "nodejs";

const IP_ATTEMPTS = 5;
const EMAIL_ATTEMPTS = 3;
const IP_WINDOW_MS = 15 * 60 * 1000;
const EMAIL_WINDOW_MS = 60 * 60 * 1000;

/**
 * Always answers the same way whether or not the email has an account, so the form can't be
 * used to discover admin emails. The link itself is only ever sent by email, never returned.
 */
export async function POST(request: Request) {
  const meta = requestMeta(request);
  if (!(await rateLimitPersistent(`forgot-ip:${meta.ip}`, IP_ATTEMPTS, IP_WINDOW_MS))) {
    return fail("Too many requests. Try again later.", 429);
  }
  const body = await readJson(request);
  const notHuman = await rejectIfNotHuman(body, meta.ip, TURNSTILE_ACTIONS.forgotPassword);
  if (notHuman) return notHuman;

  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const emailEnabled = isEmailConfigured();
  const response = ok({ emailEnabled });
  if (!emailEnabled) return response;

  try {
    const { email } = parsed.data;
    if (!(await rateLimitPersistent(`forgot-email:${email}`, EMAIL_ATTEMPTS, EMAIL_WINDOW_MS))) return response;

    const row = await getPool().query(`SELECT id FROM admin_users WHERE lower(email) = lower($1)`, [email]);
    const admin = row.rows[0] ? await getAdminById(row.rows[0].id) : null;
    if (admin) {
      // Send in the background: waiting on SMTP would make responses for real accounts measurably
      // slower, leaking which emails exist. (Railway runs a long-lived Node server, so this completes.)
      void (async () => {
        await issueSetupLink(admin, "reset");
        await recordSecurityEvent("password_reset_requested", { adminId: admin.id, email, ...meta });
      })().catch((error) => console.error("[admin-forgot-password] failed to send reset link", error));
    }
    return response;
  } catch (error) {
    return serverError("admin-forgot-password", error);
  }
}

import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validation";
import { checkPassword } from "@/lib/server/admin-repo";
import { setSessionCookie } from "@/lib/server/admin-guard";
import { LOCKED_MESSAGE, alertLockout, completeLogin, loginEmailKey, requestMeta, startSession } from "@/lib/server/auth-flow";
import { rateLimitPersistent } from "@/lib/server/rate-limit";
import { recordSecurityEvent } from "@/lib/server/security-events";
import { rejectIfNotHuman } from "@/lib/server/turnstile";
import { TURNSTILE_ACTIONS } from "@/lib/turnstile";
import { fail, readJson, serverError } from "@/lib/server/http";

export const runtime = "nodejs";

const IP_ATTEMPTS = 10;
const EMAIL_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: Request) {
  const meta = requestMeta(request);
  if (!(await rateLimitPersistent(`login-ip:${meta.ip}`, IP_ATTEMPTS, WINDOW_MS))) {
    return fail("Too many attempts. Try again in 15 minutes.", 429);
  }

  const body = await readJson(request);
  const notHuman = await rejectIfNotHuman(body, meta.ip, TURNSTILE_ACTIONS.adminLogin);
  if (notHuman) return notHuman;

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return fail("Enter a valid email and password", 400);
  const { email, password } = parsed.data;

  // Per-email limit also applies to emails with no account, so responses can't reveal which exist.
  if (!(await rateLimitPersistent(loginEmailKey(email), EMAIL_ATTEMPTS, WINDOW_MS))) {
    return fail(LOCKED_MESSAGE, 429);
  }

  try {
    const result = await checkPassword(email, password);

    if (result.status === "locked") return fail(LOCKED_MESSAGE, 429);

    if (result.status === "invalid") {
      if (result.admin) {
        await recordSecurityEvent("login_failed", { adminId: result.admin.id, email, ...meta });
        if (result.justLocked) await alertLockout(result.admin, meta);
      }
      return fail("Incorrect email or password", 401);
    }

    const { admin } = result;
    if (admin.mfaEnabled) {
      // Password is right; issue a short-lived pending session that only the 2FA step accepts.
      const pending = await startSession(admin, meta, true);
      const response = NextResponse.json({ success: true, data: { mfaRequired: true }, error: null });
      await setSessionCookie(response, pending);
      return response;
    }

    return completeLogin(admin, await startSession(admin, meta, false), meta);
  } catch (error) {
    return serverError("admin-login", error);
  }
}

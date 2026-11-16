import QRCode from "qrcode";
import { mfaCodeSchema, mfaDisableSchema } from "@/lib/validation";
import { passwordMatches } from "@/lib/server/admin-repo";
import { isResponse, requireApi } from "@/lib/server/admin-guard";
import { requestMeta } from "@/lib/server/auth-flow";
import { securityAlert } from "@/lib/server/mailer";
import { confirmEnrollment, disableMfa, startEnrollment, verifyMfaCode } from "@/lib/server/mfa-repo";
import { rateLimitPersistent } from "@/lib/server/rate-limit";
import { recordSecurityEvent } from "@/lib/server/security-events";
import { fail, ok, readJson, serverError, validationError } from "@/lib/server/http";

export const runtime = "nodejs";

const ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000;

/** Step 1 of setup: create a secret and return it as a QR code (plus the text for manual entry). */
export async function POST() {
  const auth = await requireApi();
  if (isResponse(auth)) return auth;
  const { admin } = auth;
  if (admin.mfaEnabled) return fail("Two-factor authentication is already on", 409);
  try {
    const { secret, uri } = await startEnrollment(admin.id, admin.email);
    const qrDataUrl = await QRCode.toDataURL(uri, { margin: 1, width: 220 });
    return ok({ secret, qrDataUrl });
  } catch (error) {
    return serverError("mfa-start", error);
  }
}

/** Step 2 of setup: confirm with a code from the app; returns one-time recovery codes. */
export async function PUT(request: Request) {
  const auth = await requireApi();
  if (isResponse(auth)) return auth;
  const { admin } = auth;
  const meta = requestMeta(request);
  if (!(await rateLimitPersistent(`mfa-setup:${admin.id}`, ATTEMPTS, WINDOW_MS))) {
    return fail("Too many attempts. Try again later.", 429);
  }
  const parsed = mfaCodeSchema.safeParse(await readJson(request));
  if (!parsed.success) return validationError(parsed.error);
  try {
    const recoveryCodes = await confirmEnrollment(admin.id, parsed.data.code);
    if (!recoveryCodes) return fail("That code didn't match. Check the time on your phone and try again.", 400);
    await recordSecurityEvent("mfa_enabled", { adminId: admin.id, email: admin.email, ...meta });
    await securityAlert(admin.email, "two-factor authentication turned on", `Two-factor authentication was turned on for your account from IP ${meta.ip}.`);
    return ok({ recoveryCodes });
  } catch (error) {
    return serverError("mfa-confirm", error);
  }
}

/** Turning 2FA off needs both the password and a current code, so a stolen session alone can't do it. */
export async function DELETE(request: Request) {
  const auth = await requireApi();
  if (isResponse(auth)) return auth;
  const { admin } = auth;
  const meta = requestMeta(request);
  if (!(await rateLimitPersistent(`mfa-disable:${admin.id}`, 5, WINDOW_MS))) {
    return fail("Too many attempts. Try again later.", 429);
  }
  const parsed = mfaDisableSchema.safeParse(await readJson(request));
  if (!parsed.success) return validationError(parsed.error);
  try {
    if (!(await passwordMatches(admin.id, parsed.data.password))) return fail("Password is incorrect", 403);
    if (!(await verifyMfaCode(admin.id, parsed.data.code)).ok) return fail("That 2FA code didn't work", 403);
    await disableMfa(admin.id);
    await recordSecurityEvent("mfa_disabled", { adminId: admin.id, email: admin.email, ...meta });
    await securityAlert(admin.email, "two-factor authentication turned off", `Two-factor authentication was turned off for your account from IP ${meta.ip}.`);
    return ok({ disabled: true });
  } catch (error) {
    return serverError("mfa-disable", error);
  }
}

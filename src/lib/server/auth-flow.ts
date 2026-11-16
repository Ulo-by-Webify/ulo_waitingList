import "server-only";
import { NextResponse } from "next/server";
import { recordSuccessfulLogin, type AdminUser } from "./admin-repo";
import { setSessionCookie } from "./admin-guard";
import { appUrl, isEmailConfigured, securityAlert, sendMail } from "./mailer";
import { clientIp, clientUserAgent, resetRateLimit } from "./rate-limit";
import { recordSecurityEvent } from "./security-events";
import { createSession, type SessionRow } from "./sessions-repo";
import { issueToken, TOKEN_TTL_MINUTES, type TokenPurpose } from "./token-repo";

export type RequestMeta = { ip: string; userAgent: string };

export function requestMeta(request: Request): RequestMeta {
  return { ip: clientIp(request), userAgent: clientUserAgent(request) };
}

export const loginEmailKey = (email: string) => `login-email:${email.toLowerCase()}`;

export const LOCKED_MESSAGE = "Too many failed attempts. Try again in 15 minutes, or reset your password.";

/** Marks the login successful, clears failure counters and sets the session cookie. */
export async function completeLogin(
  admin: AdminUser,
  session: SessionRow,
  meta: RequestMeta,
  detail?: string,
): Promise<NextResponse> {
  await recordSuccessfulLogin(admin.id);
  await resetRateLimit(loginEmailKey(admin.email)).catch(() => undefined);
  await recordSecurityEvent("login_success", { adminId: admin.id, email: admin.email, detail, ...meta });
  const response = NextResponse.json({ success: true, data: { mfaRequired: false }, error: null });
  await setSessionCookie(response, session);
  return response;
}

export async function startSession(admin: AdminUser, meta: RequestMeta, pendingMfa: boolean): Promise<SessionRow> {
  return createSession(admin.id, { pendingMfa, ...meta });
}

export async function alertLockout(admin: AdminUser, meta: RequestMeta): Promise<void> {
  await recordSecurityEvent("account_locked", { adminId: admin.id, email: admin.email, ...meta });
  await securityAlert(
    admin.email,
    "your account was locked",
    `After repeated failed sign-in attempts, your Ulô Admin account is locked for 15 minutes.\nLast attempt from IP ${meta.ip}.`,
  );
}

export type SetupLink = { url: string; emailed: boolean; expiresInMinutes: number };

/**
 * Issues a password reset or invite link. Emails it when SMTP is configured; the URL is also
 * returned so an owner can share it directly when email isn't set up.
 */
export async function issueSetupLink(admin: AdminUser, purpose: TokenPurpose, invitedBy?: string): Promise<SetupLink> {
  const token = await issueToken(admin.id, purpose);
  const url = `${appUrl()}/admin/reset-password?${new URLSearchParams({ token, purpose })}`;
  const minutes = TOKEN_TTL_MINUTES[purpose];
  let emailed = false;
  if (isEmailConfigured()) {
    emailed = await sendMail(
      purpose === "invite"
        ? {
            to: admin.email,
            subject: "You've been invited to Ulô Admin",
            text: `${invitedBy ?? "A team owner"} invited you to the Ulô admin dashboard.\n\nSet your password to get started (link valid for 7 days):\n${url}\n\n— Ulô Admin`,
          }
        : {
            to: admin.email,
            subject: "Reset your Ulô Admin password",
            text: `Use this link to choose a new password (valid for ${minutes} minutes, single use):\n${url}\n\nIf you didn't ask for this, you can ignore this email.\n\n— Ulô Admin`,
          },
    );
  }
  return { url, emailed, expiresInMinutes: minutes };
}

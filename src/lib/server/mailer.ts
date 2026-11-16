import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

const globalForMail = globalThis as unknown as { mailTransport?: Transporter };

export function isEmailConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.MAIL_FROM);
}

function transport(): Transporter {
  if (!globalForMail.mailTransport) {
    const port = Number(process.env.SMTP_PORT || 587);
    globalForMail.mailTransport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      requireTLS: port !== 465,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });
  }
  return globalForMail.mailTransport;
}

/**
 * Base URL for links in emails. Always configured (APP_URL), never derived from the request's
 * Host header, so an attacker can't make reset emails point at their own domain.
 */
export function appUrl(): string {
  const url = process.env.APP_URL;
  if (!url || !/^https?:\/\//.test(url)) throw new Error("APP_URL must be set to the site's public URL");
  const isLocal = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/.test(url);
  if (process.env.NODE_ENV === "production" && !url.startsWith("https://") && !isLocal) {
    throw new Error("APP_URL must use https in production");
  }
  return url.replace(/\/+$/, "");
}

type Mail = { to: string; subject: string; text: string };

/** Sends an email if SMTP is configured. Returns whether it was sent; never throws. */
export async function sendMail({ to, subject, text }: Mail): Promise<boolean> {
  if (!isEmailConfigured()) {
    console.warn(`[mail] SMTP not configured; skipped "${subject}" to ${to}`);
    return false;
  }
  try {
    await transport().sendMail({ from: process.env.MAIL_FROM, to, subject, text });
    return true;
  } catch (error) {
    console.error(`[mail] failed to send "${subject}"`, error);
    return false;
  }
}

const SIGNATURE = "\n\n— Ulô Admin\nIf you didn't expect this email, contact another owner on your team.";

export function securityAlert(to: string, headline: string, detail: string): Promise<boolean> {
  return sendMail({
    to,
    subject: `Ulô Admin security alert: ${headline}`,
    text: `${headline}\n\n${detail}\n\nIf this wasn't you, reset your password and review your active sessions under Account → Security.${SIGNATURE}`,
  });
}

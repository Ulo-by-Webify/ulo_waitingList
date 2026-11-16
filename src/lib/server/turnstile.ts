import "server-only";
import { TURNSTILE_FIELD, TURNSTILE_SITE_KEY, type TurnstileAction } from "@/lib/turnstile";
import { fail } from "@/lib/server/http";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const VERIFY_TIMEOUT_MS = 8000;
/** Cloudflare's documented maximum token length. */
const MAX_TOKEN_LENGTH = 2048;

const MISSING_TOKEN = "Please complete the security check and try again.";
const FAILED = "We couldn't confirm you're human. Please refresh the page and try again.";
const UNAVAILABLE = "The security check is unavailable right now. Please try again in a moment.";

type SiteverifyResult = {
  success?: boolean;
  action?: string;
  "error-codes"?: string[];
};

let hasWarnedAboutConfig = false;

/** Turnstile runs only when both keys are set; with one missing it is off (and we say so in the logs). */
export function isTurnstileEnabled(): boolean {
  const hasSecret = Boolean(process.env.TURNSTILE_SECRET_KEY);
  const hasSiteKey = TURNSTILE_SITE_KEY !== "";
  if (hasSecret && hasSiteKey) return true;
  if (!hasWarnedAboutConfig && (hasSecret || hasSiteKey || process.env.NODE_ENV === "production")) {
    hasWarnedAboutConfig = true;
    console.warn(
      "[turnstile] Bot protection is OFF: set both NEXT_PUBLIC_TURNSTILE_SITE_KEY and TURNSTILE_SECRET_KEY to turn it on.",
    );
  }
  return false;
}

function readToken(body: unknown): string | null {
  const value = (body as Record<string, unknown> | null)?.[TURNSTILE_FIELD];
  return typeof value === "string" && value.length > 0 && value.length <= MAX_TOKEN_LENGTH ? value : null;
}

/**
 * Checks the Turnstile token a form sent. Returns an error response to send back,
 * or null when the request may go ahead.
 */
export async function rejectIfNotHuman(body: unknown, ip: string, action: TurnstileAction): Promise<Response | null> {
  if (!isTurnstileEnabled()) return null;

  const token = readToken(body);
  if (!token) return fail(MISSING_TOKEN, 400);

  let result: SiteverifyResult;
  try {
    const response = await fetch(VERIFY_URL, {
      method: "POST",
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY ?? "",
        response: token,
        remoteip: ip,
      }),
      signal: AbortSignal.timeout(VERIFY_TIMEOUT_MS),
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`siteverify returned HTTP ${response.status}`);
    result = (await response.json()) as SiteverifyResult;
  } catch (error) {
    console.error("[turnstile] verification request failed", error);
    return fail(UNAVAILABLE, 503);
  }

  // Cloudflare's test keys return no action, so only compare when one is present.
  const isWrongAction = Boolean(result.action) && result.action !== action;
  if (result.success !== true || isWrongAction) {
    const codes = result["error-codes"]?.join(", ") || (isWrongAction ? `action ${result.action}` : "none");
    console.warn(`[turnstile] rejected ${action} submission (${codes})`);
    return fail(FAILED, 403);
  }
  return null;
}

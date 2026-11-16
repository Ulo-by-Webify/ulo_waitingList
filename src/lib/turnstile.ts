/**
 * Cloudflare Turnstile settings shared by the browser widget and the server check.
 * Safe to import from client components.
 */

/** JSON body field each form sends its Turnstile token in. */
export const TURNSTILE_FIELD = "turnstileToken";

/** Public site key, inlined at build time. Empty means Turnstile is switched off. */
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

/**
 * One action per form. The widget stamps it into the token and the server checks it,
 * so a token solved on one form can't be replayed against another.
 */
export const TURNSTILE_ACTIONS = {
  waitlist: "waitlist",
  newsletter: "newsletter",
  comment: "comment",
  adminLogin: "admin-login",
  forgotPassword: "forgot-password",
  setPassword: "set-password",
} as const;

export type TurnstileAction = (typeof TURNSTILE_ACTIONS)[keyof typeof TURNSTILE_ACTIONS];

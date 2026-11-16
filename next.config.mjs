/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV !== "production";

// Third parties the public site loads: MailerLite (signup form), Cloudinary (video), Cloudflare Turnstile (form bot check),
// Unsplash / randomuser.me (placeholder imagery).
const MAILERLITE = "https://*.mailerlite.com https://*.mlcdn.com";
// Cloudflare Turnstile bot check on the site's own forms (script + challenge iframe).
const TURNSTILE = "https://challenges.cloudflare.com";

// Enforced now: directives that can't break third-party embeds.
const enforcedCsp = [
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  `form-action 'self' ${MAILERLITE}`,
].join("; ");

// Full resource policy, report-only for now: violations are logged in the browser console
// without blocking anything. Once the console is clean on every page (including the MailerLite
// form), move these directives into enforcedCsp.
const reportOnlyCsp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} ${MAILERLITE} ${TURNSTILE} https://www.google.com https://www.gstatic.com`,
  `style-src 'self' 'unsafe-inline' ${MAILERLITE} https://fonts.googleapis.com`,
  `font-src 'self' data: ${MAILERLITE} https://fonts.gstatic.com`,
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https://res.cloudinary.com",
  `connect-src 'self' ${MAILERLITE}${isDev ? " ws:" : ""}`,
  `frame-src 'self' blob: ${MAILERLITE} ${TURNSTILE} https://www.google.com`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: enforcedCsp },
  { key: "Content-Security-Policy-Report-Only", value: reportOnlyCsp },
  // Browsers ignore HSTS over plain http, so this is harmless in local dev.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
];

const noIndexHeaders = [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive, nosnippet, noimageindex" }];

const nextConfig = {
  poweredByHeader: false,
  // The app doesn't use next/image; disabling the optimizer removes the /_next/image endpoint
  // (target of GHSA advisories against Next.js 14) until the planned Next upgrade.
  images: { unoptimized: true },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Private admin: never index, follow, cache or preview (covers /admin itself too).
      { source: "/admin/:path*", headers: noIndexHeaders },
      { source: "/api/admin/:path*", headers: noIndexHeaders },
    ];
  },
};

export default nextConfig;

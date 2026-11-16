import type { Metadata } from "next";

/** Search and social-sharing settings for the public site. The admin opts out in app/admin/layout.tsx. */

export const SITE_NAME = "Ulô";
export const SITE_TAGLINE = "Authentic African Travel & Soulful Stays";
export const DEFAULT_DESCRIPTION =
  "Stay in soulful homes, join local festivals and experience Africa beyond tourism. Get early access to curated stays and trusted local services across Africa.";
/** Branded 1200 × 630 share card (src/app/og/route.tsx). */
export const DEFAULT_SHARE_IMAGE = "/og";
export const LOGO_PATH = "/ulo-logo.png";

/** The site's public origin from APP_URL, or null when it isn't set (local dev without it). */
export function siteOrigin(): URL | null {
  const value = process.env.APP_URL;
  if (!value || !/^https?:\/\//.test(value)) return null;
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

/** Absolute URL for a site path, when the origin is known. */
export function absoluteUrl(path: string): string | undefined {
  const origin = siteOrigin();
  return origin ? new URL(path, origin).toString() : undefined;
}

type PageSeo = {
  /** Shown before " | Ulô". */
  title: string;
  description: string;
  /** Site path, e.g. "/experiences". Becomes the canonical URL. */
  path: string;
  image?: string;
  /** Keep the page out of search results (e.g. a thank-you page). */
  noIndex?: boolean;
};

/** Title, description, canonical URL and social cards for one public page. */
export function pageMetadata({ title, description, path, image = DEFAULT_SHARE_IMAGE, noIndex = false }: PageSeo): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: path,
      siteName: SITE_NAME,
      type: "website",
      locale: "en",
      images: [{ url: image, width: 1200, height: 630, alt: `${SITE_NAME} — ${SITE_TAGLINE}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [image],
    },
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
  };
}

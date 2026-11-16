import { z } from "zod";

/**
 * Site images admins can change. Safe to import from client components.
 * Add an entry here to make another page image editable.
 */
export const SITE_IMAGES = {
  onboarding_image: {
    label: "Begin your journey",
    description: "The tall photo beside the sign-up form on /begin-your-journey. Shown on large screens only.",
    page: "/begin-your-journey",
    defaultUrl: "/auth-img.jpg",
    shape: "portrait",
    recommendation: "Portrait, at least 1200 × 1800 px. JPG, PNG or WebP.",
  },
  how_it_works_hero: {
    label: "How Ulô Works hero",
    description: "Full-screen background behind “Africa. Now in your pocket.” at the top of /how-it-works.",
    page: "/how-it-works",
    defaultUrl: "/how-it-works-hero.jpg",
    shape: "landscape",
    recommendation: "Landscape, at least 2400 × 1350 px. White text sits on top, so darker images read best.",
  },
  journal_hero_empty: {
    label: "Journal hero (no featured posts)",
    description:
      "Background of the big hero at the top of /journal while no published post is tagged “featured”. Featured posts show their own cover instead.",
    page: "/journal",
    defaultUrl: "/journal-hero.jpg",
    shape: "landscape",
    recommendation: "Landscape, at least 2400 × 1350 px. White text sits on top, so darker images read best.",
  },
} as const;

export type SiteImageKey = keyof typeof SITE_IMAGES;
export const SITE_IMAGE_KEYS = Object.keys(SITE_IMAGES) as SiteImageKey[];

export function isSiteImageKey(value: unknown): value is SiteImageKey {
  return typeof value === "string" && value in SITE_IMAGES;
}

/** A site path (/image.jpg, /api/files/...) or an https URL. Protocol-relative URLs are refused. */
export const siteImageUrlSchema = z
  .string()
  .trim()
  .min(1, "Choose an image")
  .max(1024)
  .refine((v) => (v.startsWith("/") && !v.startsWith("//")) || /^https:\/\/\S+$/.test(v), {
    message: "Use a site path (starting with /) or an https:// link",
  });

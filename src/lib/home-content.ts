import { z } from "zod";
import { siteImageUrlSchema } from "@/lib/site-settings";
import { hasUniqueIds, itemIdSchema, optionalText, requiredText, unsplashUrl } from "@/lib/content-fields";

/**
 * Text and images of the public homepage, editable on the admin "Home" page.
 * The videos stay fixed in code. Safe to import from client components.
 */

export const HOME_LIMITS = {
  listingCards: 10,
  places: 12,
} as const;

const image = siteImageUrlSchema;
/** Same rules as images: a site path or an https link. */
const video = siteImageUrlSchema;

// Built-in videos. Also the fallback for saves made before the videos were editable.
const DEFAULT_VIDEOS = {
  hero: "/videos/hero-page.mp4",
  preview: "/videos/new/THUMBNAIL.mp4",
  poster: "/thumbnail.jpg",
  film: "/videos/ULÔ_SHORT_FILM.mp4",
} as const;

export const listingCardSchema = z.object({
  id: itemIdSchema,
  title: requiredText("Title", 80),
  subtitle: optionalText("Subtitle", 160),
  /** "photo" fills the card; "icon" shows the image centred on a solid colour. */
  style: z.enum(["photo", "icon"]),
  image,
  background: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a colour like #5B3A29"),
});

export const placeSchema = z.object({
  id: itemIdSchema,
  city: requiredText("City", 40),
  country: requiredText("Country", 40),
  /** Two-letter ISO country code, used for the flag. */
  countryCode: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z]{2}$/, "Use the two-letter country code, e.g. NG"),
  tagline: optionalText("Tagline", 80),
  image,
});

const photoSchema = z.object({ image, alt: optionalText("Photo description", 120) });

export const HOME_PHOTO_SLOTS = ["wide", "middleLeft", "middleRight", "tall", "bottomRight"] as const;
export type HomePhotoSlot = (typeof HOME_PHOTO_SLOTS)[number];

export const homeContentSchema = z.object({
  hero: z.object({
    video: video.default(DEFAULT_VIDEOS.hero),
    title: requiredText("Hero heading", 60),
    emphasis: optionalText("Hero second line", 40),
    text: optionalText("Hero text", 300),
  }),
  listing: z.object({
    titleLine1: requiredText("Heading", 60),
    titleLine2: optionalText("Heading second line", 60),
    subtitle: optionalText("Text", 200),
    linkLabel: requiredText("Button text", 40),
    cards: z
      .array(listingCardSchema)
      .min(1, "Add at least one card")
      .max(HOME_LIMITS.listingCards, `Up to ${HOME_LIMITS.listingCards} cards`)
      .refine(hasUniqueIds, "Card ids must be unique"),
  }),
  introducing: z.object({
    title: requiredText("Heading", 60),
    subtitle: optionalText("Text", 120),
  }),
  closer: z.object({
    title: requiredText("Heading", 80),
    image,
  }),
  showcase: z.object({
    title: requiredText("Heading", 60),
    line1: optionalText("First line", 120),
    line2: optionalText("Second line", 120),
    /** Silent loop shown until someone presses play. */
    previewVideo: video.default(DEFAULT_VIDEOS.preview),
    /** Still image shown while the preview loads. */
    poster: image.default(DEFAULT_VIDEOS.poster),
    /** The film that plays, with sound, after pressing play. */
    film: video.default(DEFAULT_VIDEOS.film),
  }),
  places: z.object({
    tag: optionalText("Tag", 40),
    title: requiredText("Heading", 80),
    body: optionalText("Text", 400),
    linkLabel: requiredText("Link text", 40),
    items: z
      .array(placeSchema)
      .min(1, "Add at least one place")
      .max(HOME_LIMITS.places, `Up to ${HOME_LIMITS.places} places`)
      .refine(hasUniqueIds, "Place ids must be unique"),
  }),
  homes: z.object({
    title: requiredText("Heading", 80),
    subtitle: optionalText("Text", 200),
    photos: z.object({
      wide: photoSchema,
      middleLeft: photoSchema,
      middleRight: photoSchema,
      tall: photoSchema,
      bottomRight: photoSchema,
    }),
    captionTitle: optionalText("Caption heading", 120),
    captionText: optionalText("Caption text", 160),
    linkLabel: requiredText("Link text", 40),
  }),
});

export type ListingCard = z.infer<typeof listingCardSchema>;
export type Place = z.infer<typeof placeSchema>;
export type HomeContent = z.infer<typeof homeContentSchema>;

// ---------- Built-in content (what the homepage showed before it was editable) ----------

const PHOTO_CARD_BACKGROUND = "#1F2937";

export const DEFAULT_HOME_CONTENT: HomeContent = {
  hero: {
    video: DEFAULT_VIDEOS.hero,
    title: "Don’t Just Visit Africa",
    emphasis: "Experience it.",
    text: "Stay in soulful homes. Participate in local festivals. Experience Africa beyond tourism.",
  },
  listing: {
    titleLine1: "Africa is not a listing.",
    titleLine2: "It’s lived.",
    subtitle: "Built for a deeper way to experience Africa",
    linkLabel: "Explore Further",
    cards: [
      { id: "stay", title: "Stay Somewhere That Means Something", subtitle: "Homes rooted in culture, not just comfort.", style: "photo", image: "/Africanna.jpg", background: PHOTO_CARD_BACKGROUND },
      { id: "move", title: "Move Like You Belong", subtitle: "Explore with trusted locals who open up the real Africa.", style: "photo", image: "/Eden.jpg", background: PHOTO_CARD_BACKGROUND },
      { id: "has-your-back", title: "Ulô Has Your Back", subtitle: "Helping you settle in, every step of the way.", style: "icon", image: "/icons/ulo-badge.webp", background: "#5B3A29" },
      { id: "pay", title: "Pay However Feels Right", subtitle: "Borderless payments, so you can focus on the journey.", style: "icon", image: "/icons/coweries.png", background: "#12312A" },
      { id: "comfort", title: "Comfort, Reimagined", subtitle: "Modern stays without losing the soul of the place.", style: "photo", image: "/Urban.jpg", background: PHOTO_CARD_BACKGROUND },
    ],
  },
  introducing: {
    title: "Introducing Ulô",
    subtitle: "Connecting you to Africa.",
  },
  closer: {
    title: "Every step brings you closer.",
    image: unsplashUrl("1516026672322-bc52d61a55d5", 2400),
  },
  showcase: {
    title: "This Is Africa",
    line1: "Not the Africa of postcards",
    line2: "but the one you’ve probably never experienced.",
    previewVideo: DEFAULT_VIDEOS.preview,
    poster: DEFAULT_VIDEOS.poster,
    film: DEFAULT_VIDEOS.film,
  },
  places: {
    tag: "Curated Places",
    title: "Begin Somewhere Meaningful",
    body: "Built for travelers who want more than a visit — to eat the food, hear the stories, walk the neighborhoods, and feel the rhythm of Africa.",
    linkLabel: "Be Among the First",
    items: [
      { id: "lagos", city: "Lagos", country: "Nigeria", countryCode: "ng", tagline: "Energy you can't ignore", image: unsplashUrl("1618828665011-0abd973f7bb8", 900) },
      { id: "accra", city: "Accra", country: "Ghana", countryCode: "gh", tagline: "Rhythm in every moment", image: unsplashUrl("1504609813442-a8924e83f76e", 900) },
      { id: "nairobi", city: "Nairobi", country: "Kenya", countryCode: "ke", tagline: "Where connection comes naturally", image: unsplashUrl("1523805009345-7448845a9e53", 900) },
      { id: "kigali", city: "Kigali", country: "Rwanda", countryCode: "rw", tagline: "Calm, clean, intentional", image: unsplashUrl("1528277342758-f1d7613953a2", 900) },
      { id: "cape-town", city: "Cape Town", country: "South Africa", countryCode: "za", tagline: "Beauty at every turn", image: unsplashUrl("1580060839134-75a5edca2e99", 900) },
    ],
  },
  homes: {
    title: "Find Homes With Soul",
    subtitle: "Browse culturally rooted homes designed to reflect Africa’s beauty and identity.",
    photos: {
      wide: { image: unsplashUrl("1600210492486-724fe5c67fb0", 1600), alt: "Sunlit living room with warm wood and leather" },
      middleLeft: { image: unsplashUrl("1615874959474-d609969a20ed", 1600), alt: "Calm bedroom with plants and soft textiles" },
      middleRight: { image: unsplashUrl("1615529182904-14819c35db37", 1600), alt: "Lounge with woven pendant lights" },
      tall: { image: "/Africanna.jpg", alt: "Thatched home surrounded by palms" },
      bottomRight: { image: unsplashUrl("1618221195710-dd6b41faaea6", 1600), alt: "Earth-toned living room with low seating" },
    },
    captionTitle: "Be among the first to stay in spaces like this.",
    captionText: "Launching soon across select African cities.",
    linkLabel: "Get Early Access",
  },
};

const SECTION_LABELS: Record<keyof HomeContent, string> = {
  hero: "Hero",
  listing: "Africa is not a listing",
  introducing: "Introducing Ulô",
  closer: "Every step brings you closer",
  showcase: "This Is Africa",
  places: "Curated Places",
  homes: "Find Homes With Soul",
};

export const HOME_PHOTO_LABELS: Record<HomePhotoSlot, string> = {
  wide: "Wide photo (top)",
  middleLeft: "Middle row, left",
  middleRight: "Middle row, right",
  tall: "Tall photo (bottom left)",
  bottomRight: "Bottom row, right",
};

/** Turns a validation path into words an admin can act on, e.g. "Curated Places › place 2". */
export function describeHomePath(content: HomeContent, path: (string | number)[]): string {
  const [section, field, index] = path;
  const label = SECTION_LABELS[section as keyof HomeContent] ?? "Homepage";
  if (section === "listing" && field === "cards" && typeof index === "number") {
    return `${label} › card ${index + 1}${content.listing.cards[index]?.title ? ` (${content.listing.cards[index].title})` : ""}`;
  }
  if (section === "places" && field === "items" && typeof index === "number") {
    return `${label} › place ${index + 1}${content.places.items[index]?.city ? ` (${content.places.items[index].city})` : ""}`;
  }
  if (section === "homes" && field === "photos" && typeof index === "string") {
    return `${label} › ${HOME_PHOTO_LABELS[index as HomePhotoSlot] ?? "photo"}`;
  }
  return label;
}

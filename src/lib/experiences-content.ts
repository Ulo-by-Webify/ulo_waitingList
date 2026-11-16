import { z } from "zod";
import { siteImageUrlSchema } from "@/lib/site-settings";
import { hasUniqueIds, itemIdSchema, optionalText, requiredText, unsplashUrl } from "@/lib/content-fields";

export { newItemId } from "@/lib/content-fields";

/**
 * Content of the public /experiences page, editable on the admin "Experiences" page.
 * Safe to import from client components.
 */

export const EXPERIENCES_LIMITS = {
  slides: 8,
  rows: 10,
  cardsPerRow: 20,
} as const;

const required = requiredText;
const optional = optionalText;
const itemId = itemIdSchema;

const image = siteImageUrlSchema;

export const experienceCardSchema = z.object({
  id: itemId,
  title: required("Title", 80),
  subtitle: optional("Subtitle", 160),
  image,
});

export const experienceRowSchema = z.object({
  id: itemId,
  title: required("Row title", 80),
  subtitle: optional("Row subtitle", 200),
  cards: z
    .array(experienceCardSchema)
    .min(1, "Each row needs at least one card")
    .max(EXPERIENCES_LIMITS.cardsPerRow, `A row can have up to ${EXPERIENCES_LIMITS.cardsPerRow} cards`),
});

export const experiencesContentSchema = z.object({
  hero: z.object({
    title: required("Hero title", 80),
    subtitle: optional("Hero text", 300),
    image,
  }),
  showcase: z.object({
    title: required("Showcase title", 80),
    body: optional("Showcase text", 500),
    slides: z
      .array(experienceCardSchema)
      .min(1, "The showcase needs at least one slide")
      .max(EXPERIENCES_LIMITS.slides, `The showcase can have up to ${EXPERIENCES_LIMITS.slides} slides`),
  }),
  rows: z
    .array(experienceRowSchema)
    .max(EXPERIENCES_LIMITS.rows, `You can have up to ${EXPERIENCES_LIMITS.rows} service rows`)
    .refine(hasUniqueIds, "Row ids must be unique"),
  earlyAccess: z.object({
    title: optional("Early access heading", 160),
  }),
  provider: z.object({
    title: required("Provider title", 80),
    subtitle: optional("Provider text", 300),
    image,
    linkLabel: required("Provider link text", 40),
  }),
});

export type ExperienceCard = z.infer<typeof experienceCardSchema>;
export type ExperienceRow = z.infer<typeof experienceRowSchema>;
export type ExperiencesContent = z.infer<typeof experiencesContentSchema>;

// ---------- Built-in content (what the page showed before it was editable) ----------

const unsplash = unsplashUrl;

const card = (id: string, title: string, subtitle: string, imageUrl: string): ExperienceCard => ({
  id,
  title,
  subtitle,
  image: imageUrl,
});

export const DEFAULT_EXPERIENCES_CONTENT: ExperiencesContent = {
  hero: {
    title: "Beyond your Stay",
    subtitle:
      "From how you move to how you live, Ulô connects you to trusted services that make your experience seamless.",
    image: unsplash("1543269865-cbf427effbad", 2400),
  },
  showcase: {
    title: "More Than Where You Stay",
    body: "Your experience extends beyond your home. It's in the people you meet, the places you discover, and the moments you carry with you.",
    slides: [
      card(
        "slide-1",
        "Feel Africa, not just visit",
        "Care, culture, and connection — built into every stay.",
        unsplash("1523301343968-6a6ebf63c672"),
      ),
      card("slide-2", "More than a place to stay", "Local hospitality that feels like home, wherever you are.", "/Eden.jpg"),
      card(
        "slide-3",
        "Every detail, thoughtfully handled",
        "From arrival to departure, we take care of the little things.",
        "/Africanna.jpg",
      ),
    ],
  },
  rows: [
    {
      id: "live-comfortably",
      title: "Live Comfortably",
      subtitle: "Feel at home, with everything handled around you.",
      cards: [
        card("private-chef", "Private Chef Experience", "Meals prepared just for you, in your space", unsplash("1583394293214-28ded15ee548")),
        card("home-care", "Home Care & Laundry", "Stay fresh without lifting a finger", unsplash("1556910103-1c02745aae4d")),
        card("security", "Private Security Support", "Discreet, trusted protection when needed", unsplash("1552058544-f2b08422138a")),
        card("in-home-dining", "In-Home Dining Setup", "Curated meals for special moments", unsplash("1414235077428-338989a2e8c0")),
      ],
    },
    {
      id: "move-with-ease",
      title: "Move With Ease",
      subtitle: "Navigate the city comfortably, confidently, and on your terms.",
      cards: [
        card("city-driver", "City Driver", "Move through the city with ease and local awareness", unsplash("1449965408869-eaa3f722e40d")),
        card("car-hire", "Private Car Hire", "Comfortable, on-demand mobility", unsplash("1502877338535-766e1452684a")),
        card("airport-pickup", "Airport Pickup", "Smooth arrivals, no friction", unsplash("1436491865332-7a61a109cc05")),
        card("boat", "Coastal & Boat Experience", "Explore beyond the shoreline", unsplash("1500375592092-40eb2168fd21")),
        card("helicopter", "Helicopter Transfers", "See the city from above", unsplash("1509316785289-025f5b846b35")),
      ],
    },
    {
      id: "experience-more",
      title: "Experience More",
      subtitle: "Go beyond the surface and into the culture.",
      cards: [
        card("local-guide", "Local Guide", "Your connection to the real city", unsplash("1541963463532-d68292c34b19")),
        card("cultural-tours", "Cultural Tours", "Beyond landmarks, into stories", unsplash("1523805009345-7448845a9e53")),
        card("photography", "Photography", "Capture moments that matter", unsplash("1502920917128-1aa500764cbd")),
        card("event-planning", "Event Planning", "From intimate gatherings to full experiences", unsplash("1519167758481-83f550bb49b3")),
        card("food-tours", "Food & Culinary Tours", "Taste the culture, one dish at a time", unsplash("1504674900247-0877df9cc836")),
      ],
    },
    {
      id: "feel-your-best",
      title: "Feel Your Best",
      subtitle: "Relax, reset, and restore.",
      cards: [
        card("spa", "African Spa Rituals", "Rooted relaxation and body care", unsplash("1544161515-4ab6ce6db874")),
        card("yoga", "African Yoga", "Slow down, stretch, and reconnect", unsplash("1544367567-0f2fcb009e0b")),
        card("hair", "Hair Styling", "From everyday looks to cultural styling", unsplash("1560066984-138dadb4c035")),
        card("makeup", "Makeup Artistry", "For events, special occasions, or shoots", unsplash("1487412720507-e7ab37603c6f")),
        card("barber", "Barber Services", "Sharp cuts, classic care", unsplash("1503951914875-452162b0f3f1")),
      ],
    },
  ],
  earlyAccess: {
    title: "Be among the first to access homes and services across Africa.",
  },
  provider: {
    title: "Offer Your Service on Ulô",
    subtitle: "Do what you're great at, and let it become someone's unforgettable experience.",
    image: unsplash("1521737604893-d14cc237f11d", 1600),
    linkLabel: "Become a Provider →",
  },
};

/** Turns a validation path into words an admin can act on, e.g. "Move With Ease › card 3 › Title". */
export function describeContentPath(content: ExperiencesContent, path: (string | number)[]): string {
  const [section, index, field, subIndex] = path;
  if (section === "hero") return "Hero";
  if (section === "showcase") {
    return field !== undefined && index === "slides" ? `Showcase › slide ${Number(field) + 1}` : "Showcase";
  }
  if (section === "rows" && typeof index === "number") {
    const rowName = content.rows[index]?.title || `row ${index + 1}`;
    return field === "cards" && typeof subIndex === "number" ? `${rowName} › card ${subIndex + 1}` : rowName;
  }
  if (section === "rows") return "Service rows";
  if (section === "earlyAccess") return "Early access";
  if (section === "provider") return "Become a provider";
  return "Experiences page";
}

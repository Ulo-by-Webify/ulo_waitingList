import { z } from "zod";

/**
 * Social networks the site can link to. Safe to import from client components.
 * Order here is the order icons appear on the site. A network with no link is hidden.
 */
export const SOCIAL_NETWORKS = [
  { id: "instagram", label: "Instagram", hosts: ["instagram.com"], placeholder: "https://instagram.com/uloafrica" },
  { id: "facebook", label: "Facebook", hosts: ["facebook.com", "fb.com"], placeholder: "https://facebook.com/uloafrica" },
  { id: "linkedin", label: "LinkedIn", hosts: ["linkedin.com"], placeholder: "https://linkedin.com/company/uloafrica" },
  { id: "x", label: "X (Twitter)", hosts: ["x.com", "twitter.com"], placeholder: "https://x.com/uloafrica" },
  { id: "reddit", label: "Reddit", hosts: ["reddit.com"], placeholder: "https://reddit.com/r/uloafrica" },
  { id: "tiktok", label: "TikTok", hosts: ["tiktok.com"], placeholder: "https://tiktok.com/@uloafrica" },
  { id: "youtube", label: "YouTube", hosts: ["youtube.com", "youtu.be"], placeholder: "https://youtube.com/@uloafrica" },
  { id: "whatsapp", label: "WhatsApp", hosts: ["whatsapp.com", "wa.me"], placeholder: "https://whatsapp.com/channel/…" },
] as const;

export type SocialNetworkId = (typeof SOCIAL_NETWORKS)[number]["id"];
export type SocialLinks = Partial<Record<SocialNetworkId, string>>;

const MAX_URL_LENGTH = 500;

function matchesHost(url: string, hosts: readonly string[]): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return hosts.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
  } catch {
    return false;
  }
}

/** Each link is optional; when given it must be https and on that network's own domain. */
export const socialLinksSchema = z.object(
  Object.fromEntries(
    SOCIAL_NETWORKS.map((network) => [
      network.id,
      z
        .string()
        .trim()
        .max(MAX_URL_LENGTH, `The ${network.label} link is too long`)
        .refine((v) => v === "" || /^https:\/\/\S+$/.test(v), `Use a full https:// link for ${network.label}`)
        .refine((v) => v === "" || matchesHost(v, network.hosts), `That isn't a link to ${network.label}`)
        .optional()
        .transform((v) => v || undefined),
    ]),
  ) as unknown as Record<SocialNetworkId, z.ZodType<string | undefined, z.ZodTypeDef, unknown>>,
);

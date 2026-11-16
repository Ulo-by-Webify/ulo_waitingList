export const SHARE_NETWORKS = ["whatsapp", "facebook", "linkedin", "x", "threads", "copy"] as const;
export type ShareNetwork = (typeof SHARE_NETWORKS)[number];

type ShareTarget = { url: string; title: string };

const enc = encodeURIComponent;

/** Share-intent URLs for each network. None need an app ID or API key. */
export function shareIntentUrl(network: Exclude<ShareNetwork, "copy">, { url, title }: ShareTarget): string {
  switch (network) {
    case "whatsapp":
      return `https://wa.me/?text=${enc(`${title} ${url}`)}`;
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`;
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`;
    case "x":
      return `https://x.com/intent/post?text=${enc(title)}&url=${enc(url)}`;
    case "threads":
      return `https://www.threads.net/intent/post?text=${enc(`${title} ${url}`)}`;
  }
}

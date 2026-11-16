import type { MetadataRoute } from "next";
import { listSitemapPosts } from "@/lib/server/journal-repo";
import { requestOrigin } from "@/lib/server/site-origin";

// Lists journal posts from the database, so build it per request (it's small and cached by crawlers).
export const dynamic = "force-dynamic";

type Entry = MetadataRoute.Sitemap[number];

/** Public pages only. The admin, thank-you page and API are deliberately left out. */
const STATIC_PAGES: { path: string; changeFrequency: Entry["changeFrequency"]; priority: number }[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/experiences", changeFrequency: "weekly", priority: 0.8 },
  { path: "/how-it-works", changeFrequency: "monthly", priority: 0.8 },
  { path: "/journal", changeFrequency: "daily", priority: 0.8 },
  { path: "/begin-your-journey", changeFrequency: "monthly", priority: 0.9 },
];

async function journalEntries(origin: string): Promise<MetadataRoute.Sitemap> {
  try {
    const posts = await listSitemapPosts();
    return posts.map((post) => ({
      url: `${origin}/journal/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "monthly",
      priority: 0.6,
    }));
  } catch (error) {
    // Still serve the main pages if the database is unavailable.
    console.error("[sitemap] could not list journal posts", error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = requestOrigin();
  const pages = STATIC_PAGES.map((page) => ({
    url: `${origin}${page.path === "/" ? "" : page.path}`,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
  return [...pages, ...(await journalEntries(origin))];
}

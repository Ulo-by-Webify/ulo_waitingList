import type { MetadataRoute } from "next";
import { requestOrigin } from "@/lib/server/site-origin";

export const dynamic = "force-dynamic";

/**
 * One group for every crawler (a crawler with its own group ignores "*").
 * /admin pages are NOT disallowed on purpose: crawlers must fetch them to see their noindex tag
 * and header, which is what actually keeps them out of search. API routes are blocked except
 * /api/files, which serves the site's uploaded images.
 */
export default function robots(): MetadataRoute.Robots {
  const origin = requestOrigin();
  return {
    rules: { userAgent: "*", allow: ["/", "/api/files/"], disallow: ["/api/"] },
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}

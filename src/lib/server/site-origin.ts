import "server-only";
import { headers } from "next/headers";
import { siteOrigin } from "@/lib/seo";

/**
 * The public origin for absolute URLs (sitemap, robots). Uses APP_URL; without it, falls back
 * to the request's host so the files still work, and says so in the logs.
 */
export function requestOrigin(): string {
  const configured = siteOrigin();
  if (configured) return configured.origin;
  const host = headers().get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  console.warn("[seo] APP_URL is not set; using the request host for sitemap and robots URLs.");
  return `${protocol}://${host}`;
}

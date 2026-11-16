import { z } from "zod";
import { recordPageView, visitorHash } from "@/lib/server/traffic-repo";
import { isBot, parseUserAgent } from "@/lib/server/user-agent";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";
import { readJson } from "@/lib/server/http";

export const runtime = "nodejs";

const VIEWS_PER_WINDOW = 120;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_TRACK_BYTES = 4 * 1024;
const NO_CONTENT = () => new Response(null, { status: 204 });

const optionalTag = z
  .string()
  .trim()
  .max(100)
  .optional()
  .transform((v) => v || null);

const trackSchema = z.object({
  path: z.string().startsWith("/").max(512),
  referrer: z.string().max(2048).optional(),
  utmSource: optionalTag,
  utmMedium: optionalTag,
  utmCampaign: optionalTag,
});

function referrerHost(referrer: string | undefined, ownHost: string | null): string | null {
  if (!referrer) return null;
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    return host && host !== ownHost?.replace(/^www\./, "").split(":")[0] ? host : null;
  } catch {
    return null;
  }
}

// Geo headers are only present behind a CDN that sets them (Cloudflare, Vercel, Fastly).
function countryFrom(headers: Headers): string | null {
  const code = headers.get("cf-ipcountry") ?? headers.get("x-vercel-ip-country") ?? headers.get("x-country-code");
  return code && /^[A-Z]{2}$/.test(code) && code !== "XX" ? code : null;
}

export async function POST(request: Request) {
  const userAgent = request.headers.get("user-agent") ?? "";
  if (isBot(userAgent)) return NO_CONTENT();

  const ip = clientIp(request);
  if (!rateLimit(`track:${ip}`, VIEWS_PER_WINDOW, WINDOW_MS)) return NO_CONTENT();

  const parsed = trackSchema.safeParse(await readJson(request, MAX_TRACK_BYTES));
  if (!parsed.success || parsed.data.path.startsWith("/admin")) return new Response(null, { status: 400 });

  try {
    await recordPageView(
      {
        path: parsed.data.path,
        referrerHost: referrerHost(parsed.data.referrer, request.headers.get("host")),
        utmSource: parsed.data.utmSource,
        utmMedium: parsed.data.utmMedium,
        utmCampaign: parsed.data.utmCampaign,
        country: countryFrom(request.headers),
        ...parseUserAgent(userAgent),
      },
      visitorHash(ip, userAgent),
    );
  } catch (error) {
    // Analytics must never break the site; log and move on.
    console.error("[track] failed to record page view", error);
  }
  return NO_CONTENT();
}

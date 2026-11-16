import { z } from "zod";
import { incrementShareCount } from "@/lib/server/journal-repo";
import { isBot } from "@/lib/server/user-agent";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";
import { readJson } from "@/lib/server/http";
import { SHARE_NETWORKS } from "@/lib/share";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 256;
const SHARES_PER_IP = 30;
const IP_WINDOW_MS = 10 * 60 * 1000;
/** One counted share per visitor, post and network per day, so the counter can't be pumped. */
const REPEAT_WINDOW_MS = 24 * 60 * 60 * 1000;
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const NO_CONTENT = () => new Response(null, { status: 204 });

const shareSchema = z.object({ network: z.enum(SHARE_NETWORKS) });

/** Records that a visitor shared a post. Always answers 204 so it reveals nothing. */
export async function POST(request: Request, { params }: { params: { slug: string } }) {
  if (!SLUG.test(params.slug) || params.slug.length > 120) return NO_CONTENT();
  if (isBot(request.headers.get("user-agent") ?? "")) return NO_CONTENT();

  const parsed = shareSchema.safeParse(await readJson(request, MAX_BODY_BYTES));
  if (!parsed.success) return NO_CONTENT();

  const ip = clientIp(request);
  if (!rateLimit(`share:${ip}`, SHARES_PER_IP, IP_WINDOW_MS)) return NO_CONTENT();
  if (!rateLimit(`share:${ip}:${params.slug}:${parsed.data.network}`, 1, REPEAT_WINDOW_MS)) return NO_CONTENT();

  try {
    await incrementShareCount(params.slug);
  } catch (error) {
    console.error("[share] could not record share", error);
  }
  return NO_CONTENT();
}

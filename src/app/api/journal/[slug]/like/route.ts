import { cookies } from "next/headers";
import { z } from "zod";
import {
  VISITOR_COOKIE,
  VISITOR_COOKIE_MAX_AGE,
  newVisitorId,
  setLike,
  visitorHashFromCookie,
} from "@/lib/server/engagement-repo";
import { isBot } from "@/lib/server/user-agent";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";
import { fail, ok, readJson, serverError } from "@/lib/server/http";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 128;
const LIKES_PER_WINDOW = 60;
const WINDOW_MS = 10 * 60 * 1000;
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const likeSchema = z.object({ liked: z.boolean() });

/** Likes ({ liked: true }) or unlikes ({ liked: false }) a post for this browser. */
export async function POST(request: Request, { params }: { params: { slug: string } }) {
  if (!SLUG.test(params.slug) || params.slug.length > 120) return fail("Story not found", 404);
  if (isBot(request.headers.get("user-agent") ?? "")) return fail("Not allowed", 403);
  if (!rateLimit(`like:${clientIp(request)}`, LIKES_PER_WINDOW, WINDOW_MS)) {
    return fail("Too many requests. Please try again later.", 429);
  }

  const parsed = likeSchema.safeParse(await readJson(request, MAX_BODY_BYTES));
  if (!parsed.success) return fail("Invalid request", 400);

  const existing = cookies().get(VISITOR_COOKIE)?.value;
  const visitorId = visitorHashFromCookie(existing) ? (existing as string) : newVisitorId();

  try {
    const result = await setLike(params.slug, visitorHashFromCookie(visitorId) as string, parsed.data.liked);
    if (!result) return fail("Story not found", 404);
    const response = ok(result);
    if (visitorId !== existing) {
      response.cookies.set(VISITOR_COOKIE, visitorId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: VISITOR_COOKIE_MAX_AGE,
      });
    }
    return response;
  } catch (error) {
    return serverError("journal-like", error);
  }
}

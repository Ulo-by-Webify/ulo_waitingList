import { commentSchema } from "@/lib/journal";
import { isHoneypotTripped } from "@/lib/validation";
import { addComment } from "@/lib/server/engagement-repo";
import { isBot } from "@/lib/server/user-agent";
import { clientIp, rateLimitPersistent } from "@/lib/server/rate-limit";
import { rejectIfNotHuman } from "@/lib/server/turnstile";
import { TURNSTILE_ACTIONS } from "@/lib/turnstile";
import { fail, ok, readJson, serverError, validationError } from "@/lib/server/http";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 8 * 1024;
const COMMENTS_PER_WINDOW = 5;
const WINDOW_MS = 10 * 60 * 1000;
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Posts a public comment. It shows immediately; admins can hide or delete it. */
export async function POST(request: Request, { params }: { params: { slug: string } }) {
  if (!SLUG.test(params.slug) || params.slug.length > 120) return fail("Story not found", 404);
  if (isBot(request.headers.get("user-agent") ?? "")) return fail("Not allowed", 403);
  if (!(await rateLimitPersistent(`comment:${clientIp(request)}`, COMMENTS_PER_WINDOW, WINDOW_MS))) {
    return fail("You're commenting too quickly. Please wait a few minutes and try again.", 429);
  }

  const body = await readJson(request, MAX_BODY_BYTES);
  // Bots fill the hidden field: acknowledge, store nothing.
  if (isHoneypotTripped(body)) return ok({ comment: null }, 201);
  const notHuman = await rejectIfNotHuman(body, clientIp(request), TURNSTILE_ACTIONS.comment);
  if (notHuman) return notHuman;

  const parsed = commentSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  try {
    const comment = await addComment(params.slug, parsed.data);
    if (!comment) return fail("Story not found", 404);
    return ok({ comment }, 201);
  } catch (error) {
    return serverError("journal-comment", error);
  }
}

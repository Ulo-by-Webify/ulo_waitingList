import { waitlistSchema, isHoneypotTripped } from "@/lib/validation";
import { createSignup } from "@/lib/server/waitlist-repo";
import { clientIp, rateLimitPersistent } from "@/lib/server/rate-limit";
import { rejectIfNotHuman } from "@/lib/server/turnstile";
import { TURNSTILE_ACTIONS } from "@/lib/turnstile";
import { fail, ok, readJson, serverError, validationError } from "@/lib/server/http";

export const runtime = "nodejs";

const SUBMISSIONS_PER_WINDOW = 10;
const WINDOW_MS = 10 * 60 * 1000;
const ALREADY_JOINED = "This email is already on the waitlist. We'll let you know the moment we open.";

export async function POST(request: Request) {
  if (!(await rateLimitPersistent(`waitlist:${clientIp(request)}`, SUBMISSIONS_PER_WINDOW, WINDOW_MS))) {
    return fail("Too many requests. Please try again later.", 429);
  }

  const body = await readJson(request);
  if (isHoneypotTripped(body)) return ok({ joined: true }, 201);
  const notHuman = await rejectIfNotHuman(body, clientIp(request), TURNSTILE_ACTIONS.waitlist);
  if (notHuman) return notHuman;

  const parsed = waitlistSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  try {
    // One signup per email across every type. Telling people they're already in is friendlier than a
    // silent success; the per-IP rate limit above keeps this from being used to check lists of emails.
    const created = await createSignup(parsed.data);
    if (!created) return fail(ALREADY_JOINED, 409);
    return ok({ joined: true }, 201);
  } catch (error) {
    return serverError("waitlist", error);
  }
}

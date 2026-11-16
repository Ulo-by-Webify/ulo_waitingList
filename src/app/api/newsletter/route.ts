import { newsletterSchema, isHoneypotTripped } from "@/lib/validation";
import { createSubscriber } from "@/lib/server/waitlist-repo";
import { clientIp, rateLimitPersistent } from "@/lib/server/rate-limit";
import { rejectIfNotHuman } from "@/lib/server/turnstile";
import { TURNSTILE_ACTIONS } from "@/lib/turnstile";
import { fail, ok, readJson, serverError, validationError } from "@/lib/server/http";

export const runtime = "nodejs";

const SUBMISSIONS_PER_WINDOW = 10;
const WINDOW_MS = 10 * 60 * 1000;

export async function POST(request: Request) {
  if (!(await rateLimitPersistent(`newsletter:${clientIp(request)}`, SUBMISSIONS_PER_WINDOW, WINDOW_MS))) {
    return fail("Too many requests. Please try again later.", 429);
  }

  const body = await readJson(request);
  if (isHoneypotTripped(body)) return ok({ subscribed: true }, 201);
  const notHuman = await rejectIfNotHuman(body, clientIp(request), TURNSTILE_ACTIONS.newsletter);
  if (notHuman) return notHuman;

  const parsed = newsletterSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  try {
    await createSubscriber(parsed.data);
    return ok({ subscribed: true }, 201);
  } catch (error) {
    return serverError("newsletter", error);
  }
}

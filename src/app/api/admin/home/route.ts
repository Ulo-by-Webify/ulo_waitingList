import { homeContentSchema } from "@/lib/home-content";
import { resetHomeContent, saveHomeContent } from "@/lib/server/home-repo";
import { isResponse, requireApi } from "@/lib/server/admin-guard";
import { ok, readJson, serverError, validationError } from "@/lib/server/http";

export const runtime = "nodejs";

/** Saves the whole homepage. Goes live straight away. */
export async function PUT(request: Request) {
  const auth = await requireApi("site");
  if (isResponse(auth)) return auth;
  const parsed = homeContentSchema.safeParse(await readJson(request));
  if (!parsed.success) return validationError(parsed.error);
  try {
    await saveHomeContent(parsed.data, auth.admin.id);
    return ok(parsed.data);
  } catch (error) {
    return serverError("home-save", error);
  }
}

/** Puts the homepage back to its built-in content. */
export async function DELETE() {
  const auth = await requireApi("site");
  if (isResponse(auth)) return auth;
  try {
    await resetHomeContent();
    return ok({ reset: true });
  } catch (error) {
    return serverError("home-reset", error);
  }
}

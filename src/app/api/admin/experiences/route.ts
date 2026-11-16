import { experiencesContentSchema } from "@/lib/experiences-content";
import { resetExperiencesContent, saveExperiencesContent } from "@/lib/server/experiences-repo";
import { isResponse, requireApi } from "@/lib/server/admin-guard";
import { ok, readJson, serverError, validationError } from "@/lib/server/http";

export const runtime = "nodejs";

/** Saves the whole Experiences page. Goes live straight away. */
export async function PUT(request: Request) {
  const auth = await requireApi("site");
  if (isResponse(auth)) return auth;
  const parsed = experiencesContentSchema.safeParse(await readJson(request));
  if (!parsed.success) return validationError(parsed.error);
  try {
    await saveExperiencesContent(parsed.data, auth.admin.id);
    return ok(parsed.data);
  } catch (error) {
    return serverError("experiences-save", error);
  }
}

/** Puts the Experiences page back to its built-in content. */
export async function DELETE() {
  const auth = await requireApi("site");
  if (isResponse(auth)) return auth;
  try {
    await resetExperiencesContent();
    return ok({ reset: true });
  } catch (error) {
    return serverError("experiences-reset", error);
  }
}

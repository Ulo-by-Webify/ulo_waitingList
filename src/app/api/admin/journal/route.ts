import { journalPostSchema } from "@/lib/journal";
import { createPost } from "@/lib/server/journal-repo";
import { refreshJournalCache } from "@/lib/server/journal-cache";
import { isResponse, requireApi } from "@/lib/server/admin-guard";
import { fail, ok, readJson, serverError, validationError } from "@/lib/server/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = await requireApi("journal");
  if (isResponse(auth)) return auth;
  const parsed = journalPostSchema.safeParse(await readJson(request));
  if (!parsed.success) return validationError(parsed.error);

  try {
    const result = await createPost(parsed.data);
    if ("error" in result) {
      return result.error === "unknown-category"
        ? fail("Choose a category from the list", 400)
        : fail("Another post already uses this URL slug", 409);
    }
    refreshJournalCache();
    return ok({ id: result.post.id, slug: result.post.slug, status: result.post.status }, 201);
  } catch (error) {
    return serverError("journal-create", error);
  }
}

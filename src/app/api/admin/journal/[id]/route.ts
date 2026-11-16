import { journalPostSchema } from "@/lib/journal";
import { deletePost, updatePost } from "@/lib/server/journal-repo";
import { refreshJournalCache } from "@/lib/server/journal-cache";
import { isResponse, requireApi } from "@/lib/server/admin-guard";
import { fail, ok, readJson, serverError, validationError } from "@/lib/server/http";
import { isUuid } from "@/lib/ids";

export const runtime = "nodejs";

type Params = { params: { id: string } };

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireApi("journal");
  if (isResponse(auth)) return auth;
  if (!isUuid(params.id)) return fail("Invalid id", 400);
  const parsed = journalPostSchema.safeParse(await readJson(request));
  if (!parsed.success) return validationError(parsed.error);

  try {
    const result = await updatePost(params.id, parsed.data);
    if ("error" in result) {
      if (result.error === "slug-taken") return fail("Another post already uses this URL slug", 409);
      if (result.error === "unknown-category") return fail("Choose a category from the list", 400);
      return fail("Post not found", 404);
    }
    refreshJournalCache();
    return ok({ id: result.post.id, slug: result.post.slug, status: result.post.status, publishedAt: result.post.publishedAt });
  } catch (error) {
    return serverError("journal-update", error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requireApi("journal");
  if (isResponse(auth)) return auth;
  if (!isUuid(params.id)) return fail("Invalid id", 400);
  try {
    if (!(await deletePost(params.id))) return fail("Post not found", 404);
    refreshJournalCache();
    return ok({ id: params.id });
  } catch (error) {
    return serverError("journal-delete", error);
  }
}

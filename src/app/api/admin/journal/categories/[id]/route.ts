import { categoryNameSchema } from "@/lib/journal";
import { deleteCategory, renameCategory } from "@/lib/server/category-repo";
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
  const parsed = categoryNameSchema.safeParse(await readJson(request));
  if (!parsed.success) return validationError(parsed.error);
  try {
    const result = await renameCategory(params.id, parsed.data.name);
    if ("error" in result) {
      return result.error === "name-taken"
        ? fail("A category with that name already exists", 409)
        : fail("Category not found", 404);
    }
    refreshJournalCache();
    return ok(result.category);
  } catch (error) {
    return serverError("category-rename", error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requireApi("journal");
  if (isResponse(auth)) return auth;
  if (!isUuid(params.id)) return fail("Invalid id", 400);
  try {
    const result = await deleteCategory(params.id);
    if ("error" in result) {
      if (result.error === "in-use") {
        const n = result.postCount;
        return fail(
          n ? `This category is used by ${n} post${n === 1 ? "" : "s"}. Move them to another category first.` : "This category is still in use.",
          409,
        );
      }
      return fail("Category not found", 404);
    }
    return ok({ id: params.id });
  } catch (error) {
    return serverError("category-delete", error);
  }
}

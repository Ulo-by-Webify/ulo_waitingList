import { categoryNameSchema } from "@/lib/journal";
import { createCategory, listCategories } from "@/lib/server/category-repo";
import { isResponse, requireApi } from "@/lib/server/admin-guard";
import { fail, ok, readJson, serverError, validationError } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireApi("journal");
  if (isResponse(auth)) return auth;
  try {
    return ok(await listCategories());
  } catch (error) {
    return serverError("category-list", error);
  }
}

export async function POST(request: Request) {
  const auth = await requireApi("journal");
  if (isResponse(auth)) return auth;
  const parsed = categoryNameSchema.safeParse(await readJson(request));
  if (!parsed.success) return validationError(parsed.error);
  try {
    const result = await createCategory(parsed.data.name);
    if ("error" in result) return fail("A category with that name already exists", 409);
    return ok(result.category, 201);
  } catch (error) {
    return serverError("category-create", error);
  }
}

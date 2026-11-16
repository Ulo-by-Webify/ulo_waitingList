import { deleteSignup } from "@/lib/server/waitlist-repo";
import { fail, ok, serverError } from "@/lib/server/http";
import { isResponse, requireApi } from "@/lib/server/admin-guard";
import { isUuid } from "@/lib/ids";

export const runtime = "nodejs";

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const auth = await requireApi("waitlist");
  if (isResponse(auth)) return auth;
  if (!isUuid(params.id)) return fail("Invalid id", 400);
  try {
    const deleted = await deleteSignup(params.id);
    return deleted ? ok({ id: params.id }) : fail("Not found", 404);
  } catch (error) {
    return serverError("admin-delete-signup", error);
  }
}

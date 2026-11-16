import { z } from "zod";
import { COMMENT_STATUSES } from "@/lib/journal";
import { deleteComment, setCommentStatus } from "@/lib/server/engagement-repo";
import { isResponse, requireApi } from "@/lib/server/admin-guard";
import { fail, ok, readJson, serverError } from "@/lib/server/http";
import { isUuid } from "@/lib/ids";

export const runtime = "nodejs";

type Params = { params: { id: string } };

const statusSchema = z.object({ status: z.enum(COMMENT_STATUSES) });

/** Hides a comment from the public site, or shows it again. */
export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireApi("journal");
  if (isResponse(auth)) return auth;
  if (!isUuid(params.id)) return fail("Invalid id", 400);
  const parsed = statusSchema.safeParse(await readJson(request));
  if (!parsed.success) return fail("Status must be visible or hidden", 400);
  try {
    if (!(await setCommentStatus(params.id, parsed.data.status))) return fail("Comment not found", 404);
    return ok({ id: params.id, status: parsed.data.status });
  } catch (error) {
    return serverError("comment-status", error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requireApi("journal");
  if (isResponse(auth)) return auth;
  if (!isUuid(params.id)) return fail("Invalid id", 400);
  try {
    if (!(await deleteComment(params.id))) return fail("Comment not found", 404);
    return ok({ id: params.id });
  } catch (error) {
    return serverError("comment-delete", error);
  }
}

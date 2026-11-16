import { z } from "zod";
import { isSiteImageKey, siteImageUrlSchema } from "@/lib/site-settings";
import { resetSiteImage, setSiteImage } from "@/lib/server/settings-repo";
import { isResponse, requireApi } from "@/lib/server/admin-guard";
import { fail, ok, readJson, serverError, validationError } from "@/lib/server/http";

export const runtime = "nodejs";

type Params = { params: { key: string } };

const updateSchema = z.object({ url: siteImageUrlSchema });

/** Sets a site image to a new URL. */
export async function PUT(request: Request, { params }: Params) {
  const auth = await requireApi("site");
  if (isResponse(auth)) return auth;
  if (!isSiteImageKey(params.key)) return fail("Unknown site image", 404);
  const parsed = updateSchema.safeParse(await readJson(request));
  if (!parsed.success) return validationError(parsed.error);
  try {
    await setSiteImage(params.key, parsed.data.url, auth.admin.id);
    return ok({ key: params.key, url: parsed.data.url, isCustom: true });
  } catch (error) {
    return serverError("site-image-update", error);
  }
}

/** Resets a site image to the built-in default. */
export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requireApi("site");
  if (isResponse(auth)) return auth;
  if (!isSiteImageKey(params.key)) return fail("Unknown site image", 404);
  try {
    await resetSiteImage(params.key);
    return ok({ key: params.key, isCustom: false });
  } catch (error) {
    return serverError("site-image-reset", error);
  }
}

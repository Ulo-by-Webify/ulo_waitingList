import { socialLinksSchema, type SocialLinks } from "@/lib/social-links";
import { setSocialLinks } from "@/lib/server/settings-repo";
import { isResponse, requireApi } from "@/lib/server/admin-guard";
import { ok, readJson, serverError, validationError } from "@/lib/server/http";

export const runtime = "nodejs";

/** Saves all social links at once. Blank links remove that network from the site. */
export async function PUT(request: Request) {
  const auth = await requireApi("site");
  if (isResponse(auth)) return auth;
  const parsed = socialLinksSchema.safeParse(await readJson(request));
  if (!parsed.success) return validationError(parsed.error);
  try {
    const links = parsed.data as SocialLinks;
    await setSocialLinks(links, auth.admin.id);
    return ok(links);
  } catch (error) {
    return serverError("site-social-links", error);
  }
}

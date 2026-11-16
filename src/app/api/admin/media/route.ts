import { z } from "zod";
import {
  MAX_UPLOAD_BYTES,
  deleteMedia,
  isStorageConfigured,
  listMedia,
  publicMediaUrl,
  uploadMedia,
} from "@/lib/server/storage";
import { clearCoverImage } from "@/lib/server/journal-repo";
import { refreshJournalCache } from "@/lib/server/journal-cache";
import { resetSettingsUsing } from "@/lib/server/settings-repo";
import { replaceExperiencesImage } from "@/lib/server/experiences-repo";
import { replaceHomeImage } from "@/lib/server/home-repo";
import { fail, ok, readJson, serverError } from "@/lib/server/http";
import { isResponse, requireApi } from "@/lib/server/admin-guard";
import { detectFileType } from "@/lib/server/file-type";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MULTIPART_OVERHEAD_BYTES = 64 * 1024;
const NOT_CONFIGURED = "Storage bucket is not configured. Add the Railway bucket credentials to the environment.";

export async function GET() {
  const auth = await requireApi("media");
  if (isResponse(auth)) return auth;
  if (!isStorageConfigured()) return fail(NOT_CONFIGURED, 503);
  try {
    return ok(await listMedia());
  } catch (error) {
    return serverError("admin-media-list", error);
  }
}

export async function POST(request: Request) {
  const auth = await requireApi("media");
  if (isResponse(auth)) return auth;
  if (!isStorageConfigured()) return fail(NOT_CONFIGURED, 503);
  // Reject oversized bodies before buffering the multipart payload.
  if (Number(request.headers.get("content-length")) > MAX_UPLOAD_BYTES + MULTIPART_OVERHEAD_BYTES) {
    return fail("File is larger than 10 MB", 413);
  }

  let file: FormDataEntryValue | null;
  try {
    file = (await request.formData()).get("file");
  } catch {
    return fail("Expected multipart form data with a 'file' field", 400);
  }
  if (!(file instanceof File) || file.size === 0) return fail("No file provided", 400);
  if (file.size > MAX_UPLOAD_BYTES) return fail("File is larger than 10 MB", 413);

  const bytes = Buffer.from(await file.arrayBuffer());
  const detected = detectFileType(bytes);
  if (!detected) {
    return fail("Unsupported file type. Upload a JPG, PNG, WebP, GIF, MP4, WebM or PDF.", 415);
  }

  try {
    return ok(await uploadMedia({ bytes, contentType: detected.mime, extension: detected.extension, originalName: file.name }), 201);
  } catch (error) {
    return serverError("admin-media-upload", error);
  }
}

const deleteSchema = z.object({ key: z.string().min(1).max(512) });

export async function DELETE(request: Request) {
  const auth = await requireApi("media");
  if (isResponse(auth)) return auth;
  if (!isStorageConfigured()) return fail(NOT_CONFIGURED, 503);
  const parsed = deleteSchema.safeParse(await readJson(request));
  if (!parsed.success) return fail("A media key is required", 400);
  try {
    await deleteMedia(parsed.data.key);
    const url = publicMediaUrl(parsed.data.key);
    const [postsUpdated, siteImagesReset, experienceImagesReplaced, homeImagesReplaced] = await Promise.all([
      clearCoverImage(url),
      resetSettingsUsing(url),
      replaceExperiencesImage(url),
      replaceHomeImage(url),
    ]);
    if (postsUpdated) refreshJournalCache();
    return ok({ key: parsed.data.key, postsUpdated, siteImagesReset, experienceImagesReplaced, homeImagesReplaced });
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid media key") return fail(error.message, 400);
    return serverError("admin-media-delete", error);
  }
}

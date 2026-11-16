import { Readable } from "node:stream";
import type { ReadableStream as NodeReadableStream } from "node:stream/web";
import { MAX_VIDEO_UPLOAD_BYTES, isStorageConfigured, uploadMediaStream } from "@/lib/server/storage";
import { detectFileType } from "@/lib/server/file-type";
import { limitBytes, peekHead } from "@/lib/server/upload-stream";
import { isResponse, requireApi } from "@/lib/server/admin-guard";
import { fail, ok, serverError } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Enough of the file to recognise MP4 / WebM from its contents. */
const HEAD_BYTES = 16;
const MAX_MB = MAX_VIDEO_UPLOAD_BYTES / (1024 * 1024);
const NOT_CONFIGURED = "Storage bucket is not configured. Add the Railway bucket credentials to the environment.";

function fileNameFrom(request: Request): string {
  const raw = request.headers.get("x-file-name") ?? "";
  try {
    return decodeURIComponent(raw).slice(0, 200) || "video";
  } catch {
    return "video";
  }
}

/**
 * Uploads a video. The raw file is the request body (not multipart) and is streamed to the bucket,
 * so large films never sit in server memory. Its type is checked from its first bytes.
 */
export async function POST(request: Request) {
  const auth = await requireApi("media");
  if (isResponse(auth)) return auth;
  if (!isStorageConfigured()) return fail(NOT_CONFIGURED, 503);

  const contentLength = Number(request.headers.get("content-length"));
  if (!Number.isInteger(contentLength) || contentLength <= 0) return fail("The upload is missing its file size", 411);
  if (contentLength > MAX_VIDEO_UPLOAD_BYTES) return fail(`Video is larger than ${MAX_MB} MB`, 413);
  if (!request.body) return fail("No file provided", 400);

  try {
    const { head, stream } = await peekHead(request.body, HEAD_BYTES);
    const detected = detectFileType(head);
    if (!detected || !detected.mime.startsWith("video/")) {
      await stream.cancel().catch(() => undefined);
      return fail("Unsupported video. Upload an MP4 or WebM file.", 415);
    }

    const body = Readable.fromWeb(limitBytes(stream, contentLength) as unknown as NodeReadableStream<Uint8Array>);
    const uploaded = await uploadMediaStream({
      body,
      contentLength,
      contentType: detected.mime,
      extension: detected.extension,
      originalName: fileNameFrom(request),
    });
    return ok(uploaded, 201);
  } catch (error) {
    return serverError("admin-media-video-upload", error);
  }
}

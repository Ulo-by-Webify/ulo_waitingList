import { getMediaObject, isStorageConfigured, isValidMediaKey } from "@/lib/server/storage";

export const runtime = "nodejs";

/** A single "bytes=start-end" range (what browsers send for video). Anything else is served whole. */
const SINGLE_RANGE = /^bytes=(\d*)-(\d*)$/;

function requestedRange(request: Request): string | undefined {
  const range = request.headers.get("range")?.trim();
  if (!range) return undefined;
  const match = SINGLE_RANGE.exec(range);
  return match && (match[1] || match[2]) ? range : undefined;
}

// Serves bucket files under media/ publicly so published posts get stable image URLs.
// Keys include an upload timestamp, so responses can be cached as immutable.
// Supports Range requests: Safari won't play video without them, and they let viewers seek.
export async function GET(request: Request, { params }: { params: { key: string[] } }) {
  const key = params.key.map(decodeURIComponent).join("/");
  if (!isValidMediaKey(key) || !isStorageConfigured()) return new Response("Not found", { status: 404 });

  const range = requestedRange(request);
  try {
    const object = await getMediaObject(key, range);
    if (!object.Body) return new Response("Not found", { status: 404 });
    const isPartial = Boolean(range && object.ContentRange);
    return new Response(object.Body.transformToWebStream(), {
      status: isPartial ? 206 : 200,
      headers: {
        "Content-Type": object.ContentType ?? "application/octet-stream",
        ...(object.ContentLength !== undefined ? { "Content-Length": String(object.ContentLength) } : {}),
        ...(isPartial ? { "Content-Range": object.ContentRange as string } : {}),
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        // SVGs can carry script; force them to render as images only.
        "Content-Security-Policy": "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox",
      },
    });
  } catch (error) {
    const name = (error as { name?: string }).name;
    if (name === "NoSuchKey") return new Response("Not found", { status: 404 });
    if (name === "InvalidRange") return new Response("Range not satisfiable", { status: 416 });
    console.error("[files] failed to read", key, error);
    return new Response("Error", { status: 500 });
  }
}

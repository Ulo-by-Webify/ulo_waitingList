import "server-only";

/**
 * Identifies an upload from its leading bytes ("magic numbers") rather than trusting the
 * browser-supplied MIME type or filename. Only the formats below are accepted; SVG is
 * deliberately excluded because it can carry script.
 */
export type DetectedType = { mime: string; extension: string };

const startsWith = (bytes: Uint8Array, signature: number[], offset = 0) =>
  signature.every((byte, i) => bytes[offset + i] === byte);

const ascii = (bytes: Uint8Array, start: number, end: number) => String.fromCharCode(...bytes.subarray(start, end));

export function detectFileType(bytes: Uint8Array): DetectedType | null {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return { mime: "image/jpeg", extension: "jpg" };
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return { mime: "image/png", extension: "png" };
  if (ascii(bytes, 0, 6) === "GIF87a" || ascii(bytes, 0, 6) === "GIF89a") return { mime: "image/gif", extension: "gif" };
  if (ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 12) === "WEBP") return { mime: "image/webp", extension: "webp" };
  if (ascii(bytes, 0, 5) === "%PDF-") return { mime: "application/pdf", extension: "pdf" };
  if (startsWith(bytes, [0x1a, 0x45, 0xdf, 0xa3])) return { mime: "video/webm", extension: "webm" };
  // ISO base media (MP4/MOV): "ftyp" box at offset 4 with a known MP4 brand.
  if (ascii(bytes, 4, 8) === "ftyp" && /^(isom|iso2|mp41|mp42|avc1|M4V |dash)$/.test(ascii(bytes, 8, 12))) {
    return { mime: "video/mp4", extension: "mp4" };
  }
  return null;
}

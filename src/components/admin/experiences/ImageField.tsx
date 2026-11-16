"use client";

import { useRef, useState, type FormEvent } from "react";
import { ArrowPathIcon, ArrowUpTrayIcon, LinkIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { siteImageUrlSchema } from "@/lib/site-settings";
import { adminInputClass } from "../PasswordInput";
import MediaPickerDialog from "../site/MediaPickerDialog";

type ImageFieldProps = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  /** Upload and Media need storage set up and the media permission. A link always works. */
  canUpload: boolean;
  shape?: "landscape" | "portrait";
  hint?: string;
};

const ACCEPT = "image/jpeg,image/png,image/webp";
const smallButtonClass =
  "inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50";

/** Image preview with Upload / Choose from Media / Use a link. Changes are saved with the page. */
export default function ImageField({ label, value, onChange, canUpload, shape = "landscape", hint }: ImageFieldProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [link, setLink] = useState("");
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  async function upload(file: File | undefined) {
    if (!file) return;
    setIsUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch("/api/admin/media", { method: "POST", body: form });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error ?? "Upload failed");
      onChange(body.data.publicUrl);
      toast.success("Image uploaded. Save the page to publish it.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function saveLink(event: FormEvent) {
    event.preventDefault();
    const parsed = siteImageUrlSchema.safeParse(link);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Enter a valid image link");
      return;
    }
    onChange(parsed.data);
    setLink("");
    setIsLinkOpen(false);
  }

  const previewClass = shape === "portrait" ? "aspect-[3/4] w-28" : "aspect-video w-44";

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <div className="flex flex-wrap items-start gap-4">
        <div className={`relative shrink-0 overflow-hidden rounded-xl bg-gray-100 ${previewClass}`}>
          {failedUrl === value ? (
            <div className="flex h-full flex-col items-center justify-center gap-1 p-2 text-center text-[11px] text-gray-500">
              <PhotoIcon className="h-6 w-6 text-gray-300" aria-hidden="true" />
              Couldn&apos;t load. The site shows the default Ulô image.
            </div>
          ) : (
            <img key={value} src={value} alt="" className="h-full w-full object-cover" onError={() => setFailedUrl(value)} />
          )}
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
              <ArrowPathIcon className="h-5 w-5 animate-spin text-gray-700" aria-hidden="true" />
              <span className="sr-only">Uploading…</span>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap gap-2">
            {canUpload && (
              <>
                <button type="button" disabled={isUploading} onClick={() => fileRef.current?.click()} className={smallButtonClass}>
                  <ArrowUpTrayIcon className="h-3.5 w-3.5" aria-hidden="true" /> Upload
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept={ACCEPT}
                  className="hidden"
                  tabIndex={-1}
                  aria-hidden="true"
                  onChange={(e) => upload(e.target.files?.[0])}
                />
                <button type="button" disabled={isUploading} onClick={() => setIsPickerOpen(true)} className={smallButtonClass}>
                  <PhotoIcon className="h-3.5 w-3.5" aria-hidden="true" /> Media
                </button>
              </>
            )}
            <button
              type="button"
              disabled={isUploading}
              onClick={() => setIsLinkOpen((open) => !open)}
              aria-expanded={isLinkOpen}
              className={smallButtonClass}
            >
              <LinkIcon className="h-3.5 w-3.5" aria-hidden="true" /> Link
            </button>
          </div>

          {isLinkOpen && (
            <form onSubmit={saveLink} className="flex gap-2">
              <input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://… or /image.jpg"
                aria-label={`${label} link`}
                className={`${adminInputClass} py-2`}
                autoFocus
              />
              <button type="submit" className="shrink-0 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
                Use
              </button>
            </form>
          )}
          {hint && <p className="text-xs text-gray-400">{hint}</p>}
        </div>
      </div>

      {canUpload && (
        <MediaPickerDialog
          open={isPickerOpen}
          onOpenChange={setIsPickerOpen}
          onPick={(url) => {
            setIsPickerOpen(false);
            onChange(url);
          }}
        />
      )}
    </div>
  );
}

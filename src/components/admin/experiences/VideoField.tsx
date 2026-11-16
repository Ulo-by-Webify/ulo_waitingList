"use client";

import { useRef, useState, type FormEvent } from "react";
import { ArrowUpTrayIcon, FilmIcon, LinkIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { siteImageUrlSchema } from "@/lib/site-settings";
import { adminInputClass } from "../PasswordInput";
import MediaPickerDialog from "../site/MediaPickerDialog";
import { MAX_VIDEO_MB, VIDEO_ACCEPT, uploadVideo } from "../media/upload-video";

type VideoFieldProps = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  /** Upload and Media need storage set up and the media permission. A link always works. */
  canUpload: boolean;
  hint?: string;
};

const smallButtonClass =
  "inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50";

/** Video preview with Upload (with progress) / Choose from Media / Use a link. Changes are saved with the page. */
export default function VideoField({ label, value, onChange, canUpload, hint }: VideoFieldProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [link, setLink] = useState("");
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const isUploading = progress !== null;

  async function upload(file: File | undefined) {
    if (!file) return;
    setProgress(0);
    try {
      const uploaded = await uploadVideo(file, setProgress);
      onChange(uploaded.publicUrl);
      toast.success("Video uploaded. Save the page to publish it.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Video upload failed");
    } finally {
      setProgress(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function saveLink(event: FormEvent) {
    event.preventDefault();
    const parsed = siteImageUrlSchema.safeParse(link);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Enter a valid video link");
      return;
    }
    onChange(parsed.data);
    setLink("");
    setIsLinkOpen(false);
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <div className="flex flex-wrap items-start gap-4">
        <div className="relative aspect-video w-56 shrink-0 overflow-hidden rounded-xl bg-gray-900">
          {failedUrl === value ? (
            <div className="flex h-full flex-col items-center justify-center gap-1 p-3 text-center text-[11px] text-gray-300">
              <FilmIcon className="h-6 w-6 text-gray-500" aria-hidden="true" />
              Couldn&apos;t load this video. Check the link or upload it again.
            </div>
          ) : (
            <video
              key={value}
              src={value}
              muted
              playsInline
              controls
              preload="metadata"
              onError={() => setFailedUrl(value)}
              className="h-full w-full object-cover"
            />
          )}
          {isUploading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-900/80 px-6 text-white" role="status">
              <span className="text-sm font-medium tabular-nums">Uploading… {progress}%</span>
              <span className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                <span className="block h-full rounded-full bg-white transition-[width]" style={{ width: `${progress}%` }} />
              </span>
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
                  accept={VIDEO_ACCEPT}
                  className="hidden"
                  tabIndex={-1}
                  aria-hidden="true"
                  onChange={(e) => upload(e.target.files?.[0])}
                />
                <button type="button" disabled={isUploading} onClick={() => setIsPickerOpen(true)} className={smallButtonClass}>
                  <FilmIcon className="h-3.5 w-3.5" aria-hidden="true" /> Media
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
                placeholder="https://… or /videos/film.mp4"
                aria-label={`${label} link`}
                className={`${adminInputClass} py-2`}
                autoFocus
              />
              <button type="submit" className="shrink-0 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
                Use
              </button>
            </form>
          )}
          <p className="text-xs text-gray-400">
            {hint ? `${hint} ` : ""}MP4 or WebM, up to {MAX_VIDEO_MB} MB.
          </p>
        </div>
      </div>

      {canUpload && (
        <MediaPickerDialog
          kind="video"
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

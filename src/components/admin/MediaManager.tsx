"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useConfirm } from "./ConfirmDialog";
import EmptyState from "./EmptyState";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { MAX_VIDEO_MB, uploadVideo } from "./media/upload-video";

type MediaObject = { key: string; name: string; size: number; lastModified: string; url: string; publicUrl: string };

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,application/pdf";
const IMAGE_EXT = /\.(jpe?g|png|webp|gif)$/i;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaManager() {
  const [items, setItems] = useState<MediaObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [confirm, confirmDialog] = useConfirm();

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await fetch("/api/admin/media", { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Could not load media");
      setItems(body.data);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Could not load media");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleUpload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        // Videos stream to their own endpoint, which allows much larger files.
        if (file.type.startsWith("video/")) {
          try {
            const uploaded = await uploadVideo(file);
            setItems((prev) => [uploaded, ...prev]);
            toast.success(`Uploaded ${file.name}`);
          } catch (error) {
            toast.error(`${file.name}: ${error instanceof Error ? error.message : "upload failed"}`);
          }
          continue;
        }
        const form = new FormData();
        form.append("file", file);
        const response = await fetch("/api/admin/media", { method: "POST", body: form });
        const body = await response.json().catch(() => ({}));
        if (!response.ok) {
          toast.error(`${file.name}: ${body.error ?? "upload failed"}`);
          continue;
        }
        setItems((prev) => [body.data, ...prev]);
        toast.success(`Uploaded ${file.name}`);
      }
    } catch {
      toast.error("Network error during upload");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleDelete(item: MediaObject) {
    const confirmed = await confirm({
      title: "Delete this file?",
      description: `${item.name} will be removed from storage. Journal posts and site images using it will switch back to their defaults. This can't be undone.`,
    });
    if (!confirmed) return;
    try {
      const response = await fetch("/api/admin/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: item.key }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(body.error ?? "Delete failed");
        return;
      }
      setItems((prev) => prev.filter((i) => i.key !== item.key));
      const postsUpdated: number = body.data?.postsUpdated ?? 0;
      const siteImagesReset: number = body.data?.siteImagesReset ?? 0;
      const notes = [
        postsUpdated && `${postsUpdated} post${postsUpdated === 1 ? " now uses" : "s now use"} the default cover`,
        siteImagesReset && `${siteImagesReset} site image${siteImagesReset === 1 ? " was" : "s were"} reset to the original`,
      ].filter(Boolean);
      toast.success(notes.length ? `Deleted. ${notes.join("; ")}.` : "Deleted");
    } catch {
      toast.error("Network error. Try again.");
    }
  }

  async function copyLink(url: string) {
    try {
      await navigator.clipboard.writeText(new URL(url, window.location.origin).toString());
      toast.success("Public link copied");
    } catch {
      toast.error("Could not copy link");
    }
  }

  return (
    <div className="space-y-6">
      {confirmDialog}
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white px-6 py-10 text-center hover:border-primary/50">
        <span className="text-sm font-medium text-gray-900">
          {uploading ? "Uploading…" : "Click to upload files"}
        </span>
        <span className="mt-1 text-xs text-gray-500">Images and PDFs up to 10 MB · MP4/WebM video up to {MAX_VIDEO_MB} MB</span>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT}
          disabled={uploading}
          className="sr-only"
          onChange={(e) => handleUpload(e.target.files)}
        />
      </label>

      {loading && <p className="text-sm text-gray-500">Loading files…</p>}
      {loadError && (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {loadError}{" "}
          <button type="button" onClick={load} className="underline">
            Retry
          </button>
        </div>
      )}
      {!loading && !loadError && items.length === 0 && (
        <EmptyState
          icon={PhotoIcon}
          title="No files yet"
          description="Upload images, video or PDFs above. You can then copy a public link to use in journal posts."
        />
      )}

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li key={item.key} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="flex aspect-video items-center justify-center bg-gray-50">
              {IMAGE_EXT.test(item.name) ? (
                <img src={item.url} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
              ) : (
                <span className="text-xs uppercase text-gray-400">{item.name.split(".").pop()}</span>
              )}
            </div>
            <div className="space-y-2 p-4">
              <p className="truncate text-sm font-medium text-gray-900" title={item.name}>
                {item.name}
              </p>
              <p className="text-xs text-gray-500">{formatBytes(item.size)}</p>
              <div className="flex gap-4 text-xs font-medium">
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-gray-900 hover:underline">
                  Open
                </a>
                <button type="button" onClick={() => copyLink(item.publicUrl)} className="text-gray-900 hover:underline">
                  Copy link
                </button>
                <button type="button" onClick={() => handleDelete(item)} className="text-red-600 hover:text-red-800">
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

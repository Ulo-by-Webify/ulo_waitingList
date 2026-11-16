"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
  ArrowUpTrayIcon,
  LinkIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { SITE_IMAGES, siteImageUrlSchema, type SiteImageKey } from "@/lib/site-settings";
import { adminInputClass } from "../PasswordInput";
import { useConfirm } from "../ConfirmDialog";
import MediaPickerDialog from "./MediaPickerDialog";

type SiteImageCardProps = {
  imageKey: SiteImageKey;
  url: string;
  isCustom: boolean;
  updatedLabel: string | null;
  canUpload: boolean;
};

const ACCEPT = "image/jpeg,image/png,image/webp";
const baseButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition disabled:opacity-50";
const buttonClass = `${baseButtonClass} border-gray-200 bg-white text-gray-700 hover:bg-gray-50`;
const primaryButtonClass = `${baseButtonClass} border-primary bg-primary text-white hover:bg-gray-800`;

async function saveImage(key: SiteImageKey, url: string) {
  const response = await fetch(`/api/admin/site/images/${key}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(json.error ?? "Couldn't save the image");
}

export default function SiteImageCard({ imageKey, url, isCustom, updatedLabel, canUpload }: SiteImageCardProps) {
  const config = SITE_IMAGES[imageKey];
  const isLandscape = config.shape === "landscape";
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [link, setLink] = useState("");
  const [hasPreviewError, setHasPreviewError] = useState(false);
  const [confirm, confirmDialog] = useConfirm();

  async function run(action: () => Promise<void>, success: string) {
    setIsBusy(true);
    try {
      await action();
      setHasPreviewError(false);
      toast.success(success);
      router.refresh();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsBusy(false);
    }
  }

  function upload(file: File | undefined) {
    if (!file) return;
    run(async () => {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch("/api/admin/media", { method: "POST", body: form });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error ?? "Upload failed");
      await saveImage(imageKey, body.data.publicUrl);
    }, "Image uploaded and live on the site").finally(() => {
      if (fileRef.current) fileRef.current.value = "";
    });
  }

  function pick(publicUrl: string) {
    setIsPickerOpen(false);
    run(() => saveImage(imageKey, publicUrl), "Image updated");
  }

  function saveLink(event: FormEvent) {
    event.preventDefault();
    const parsed = siteImageUrlSchema.safeParse(link);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Enter a valid image link");
      return;
    }
    run(async () => {
      await saveImage(imageKey, parsed.data);
      setLink("");
      setIsLinkOpen(false);
    }, "Image updated");
  }

  async function reset() {
    const confirmed = await confirm({
      title: "Go back to the original image?",
      description: "The page will show the image it shipped with. Your uploaded file stays in Media.",
      confirmLabel: "Reset",
      tone: "default",
    });
    if (!confirmed) return;
    run(async () => {
      const response = await fetch(`/api/admin/site/images/${imageKey}`, { method: "DELETE" });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(json.error ?? "Couldn't reset the image");
    }, "Original image restored");
  }

  return (
    <div className={`grid gap-6 ${isLandscape ? "md:grid-cols-[360px_1fr]" : "md:grid-cols-[220px_1fr]"}`}>
      {confirmDialog}
      <div
        className={`relative mx-auto w-full overflow-hidden rounded-2xl bg-gray-100 ${
          isLandscape ? "aspect-video max-w-[360px]" : "aspect-[2/3] max-w-[220px]"
        }`}
      >
        {hasPreviewError ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-xs text-gray-500">
            <PhotoIcon className="h-8 w-8 text-gray-300" aria-hidden="true" />
            This image couldn&apos;t be loaded. The page will use its built-in fallback instead.
          </div>
        ) : (
          <img
            key={url}
            src={url}
            alt={`${config.label} image`}
            className="h-full w-full object-cover"
            onError={() => setHasPreviewError(true)}
          />
        )}
        {isBusy && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <ArrowPathIcon className="h-6 w-6 animate-spin text-gray-700" aria-hidden="true" />
            <span className="sr-only">Saving…</span>
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-4">
        <p className="text-sm text-gray-500">
          {config.recommendation}
          {updatedLabel && <span className="text-gray-400"> · Changed {updatedLabel}</span>}
        </p>

        <div className="flex flex-wrap gap-2">
          {canUpload && (
            <>
              <button type="button" disabled={isBusy} onClick={() => fileRef.current?.click()} className={primaryButtonClass}>
                <ArrowUpTrayIcon className="h-4 w-4" aria-hidden="true" /> Upload new
              </button>
              <input ref={fileRef} type="file" accept={ACCEPT} className="sr-only" onChange={(e) => upload(e.target.files?.[0])} />
              <button type="button" disabled={isBusy} onClick={() => setIsPickerOpen(true)} className={buttonClass}>
                <PhotoIcon className="h-4 w-4" aria-hidden="true" /> Choose from Media
              </button>
            </>
          )}
          <button type="button" disabled={isBusy} onClick={() => setIsLinkOpen((open) => !open)} className={buttonClass} aria-expanded={isLinkOpen}>
            <LinkIcon className="h-4 w-4" aria-hidden="true" /> Use a link
          </button>
          {isCustom && (
            <button type="button" disabled={isBusy} onClick={reset} className={buttonClass}>
              <ArrowPathIcon className="h-4 w-4" aria-hidden="true" /> Reset to original
            </button>
          )}
        </div>

        {isLinkOpen && (
          <form onSubmit={saveLink} className="flex flex-col gap-2 sm:flex-row">
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://… or /image.jpg"
              aria-label="Image link"
              className={`${adminInputClass} py-2.5`}
              autoFocus
            />
            <button type="submit" disabled={isBusy} className="shrink-0 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50">
              Save
            </button>
          </form>
        )}

        <a
          href={config.page}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:underline"
        >
          View the page <ArrowTopRightOnSquareIcon className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>

      <MediaPickerDialog open={isPickerOpen} onOpenChange={setIsPickerOpen} onPick={pick} />
    </div>
  );
}

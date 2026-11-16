"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { FilmIcon, PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";
import EmptyState from "../EmptyState";

type MediaItem = { key: string; name: string; url: string; publicUrl: string };

const EXTENSIONS = {
  image: /\.(jpe?g|png|webp|gif)$/i,
  video: /\.(mp4|webm)$/i,
} as const;

type MediaPickerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPick: (publicUrl: string) => void;
  /** What to list. Default: images. */
  kind?: keyof typeof EXTENSIONS;
};

/** Lets an admin pick an image (or video) already uploaded to Media. */
export default function MediaPickerDialog({ open, onOpenChange, onPick, kind = "image" }: MediaPickerDialogProps) {
  const noun = kind === "video" ? "video" : "image";
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    setItems(null);
    setError(null);
    fetch("/api/admin/media", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? "Could not load media");
        setItems((body.data as MediaItem[]).filter((item) => EXTENSIONS[kind].test(item.name)));
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "Could not load media");
      });
    return () => controller.abort();
  }, [open, kind]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[85vh] w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-3xl border border-gray-100 bg-white shadow-2xl">
          <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-4">
            <div>
              <Dialog.Title className="text-lg font-semibold text-gray-900">Choose from Media</Dialog.Title>
              <Dialog.Description className="text-sm text-gray-500">Pick {noun === "video" ? "a video" : "an image"} you&apos;ve already uploaded.</Dialog.Description>
            </div>
            <Dialog.Close aria-label="Close" className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900">
              <XMarkIcon className="h-5 w-5" />
            </Dialog.Close>
          </div>
          <div className="overflow-y-auto p-6">
            {error ? (
              <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                {error}
              </p>
            ) : items === null ? (
              <p className="text-sm text-gray-500">Loading {noun}s…</p>
            ) : items.length === 0 ? (
              <EmptyState
                variant="plain"
                icon={kind === "video" ? FilmIcon : PhotoIcon}
                title={`No ${noun}s in Media yet`}
                description={`Use “Upload” instead, or add ${noun}s on the Media page.`}
              />
            ) : (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {items.map((item) => (
                  <li key={item.key}>
                    <button
                      type="button"
                      onClick={() => onPick(item.publicUrl)}
                      className="group block w-full overflow-hidden rounded-xl border border-gray-200 text-left transition hover:border-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <span className="block aspect-[3/4] bg-gray-50">
                        {kind === "video" ? (
                          <video src={item.url} muted playsInline preload="metadata" className="h-full w-full object-cover" />
                        ) : (
                          <img src={item.url} alt="" loading="lazy" className="h-full w-full object-cover" />
                        )}
                      </span>
                      <span className="block truncate px-2 py-1.5 text-xs text-gray-600 group-hover:text-gray-900">
                        {item.name}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

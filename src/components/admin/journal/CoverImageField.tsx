"use client";

import { useRef, useState } from "react";
import { DEFAULT_COVER_IMAGE } from "@/lib/journal";
import { toast } from "sonner";
import { adminInputClass } from "../PasswordInput";

interface CoverImageFieldProps {
  value: string;
  onChange: (value: string) => void;
}

const ACCEPT = "image/jpeg,image/png,image/webp";

export default function CoverImageField({ value, onChange }: CoverImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [hasPreviewError, setHasPreviewError] = useState(false);

  async function handleUpload(file: File | undefined) {
    if (!file) return;
    setIsUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch("/api/admin/media", { method: "POST", body: form });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(body.error ?? "Upload failed");
        return;
      }
      setHasPreviewError(false);
      onChange(body.data.publicUrl);
      toast.success("Cover image uploaded");
    } catch {
      toast.error("Network error during upload");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
        {value && !hasPreviewError ? (
          <img src={value} alt="Cover preview" className="h-full w-full object-cover" onError={() => setHasPreviewError(true)} />
        ) : (
          <>
            <img src={DEFAULT_COVER_IMAGE} alt="Default cover" className="h-full w-full object-cover" />
            <span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-gray-700 shadow-sm">
              {value ? "Image couldn't be loaded · default cover shown" : "Default cover"}
            </span>
          </>
        )}
      </div>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => {
            setHasPreviewError(false);
            onChange(e.target.value);
          }}
          placeholder="/image.jpg or https://…"
          aria-label="Cover image URL"
          className={`${adminInputClass} py-2`}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="shrink-0 rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
        >
          {isUploading ? "Uploading…" : "Upload"}
        </button>
        <input ref={inputRef} type="file" accept={ACCEPT} className="sr-only" onChange={(e) => handleUpload(e.target.files?.[0])} />
      </div>
      <p className="text-xs text-gray-500">Landscape images work best (16:10). Uploads go to the Railway bucket.</p>
    </div>
  );
}

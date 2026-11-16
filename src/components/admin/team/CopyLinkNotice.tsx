"use client";

import { toast } from "sonner";

interface CopyLinkNoticeProps {
  url: string;
  description: string;
  onDismiss: () => void;
}

/** Shows a one-time setup link when it couldn't be emailed. The link grants account access, so it isn't stored. */
export default function CopyLinkNotice({ url, description, onDismiss }: CopyLinkNoticeProps) {
  return (
    <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-4">
      <p className="text-sm text-amber-900">{description}</p>
      <div className="flex gap-2">
        <input readOnly value={url} aria-label="Setup link" onFocus={(e) => e.currentTarget.select()} className="min-w-0 flex-1 rounded-lg border border-amber-200 bg-white px-3 py-1.5 font-mono text-xs text-gray-800" />
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(url).then(() => toast.success("Link copied"), () => toast.error("Couldn't copy"))}
          className="shrink-0 rounded-lg bg-amber-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-950"
        >
          Copy
        </button>
        <button type="button" onClick={onDismiss} className="shrink-0 px-2 text-xs text-amber-900 hover:underline">
          Done
        </button>
      </div>
    </div>
  );
}

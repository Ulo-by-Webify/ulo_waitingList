"use client";

import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import type { PageEditor } from "./usePageEditor";

type SaveBarProps = {
  editor: Pick<PageEditor<object>, "isDirty" | "isSaving" | "save" | "reset" | "discard">;
  isCustom: boolean;
  updatedLabel: string | null;
  /** Public page to open with "View page". */
  viewHref: string;
};

const secondaryButtonClass =
  "rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50";

/** Fixed bar at the bottom of a page editor: status, View page, Reset / Discard and Save. */
export default function SaveBar({ editor, isCustom, updatedLabel, viewHref }: SaveBarProps) {
  const { isDirty, isSaving } = editor;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <p className="text-sm text-gray-500" aria-live="polite">
          {isDirty ? (
            <span className="font-medium text-amber-700">Unsaved changes</span>
          ) : isCustom ? (
            `All changes saved${updatedLabel ? ` · ${updatedLabel}` : ""}`
          ) : (
            "Showing the original content"
          )}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={viewHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            View page <ArrowTopRightOnSquareIcon className="h-4 w-4" aria-hidden="true" />
          </a>
          {isCustom && !isDirty && (
            <button type="button" onClick={editor.reset} disabled={isSaving} className={secondaryButtonClass}>
              Reset to original
            </button>
          )}
          {isDirty && (
            <button type="button" onClick={editor.discard} disabled={isSaving} className={secondaryButtonClass}>
              Discard
            </button>
          )}
          <button
            type="button"
            onClick={editor.save}
            disabled={isSaving || !isDirty}
            className="rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
          >
            {isSaving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

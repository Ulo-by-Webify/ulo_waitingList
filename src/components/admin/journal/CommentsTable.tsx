"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { CommentStatus } from "@/lib/journal";
import { useConfirm } from "../ConfirmDialog";

export type CommentRow = {
  id: string;
  authorName: string;
  body: string;
  status: CommentStatus;
  postTitle: string;
  postSlug: string;
  postedAt: string;
};

async function send(url: string, method: string, body?: unknown) {
  const response = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(json.error ?? "Something went wrong");
  return json.data;
}

const actionClass = "text-xs font-medium hover:underline disabled:opacity-40";

export default function CommentsTable({ comments }: { comments: CommentRow[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirm, confirmDialog] = useConfirm();

  async function act(id: string, action: () => Promise<void>) {
    setBusyId(id);
    try {
      await action();
      router.refresh();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  const toggle = (c: CommentRow) =>
    act(c.id, async () => {
      const status: CommentStatus = c.status === "visible" ? "hidden" : "visible";
      await send(`/api/admin/journal/comments/${c.id}`, "PATCH", { status });
      toast.success(status === "hidden" ? "Comment hidden from the site" : "Comment visible again");
    });

  async function remove(c: CommentRow) {
    const confirmed = await confirm({
      title: "Delete this comment?",
      description: `${c.authorName}'s comment will be removed for good. To keep it but take it off the site, hide it instead.`,
    });
    if (!confirmed) return;
    act(c.id, async () => {
      await send(`/api/admin/journal/comments/${c.id}`, "DELETE");
      toast.success("Comment deleted");
    });
  }

  return (
    <ul className="divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white shadow-sm">
      {confirmDialog}
      {comments.map((c) => {
        const isBusy = busyId === c.id;
        const isHidden = c.status === "hidden";
        return (
          <li key={c.id} className={`flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start ${isHidden ? "bg-gray-50/70" : ""}`}>
            <div className="min-w-0 flex-1">
              <p className="text-sm">
                <span className="font-semibold text-gray-900">{c.authorName}</span>
                <span className="text-gray-400"> · {c.postedAt} · on </span>
                <Link href={`/journal/${c.postSlug}#comments`} target="_blank" className="text-gray-700 hover:underline">
                  {c.postTitle}
                </Link>
                {isHidden && (
                  <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">Hidden</span>
                )}
              </p>
              <p className={`mt-1 whitespace-pre-line break-words text-sm leading-relaxed ${isHidden ? "text-gray-500" : "text-gray-700"}`}>
                {c.body}
              </p>
            </div>
            <div className="flex shrink-0 gap-4">
              <button type="button" disabled={isBusy} onClick={() => toggle(c)} className={`${actionClass} text-gray-700`}>
                {isHidden ? "Show" : "Hide"}
              </button>
              <button type="button" disabled={isBusy} onClick={() => remove(c)} className={`${actionClass} text-red-600`}>
                Delete
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

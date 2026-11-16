"use client";

import { useEffect, useState, type FormEvent } from "react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { ChatBubbleLeftRightIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { MAX_COMMENT_BODY, MAX_COMMENT_NAME } from "@/lib/journal";
import { HONEYPOT_FIELD } from "@/lib/validation";
import { submitErrorMessage, useTurnstile } from "@/components/turnstile/useTurnstile";
import { TURNSTILE_ACTIONS, TURNSTILE_FIELD } from "@/lib/turnstile";
import type { JournalComment } from "@/types";

type CommentsSectionProps = {
  slug: string;
  comments: JournalComment[];
  /** True when existing comments couldn't be loaded. */
  isUnavailable?: boolean;
  onPosted: (comment: JournalComment) => void;
};

// Per-browser convenience only: pre-fills the name for the next comment.
const NAME_STORAGE_KEY = "ulo-comment-name";
const COUNTER_THRESHOLD = 0.8;

function readSavedName(): string {
  try {
    return window.localStorage.getItem(NAME_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function saveName(name: string) {
  try {
    window.localStorage.setItem(NAME_STORAGE_KEY, name);
  } catch {
    // Storage can be blocked (private mode); the name just won't be remembered.
  }
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function CommentsSection({ slug, comments, isUnavailable = false, onPosted }: CommentsSectionProps) {
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const turnstile = useTurnstile(TURNSTILE_ACTIONS.comment);

  useEffect(() => {
    setName(readSavedName());
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return toast.error("Please add your name");
    if (!body.trim()) return toast.error("Write a comment first");
    setIsPosting(true);
    try {
      const turnstileToken = await turnstile.getToken();
      const response = await fetch(`/api/journal/${slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, body, [HONEYPOT_FIELD]: honeypot, [TURNSTILE_FIELD]: turnstileToken }),
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(json.error ?? "Couldn't post your comment. Please try again.");
        return;
      }
      saveName(name.trim());
      setBody("");
      if (json.data?.comment) onPosted(json.data.comment);
      toast.success("Comment posted");
    } catch (error) {
      toast.error(submitErrorMessage(error, "Network error. Please try again."));
    } finally {
      turnstile.reset();
      setIsPosting(false);
    }
  }

  const showCounter = body.length > MAX_COMMENT_BODY * COUNTER_THRESHOLD;

  return (
    <section id="comments" aria-labelledby="comments-heading" className="mt-10 scroll-mt-24">
      <h2 id="comments-heading" className="text-lg font-semibold text-gray-900">
        Comments{comments.length > 0 && <span className="text-gray-400"> · {comments.length}</span>}
      </h2>

      <form onSubmit={submit} className="mt-4 space-y-3 rounded-2xl border border-gray-200 bg-white p-4" noValidate>
        {/* Hidden from people; bots that fill every field are ignored. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>
            Website
            <input
              tabIndex={-1}
              autoComplete="off"
              name={HONEYPOT_FIELD}
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </label>
        </div>
        <label className="block">
          <span className="sr-only">Your name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={MAX_COMMENT_NAME}
            autoComplete="name"
            placeholder="Your name"
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          />
        </label>
        <label className="block">
          <span className="sr-only">Your comment</span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={MAX_COMMENT_BODY}
            rows={3}
            placeholder="Write a comment..."
            className="w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          />
        </label>
        {turnstile.widget}
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-gray-400">
            {showCounter ? `${body.length}/${MAX_COMMENT_BODY}` : "Be kind. Links aren't allowed."}
          </p>
          <button
            type="submit"
            disabled={isPosting}
            className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-60"
          >
            <PaperAirplaneIcon className="h-4 w-4" aria-hidden="true" />
            {isPosting ? "Posting…" : "Post comment"}
          </button>
        </div>
      </form>

      {isUnavailable && comments.length === 0 ? (
        <p role="status" className="mt-6 rounded-2xl border border-dashed border-gray-300 px-6 py-8 text-center text-sm text-gray-500">
          Comments couldn&apos;t be loaded right now. Refresh the page to try again.
        </p>
      ) : comments.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-gray-300 px-6 py-10 text-center">
          <ChatBubbleLeftRightIcon className="mx-auto h-8 w-8 text-gray-300" aria-hidden="true" />
          <p className="mt-3 text-sm font-medium text-gray-900">No comments yet</p>
          <p className="mt-1 text-sm text-gray-500">Be the first to share your thoughts.</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-5">
          {comments.map((comment) => (
            <li key={comment.id} className="flex gap-3">
              <span
                aria-hidden="true"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-900/5 text-xs font-semibold text-gray-700"
              >
                {initials(comment.authorName)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm">
                  <span className="font-semibold text-gray-900">{comment.authorName}</span>{" "}
                  <time dateTime={comment.createdAt} className="text-gray-400" suppressHydrationWarning>
                    · {formatDistanceToNow(parseISO(comment.createdAt), { addSuffix: true })}
                  </time>
                </p>
                <p className="mt-1 whitespace-pre-line break-words text-sm leading-relaxed text-gray-700">
                  {comment.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

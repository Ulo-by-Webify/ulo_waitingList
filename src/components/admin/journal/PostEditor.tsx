"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { isFeatured, slugify, type ContentBlock, type PostStatus } from "@/lib/journal";
import { adminInputClass } from "../PasswordInput";
import BlockEditor, { fromEditorBlocks, toEditorBlocks, type EditorBlock } from "./BlockEditor";
import CategoryField from "./CategoryField";
import CoverImageField from "./CoverImageField";
import TagInput from "./TagInput";

export type EditablePost = {
  id: string | null;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  category: string;
  authorName: string;
  tags: string[];
  content: ContentBlock[];
  status: PostStatus;
  publishedAt: string | null;
};

const labelClass = "block text-sm font-medium text-gray-700";
const EXCERPT_MAX = 400;

function Field({ label, htmlFor, hint, children }: { label: string; htmlFor?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className={labelClass}>
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

interface PostEditorProps {
  initial: EditablePost;
  categories: string[];
}

export default function PostEditor({ initial, categories: initialCategories }: PostEditorProps) {
  const router = useRouter();
  const isNew = initial.id === null;
  // Once a post has been published its URL may be shared, so stop following the title.
  const hasBeenPublished = initial.publishedAt !== null;
  const [title, setTitle] = useState(initial.title);
  const [slug, setSlug] = useState(initial.slug);
  const [isSlugAuto, setIsSlugAuto] = useState(
    !hasBeenPublished && (isNew || initial.slug === slugify(initial.title)),
  );
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [categories, setCategories] = useState(initialCategories);
  const [excerpt, setExcerpt] = useState(initial.excerpt);
  const [coverImage, setCoverImage] = useState(initial.coverImage);
  const [category, setCategory] = useState(initial.category);
  const [authorName, setAuthorName] = useState(initial.authorName);
  const [tags, setTags] = useState(initial.tags);
  const [blocks, setBlocks] = useState<EditorBlock[]>(() => toEditorBlocks(initial.content));
  const [status, setStatus] = useState<PostStatus>(initial.status);
  const [savingAs, setSavingAs] = useState<PostStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const snapshot = useMemo(
    () => JSON.stringify({ title, slug, excerpt, coverImage, category, authorName, tags, content: fromEditorBlocks(blocks) }),
    [title, slug, excerpt, coverImage, category, authorName, tags, blocks],
  );
  const [savedSnapshot, setSavedSnapshot] = useState(snapshot);
  const isDirty = snapshot !== savedSnapshot;

  useEffect(() => {
    if (!isDirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (isSlugAuto) setSlug(slugify(value));
  }

  function resetSlugToTitle() {
    setSlug(slugify(title));
    setIsSlugAuto(!hasBeenPublished);
    setIsEditingSlug(false);
  }

  async function save(nextStatus: PostStatus) {
    setSavingAs(nextStatus);
    setError(null);
    try {
      const response = await fetch(isNew ? "/api/admin/journal" : `/api/admin/journal/${initial.id}`, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, slug, excerpt, coverImage, category, authorName, tags,
          content: fromEditorBlocks(blocks),
          status: nextStatus,
        }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(body.error ?? "Could not save the post");
        return;
      }
      setStatus(body.data.status);
      setSavedSnapshot(snapshot);
      const message = nextStatus === "published" ? (status === "published" ? "Post updated" : "Post published") : status === "published" ? "Post unpublished" : "Draft saved";
      toast.success(message);
      if (isNew) router.replace(`/admin/journal/${body.data.id}`);
      router.refresh();
    } catch {
      setError("Network error. Your changes are still here, try again.");
    } finally {
      setSavingAs(null);
    }
  }

  const featuredWithoutCover = isFeatured(tags) && !coverImage.trim();
  const isPublished = status === "published";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save("published");
      }}
      className="space-y-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/journal" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeftIcon className="h-4 w-4" /> All posts
        </Link>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${isPublished ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"}`}
          >
            {isPublished ? "Published" : "Draft"}
          </span>
          {isDirty && <span className="text-xs text-gray-500">Unsaved changes</span>}
          {isPublished && !isNew && (
            <a href={`/journal/${initial.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
              View live <ArrowTopRightOnSquareIcon className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Story title"
            aria-label="Title"
            required
            maxLength={200}
            className="w-full border-0 p-0 text-2xl font-semibold text-gray-900 placeholder:text-gray-300 focus:outline-none sm:text-3xl"
          />
          <Field label="Excerpt" htmlFor="post-excerpt" hint={`Shown on story cards and the hero slide. ${excerpt.length}/${EXCERPT_MAX}`}>
            <textarea
              id="post-excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              required
              maxLength={EXCERPT_MAX}
              className={`${adminInputClass} resize-y`}
            />
          </Field>
          <div className="space-y-1.5">
            <span className={labelClass}>Content</span>
            <BlockEditor blocks={blocks} onChange={setBlocks} />
          </div>
        </div>

        <aside className="space-y-6">
          <div className="space-y-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            {error && (
              <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={savingAs !== null}
              className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-60"
            >
              {savingAs === "published" ? "Saving…" : isPublished ? "Update post" : "Publish"}
            </button>
            <button
              type="button"
              onClick={() => save("draft")}
              disabled={savingAs !== null}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              {savingAs === "draft" ? "Saving…" : isPublished ? "Unpublish (back to draft)" : "Save draft"}
            </button>
            {initial.publishedAt && isPublished && (
              <p className="text-center text-xs text-gray-500">
                Published {new Date(initial.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            )}
          </div>

          <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900">Hero &amp; tags</h2>
            <TagInput tags={tags} onChange={setTags} />
            {featuredWithoutCover && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Add a cover image so this post can appear in the hero slider. Without one, it shows the default cover everywhere else.
              </p>
            )}
          </div>

          <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900">Cover image</h2>
            <CoverImageField value={coverImage} onChange={setCoverImage} />
          </div>

          <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900">Details</h2>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="post-slug" className={labelClass}>
                  URL slug
                </label>
                {!isEditingSlug && (
                  <button type="button" onClick={() => setIsEditingSlug(true)} className="text-xs text-gray-500 hover:text-gray-900">
                    Customize
                  </button>
                )}
              </div>
              {isEditingSlug ? (
                <input
                  id="post-slug"
                  value={slug}
                  autoFocus
                  onChange={(e) => {
                    setIsSlugAuto(false);
                    setSlug(slugify(e.target.value));
                  }}
                  onBlur={() => setIsEditingSlug(false)}
                  required
                  className={`${adminInputClass} py-2`}
                />
              ) : (
                <p id="post-slug" className="break-all rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-700">
                  /journal/<span className="font-medium text-gray-900">{slug || "your-story-title"}</span>
                </p>
              )}
              <p className="text-xs text-gray-500">
                {isSlugAuto
                  ? "Generated from the title."
                  : hasBeenPublished
                    ? "Kept fixed so shared links keep working."
                    : "Custom slug."}{" "}
                {!isSlugAuto && slug !== slugify(title) && (
                  <button type="button" onClick={resetSlugToTitle} className="font-medium text-gray-700 underline underline-offset-2 hover:text-gray-900">
                    {hasBeenPublished ? "Regenerate from title" : "Sync with title"}
                  </button>
                )}
              </p>
              {hasBeenPublished && slug !== initial.slug && (
                <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  Changing the URL of a published post breaks links already shared to /journal/{initial.slug}.
                </p>
              )}
            </div>
            <Field label="Category" htmlFor="post-category">
              <CategoryField
                id="post-category"
                value={category}
                categories={categories}
                onChange={setCategory}
                onCreated={(name) => setCategories((prev) => [...prev, name].sort((a, b) => a.localeCompare(b)))}
              />
            </Field>
            <Field label="Author" htmlFor="post-author">
              <input id="post-author" value={authorName} onChange={(e) => setAuthorName(e.target.value)} required maxLength={120} className={`${adminInputClass} py-2`} />
            </Field>
          </div>
        </aside>
      </div>
    </form>
  );
}

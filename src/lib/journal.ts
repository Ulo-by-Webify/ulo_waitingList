import { z } from "zod";
import type { JournalBodyBlock } from "@/types";

/** Posts carrying this tag (case-insensitive) are shown in the /journal hero slider. */
export const FEATURED_TAG = "featured";
export const MAX_HERO_SLIDES = 5;

export const POST_STATUSES = ["draft", "published"] as const;
export type PostStatus = (typeof POST_STATUSES)[number];

export const DEFAULT_AUTHOR = "Ulô Africa";

/** Shown wherever a post has no cover image, or its cover file has been deleted. */
export const DEFAULT_COVER_IMAGE = "/placeholder.jpg";

export const categoryNameSchema = z.object({
  name: z.string().trim().min(1, "Category name is required").max(60, "Category name is too long"),
});

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120)
    .replace(/-+$/, "");
}

export function normalizeTag(tag: string): string {
  return tag.trim().toLowerCase().replace(/\s+/g, "-").slice(0, 40);
}

export function isFeatured(tags: string[]): boolean {
  return tags.some((t) => normalizeTag(t) === FEATURED_TAG);
}

const blockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("paragraph"), text: z.string().trim().min(1).max(5000) }),
  z.object({ type: z.literal("heading"), text: z.string().trim().min(1).max(200) }),
  z.object({
    type: z.literal("list"),
    items: z.array(z.string().trim().min(1).max(2000)).min(1).max(50),
  }),
]);
// Same shape the public article renderer uses (zod's inferred type is looser with strictNullChecks off).
export type ContentBlock = JournalBodyBlock;

// Cover images may be a site path (/Urban.jpg), a bucket file (/api/files/media/...) or an https URL.
const coverImage = z
  .string()
  .trim()
  .max(1024)
  .refine((v) => v === "" || v.startsWith("/") || /^https:\/\//.test(v), "Cover image must be a site path or https URL")
  .refine((v) => !v.startsWith("//"), "Cover image must be a site path or https URL")
  .transform((v) => v || null);

export const journalPostSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(200),
    slug: z.string().trim().toLowerCase().regex(SLUG_PATTERN, "Slug can only use lowercase letters, numbers and dashes").max(120),
    excerpt: z.string().trim().min(1, "Excerpt is required").max(400),
    coverImage,
    category: z.string().trim().min(1, "Category is required").max(60),
    authorName: z.string().trim().min(1, "Author is required").max(120),
    tags: z
      .array(z.string())
      .max(20)
      .transform((tags) => Array.from(new Set(tags.map(normalizeTag).filter(Boolean)))),
    content: z.array(blockSchema).max(200),
    status: z.enum(POST_STATUSES),
  })
  .refine((post) => post.status === "draft" || post.content.length > 0, {
    message: "Add some content before publishing",
    path: ["content"],
  });

export type JournalPostInput = z.infer<typeof journalPostSchema>;

// ---------- Public comments ----------

export const MAX_COMMENT_NAME = 60;
export const MAX_COMMENT_BODY = 1000;
export const COMMENT_STATUSES = ["visible", "hidden"] as const;
export type CommentStatus = (typeof COMMENT_STATUSES)[number];

// Links are the main payload of comment spam, so comments can't contain them.
const LINK_PATTERN = /(https?:\/\/|www\.)\S|\b[a-z0-9-]+\.(com|net|org|io|ru|xyz|top|info|biz)\b/i;
// Control characters (other than newlines and tabs) have no place in a comment.
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export const commentSchema = z.object({
  name: z
    .string()
    .transform((v) => v.replace(CONTROL_CHARS, "").replace(/\s+/g, " ").trim())
    .pipe(
      z
        .string()
        .min(1, "Please add your name")
        .max(MAX_COMMENT_NAME, `Keep your name under ${MAX_COMMENT_NAME} characters`),
    ),
  body: z
    .string()
    .transform((v) => v.replace(CONTROL_CHARS, "").replace(/\n{3,}/g, "\n\n").trim())
    .pipe(
      z
        .string()
        .min(1, "Write a comment first")
        .max(MAX_COMMENT_BODY, `Keep comments under ${MAX_COMMENT_BODY} characters`)
        .refine((v) => !LINK_PATTERN.test(v), "Links aren't allowed in comments"),
    ),
});
export type CommentInput = z.infer<typeof commentSchema>;

import "server-only";
import { format } from "date-fns";
import { getPool } from "./db";
import { FEATURED_TAG, MAX_HERO_SLIDES, type ContentBlock, type JournalPostInput, type PostStatus } from "@/lib/journal";
import type { JournalFeaturedStory, JournalStory } from "@/types";

export type JournalPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: ContentBlock[];
  coverImage: string | null;
  category: string;
  authorName: string;
  tags: string[];
  status: PostStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  shareCount: number;
};

const COLUMNS = `id, slug, title, excerpt, content, cover_image, category, author_name, tags, status,
                 published_at, created_at, updated_at, share_count`;

function toPost(row: Record<string, unknown>): JournalPost {
  const iso = (v: unknown) => (v instanceof Date ? v.toISOString() : null);
  return {
    id: String(row.id),
    slug: row.slug as string,
    title: row.title as string,
    excerpt: row.excerpt as string,
    content: (row.content as ContentBlock[]) ?? [],
    coverImage: (row.cover_image as string | null) ?? null,
    category: row.category as string,
    authorName: row.author_name as string,
    tags: (row.tags as string[]) ?? [],
    status: row.status as PostStatus,
    publishedAt: iso(row.published_at),
    createdAt: iso(row.created_at) as string,
    updatedAt: iso(row.updated_at) as string,
    shareCount: Number(row.share_count ?? 0),
  };
}

// ---------- Public site ----------

export function toStory(post: JournalPost): JournalStory {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    image: post.coverImage ?? undefined,
    category: post.category,
    date: post.publishedAt ? format(new Date(post.publishedAt), "MMM d, yyyy") : "",
    publishedAt: post.publishedAt ?? undefined,
    updatedAt: post.updatedAt,
    author: post.authorName,
    href: `/journal/${post.slug}`,
    content: post.content,
    shares: post.shareCount,
  };
}

function toHeroSlide(post: JournalPost): JournalFeaturedStory {
  return {
    id: post.id,
    tag: "Featured",
    title: post.title,
    description: post.excerpt,
    image: post.coverImage ?? "",
    href: `/journal/${post.slug}`,
  };
}

const PUBLISHED = `status = 'published' AND published_at <= now()`;

/** Slug and last change of every published post, for the sitemap. */
export async function listSitemapPosts(): Promise<{ slug: string; updatedAt: string }[]> {
  const result = await getPool().query(
    `SELECT slug, GREATEST(updated_at, published_at) AS updated_at FROM journal_posts WHERE ${PUBLISHED} ORDER BY published_at DESC LIMIT 5000`,
  );
  return result.rows.map((row) => ({ slug: row.slug as string, updatedAt: (row.updated_at as Date).toISOString() }));
}

export async function listPublishedStories(): Promise<JournalStory[]> {
  const result = await getPool().query(
    `SELECT ${COLUMNS} FROM journal_posts WHERE ${PUBLISHED} ORDER BY published_at DESC`,
  );
  return result.rows.map((r) => toStory(toPost(r)));
}

/** Hero slides: newest published posts tagged 'featured' that have a cover image. */
export async function listHeroSlides(): Promise<JournalFeaturedStory[]> {
  const result = await getPool().query(
    `SELECT ${COLUMNS} FROM journal_posts
     WHERE ${PUBLISHED} AND $1 = ANY(tags) AND cover_image IS NOT NULL
     ORDER BY published_at DESC LIMIT $2`,
    [FEATURED_TAG, MAX_HERO_SLIDES],
  );
  return result.rows.map((r) => toHeroSlide(toPost(r)));
}

/**
 * Removes a deleted file from every post using it as a cover, so those posts fall back to the
 * default cover. Returns how many posts were changed.
 */
export async function clearCoverImage(url: string): Promise<number> {
  const result = await getPool().query(
    `UPDATE journal_posts SET cover_image = NULL, updated_at = now() WHERE cover_image = $1`,
    [url],
  );
  return result.rowCount ?? 0;
}

/** Counts a share of a published post. Returns false when no published post has that slug. */
export async function incrementShareCount(slug: string): Promise<boolean> {
  const result = await getPool().query(
    `UPDATE journal_posts SET share_count = share_count + 1 WHERE slug = $1 AND ${PUBLISHED}`,
    [slug],
  );
  return (result.rowCount ?? 0) > 0;
}

export async function getPublishedStory(slug: string): Promise<JournalStory | null> {
  const result = await getPool().query(`SELECT ${COLUMNS} FROM journal_posts WHERE slug = $1 AND ${PUBLISHED}`, [slug]);
  return result.rows[0] ? toStory(toPost(result.rows[0])) : null;
}

export async function listRelatedStories(slug: string, limit = 6): Promise<JournalStory[]> {
  const result = await getPool().query(
    `SELECT ${COLUMNS} FROM journal_posts WHERE slug <> $1 AND ${PUBLISHED}
     ORDER BY published_at DESC LIMIT $2`,
    [slug, limit],
  );
  return result.rows.map((r) => toStory(toPost(r)));
}

// ---------- Admin ----------

export type AdminPostFilters = { status?: PostStatus; search?: string };

export async function listPosts(filters: AdminPostFilters = {}): Promise<JournalPost[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];
  if (filters.status) {
    params.push(filters.status);
    conditions.push(`status = $${params.length}`);
  }
  if (filters.search) {
    params.push(`%${filters.search}%`);
    conditions.push(`(title ILIKE $${params.length} OR category ILIKE $${params.length} OR author_name ILIKE $${params.length})`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const result = await getPool().query(
    `SELECT ${COLUMNS} FROM journal_posts ${where}
     ORDER BY (status = 'draft') DESC, coalesce(published_at, updated_at) DESC`,
    params,
  );
  return result.rows.map(toPost);
}

export async function getPostById(id: string): Promise<JournalPost | null> {
  const result = await getPool().query(`SELECT ${COLUMNS} FROM journal_posts WHERE id = $1`, [id]);
  return result.rows[0] ? toPost(result.rows[0]) : null;
}

export type SaveResult = { post: JournalPost } | { error: "slug-taken" | "not-found" | "unknown-category" };

/** Maps Postgres constraint errors to save errors; rethrows anything else. */
function toSaveError(error: unknown): SaveResult {
  const code = (error as { code?: string }).code;
  if (code === "23505") return { error: "slug-taken" };
  if (code === "23503") return { error: "unknown-category" };
  throw error;
}

export async function createPost(input: JournalPostInput): Promise<SaveResult> {
  try {
    const result = await getPool().query(
      `INSERT INTO journal_posts
         (slug, title, excerpt, content, cover_image, category, author_name, tags, status, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CASE WHEN $9 = 'published' THEN now() END)
       RETURNING ${COLUMNS}`,
      [input.slug, input.title, input.excerpt, JSON.stringify(input.content), input.coverImage, input.category,
        input.authorName, input.tags, input.status],
    );
    return { post: toPost(result.rows[0]) };
  } catch (error) {
    return toSaveError(error);
  }
}

/** Keeps the original publish date when re-saving a published post; clears it on unpublish. */
export async function updatePost(id: string, input: JournalPostInput): Promise<SaveResult> {
  try {
    const result = await getPool().query(
      `UPDATE journal_posts SET
         slug = $2, title = $3, excerpt = $4, content = $5, cover_image = $6, category = $7,
         author_name = $8, tags = $9, status = $10, updated_at = now(),
         published_at = CASE WHEN $10 = 'published' THEN coalesce(published_at, now()) END
       WHERE id = $1 RETURNING ${COLUMNS}`,
      [id, input.slug, input.title, input.excerpt, JSON.stringify(input.content), input.coverImage, input.category,
        input.authorName, input.tags, input.status],
    );
    return result.rows[0] ? { post: toPost(result.rows[0]) } : { error: "not-found" };
  } catch (error) {
    return toSaveError(error);
  }
}

export async function deletePost(id: string): Promise<boolean> {
  const result = await getPool().query(`DELETE FROM journal_posts WHERE id = $1`, [id]);
  return result.rowCount === 1;
}

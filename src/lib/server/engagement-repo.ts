import "server-only";
import { createHmac, randomBytes } from "node:crypto";
import { getPool } from "./db";
import type { CommentInput, CommentStatus } from "@/lib/journal";
import type { JournalComment } from "@/types";

/** Anonymous visitor cookie, used only to remember which posts a browser has liked. */
export const VISITOR_COOKIE = "ulo_vid";
export const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const VISITOR_ID = /^[A-Za-z0-9_-]{32,64}$/;
const PUBLIC_COMMENT_LIMIT = 100;
const ADMIN_COMMENT_LIMIT = 500;
const PUBLISHED = `p.status = 'published' AND p.published_at <= now()`;

export function newVisitorId(): string {
  return randomBytes(24).toString("base64url");
}

/** HMAC of the cookie id, so stored likes can't be tied to a browser without the server secret. */
export function visitorHashFromCookie(value: string | undefined): string | null {
  if (!value || !VISITOR_ID.test(value)) return null;
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not configured");
  return createHmac("sha256", secret).update(`like-visitor:${value}`).digest("hex");
}

function toComment(row: Record<string, unknown>): JournalComment {
  return {
    id: String(row.id),
    authorName: row.author_name as string,
    body: row.body as string,
    createdAt: (row.created_at as Date).toISOString(),
  };
}

export type StoryEngagement = { likes: number; liked: boolean; comments: JournalComment[]; commentCount: number };

export async function getStoryEngagement(postId: string, visitorHash: string | null): Promise<StoryEngagement> {
  // One round trip: each query to the database costs ~300ms from far-away networks.
  const result = await getPool().query(
    `SELECT
       (SELECT count(*)::int FROM journal_post_likes WHERE post_id = $1) AS likes,
       (SELECT count(*)::int FROM journal_comments WHERE post_id = $1 AND status = 'visible') AS comment_count,
       EXISTS (SELECT 1 FROM journal_post_likes WHERE post_id = $1 AND visitor_hash = $2) AS liked,
       coalesce((
         SELECT json_agg(c ORDER BY c.created_at DESC)
         FROM (
           SELECT id, author_name, body, created_at FROM journal_comments
           WHERE post_id = $1 AND status = 'visible'
           ORDER BY created_at DESC LIMIT ${PUBLIC_COMMENT_LIMIT}
         ) c
       ), '[]'::json) AS comments`,
    [postId, visitorHash ?? ""],
  );
  const row = result.rows[0];
  const comments = (row.comments as Record<string, unknown>[]).map((c) =>
    toComment({ ...c, created_at: new Date(c.created_at as string) }),
  );
  return { likes: row.likes, liked: row.liked, commentCount: row.comment_count, comments };
}

/** Likes or unlikes a published post. Returns null when there is no published post with that slug. */
export async function setLike(
  slug: string,
  visitorHash: string,
  liked: boolean,
): Promise<{ liked: boolean; likes: number } | null> {
  const pool = getPool();
  const post = await pool.query(`SELECT p.id FROM journal_posts p WHERE p.slug = $1 AND ${PUBLISHED}`, [slug]);
  const postId = post.rows[0]?.id;
  if (!postId) return null;
  if (liked) {
    await pool.query(`INSERT INTO journal_post_likes (post_id, visitor_hash) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [
      postId,
      visitorHash,
    ]);
  } else {
    await pool.query(`DELETE FROM journal_post_likes WHERE post_id = $1 AND visitor_hash = $2`, [postId, visitorHash]);
  }
  const count = await pool.query(`SELECT count(*)::int AS likes FROM journal_post_likes WHERE post_id = $1`, [postId]);
  return { liked, likes: count.rows[0].likes };
}

/** Adds a visible comment to a published post. Returns null when there is no such post. */
export async function addComment(slug: string, input: CommentInput): Promise<JournalComment | null> {
  const result = await getPool().query(
    `INSERT INTO journal_comments (post_id, author_name, body)
     SELECT p.id, $2, $3 FROM journal_posts p WHERE p.slug = $1 AND ${PUBLISHED}
     RETURNING id, author_name, body, created_at`,
    [slug, input.name, input.body],
  );
  return result.rows[0] ? toComment(result.rows[0]) : null;
}

// ---------- Admin ----------

export type AdminComment = JournalComment & { status: CommentStatus; postTitle: string; postSlug: string };

export async function listAdminComments(
  filters: { status?: CommentStatus; search?: string } = {},
): Promise<AdminComment[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];
  if (filters.status) {
    params.push(filters.status);
    conditions.push(`c.status = $${params.length}`);
  }
  if (filters.search) {
    params.push(`%${filters.search}%`);
    const n = params.length;
    conditions.push(`(c.body ILIKE $${n} OR c.author_name ILIKE $${n} OR p.title ILIKE $${n})`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const result = await getPool().query(
    `SELECT c.id, c.author_name, c.body, c.created_at, c.status, p.title AS post_title, p.slug AS post_slug
     FROM journal_comments c JOIN journal_posts p ON p.id = c.post_id
     ${where} ORDER BY c.created_at DESC LIMIT ${ADMIN_COMMENT_LIMIT}`,
    params,
  );
  return result.rows.map((r) => ({
    ...toComment(r),
    status: r.status as CommentStatus,
    postTitle: r.post_title as string,
    postSlug: r.post_slug as string,
  }));
}

export async function countComments(): Promise<{ all: number; visible: number; hidden: number }> {
  const result = await getPool().query(
    `SELECT count(*)::int AS "all",
            count(*) FILTER (WHERE status = 'visible')::int AS visible,
            count(*) FILTER (WHERE status = 'hidden')::int AS hidden
     FROM journal_comments`,
  );
  return result.rows[0];
}

export async function setCommentStatus(id: string, status: CommentStatus): Promise<boolean> {
  const result = await getPool().query(`UPDATE journal_comments SET status = $2 WHERE id = $1`, [id, status]);
  return (result.rowCount ?? 0) > 0;
}

export async function deleteComment(id: string): Promise<boolean> {
  const result = await getPool().query(`DELETE FROM journal_comments WHERE id = $1`, [id]);
  return (result.rowCount ?? 0) > 0;
}

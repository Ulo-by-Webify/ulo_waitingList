import "server-only";
import { revalidateTag, unstable_cache } from "next/cache";
import type { z } from "zod";
import { getPool } from "./db";
import { DEFAULT_COVER_IMAGE } from "@/lib/journal";

/**
 * Whole-page content that admins edit (stored as JSON in page_content, one row per page).
 * Each page supplies its schema, built-in content and how to visit its images.
 */

/** A single image that was editable on its own (a site_settings row) before the whole page was. */
type LegacyImage<T> = { key: string; apply: (content: T, url: string) => T };

type PageContentOptions<T> = {
  slug: string;
  schema: z.ZodType<T, z.ZodTypeDef, unknown>;
  defaults: T;
  /**
   * Returns a copy of the content with every image and video URL passed through `swap`.
   * `fallback` is what a deleted file is replaced with (default: the Ulô cover image).
   */
  mapImages: (content: T, swap: (url: string, fallback?: string) => string) => T;
  legacyImage?: LegacyImage<T>;
};

export type PageContentState<T> = {
  content: T;
  isCustom: boolean;
  updatedAt: string | null;
};

type StoredRow = { content: unknown; updatedAt: string | null; legacyImage: string | null };

export type PageContentRepo<T> = {
  /** For the public page. Cached; never throws (falls back to the built-in content). */
  getContent: () => Promise<T>;
  /** Uncached, for the admin editor. */
  getForAdmin: () => Promise<PageContentState<T>>;
  /** Callers must validate with the page's schema first. Goes live straight away. */
  save: (content: T, adminId: string) => Promise<void>;
  /** Back to the built-in content. */
  reset: () => Promise<void>;
  /** Swaps a deleted media file for the default image. Returns how many images were replaced. */
  replaceImage: (url: string) => Promise<number>;
};

export function createPageContentRepo<T>({ slug, schema, defaults, mapImages, legacyImage }: PageContentOptions<T>): PageContentRepo<T> {
  const tag = `page-content:${slug}`;
  const legacyKey = legacyImage?.key ?? null;

  async function readStored(): Promise<StoredRow> {
    const result = await getPool().query(
      `SELECT
         (SELECT content FROM page_content WHERE slug = $1) AS content,
         (SELECT updated_at FROM page_content WHERE slug = $1) AS updated_at,
         (SELECT value FROM site_settings WHERE key = $2) AS legacy_image`,
      [slug, legacyKey],
    );
    const row = result.rows[0] ?? {};
    return {
      content: row.content ?? null,
      updatedAt: row.updated_at ? (row.updated_at as Date).toISOString() : null,
      legacyImage: (row.legacy_image as string | null) ?? null,
    };
  }

  function resolve(stored: StoredRow): PageContentState<T> {
    if (stored.content !== null) {
      const parsed = schema.safeParse(stored.content);
      if (parsed.success) return { content: parsed.data, isCustom: true, updatedAt: stored.updatedAt };
      console.error(`[page-content:${slug}] saved content is invalid; showing the built-in content`, parsed.error.issues[0]);
    }
    const content = legacyImage && stored.legacyImage ? legacyImage.apply(defaults, stored.legacyImage) : defaults;
    return { content, isCustom: false, updatedAt: null };
  }

  // Public pages read this on every visit, so cache it and refresh only when an admin saves.
  const cachedStored = unstable_cache(readStored, ["page-content", slug], { tags: [tag] });

  async function write(content: T, adminId: string | null): Promise<void> {
    const client = await getPool().connect();
    try {
      await client.query("BEGIN");
      await client.query(
        `INSERT INTO page_content (slug, content, updated_by) VALUES ($1, $2, $3)
         ON CONFLICT (slug) DO UPDATE SET content = EXCLUDED.content, updated_by = EXCLUDED.updated_by, updated_at = now()`,
        [slug, JSON.stringify(content), adminId],
      );
      // The image now lives in the page content; drop the old standalone setting.
      if (legacyKey) await client.query(`DELETE FROM site_settings WHERE key = $1`, [legacyKey]);
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK").catch(() => undefined);
      throw error;
    } finally {
      client.release();
    }
    revalidateTag(tag);
  }

  return {
    async getContent() {
      try {
        return resolve(await cachedStored()).content;
      } catch (error) {
        console.error(`[page-content:${slug}] could not read content; using the built-in content`, error);
        return defaults;
      }
    },

    async getForAdmin() {
      return resolve(await readStored());
    },

    async save(content, adminId) {
      await write(content, adminId);
    },

    async reset() {
      await getPool().query(`DELETE FROM page_content WHERE slug = $1`, [slug]);
      if (legacyKey) await getPool().query(`DELETE FROM site_settings WHERE key = $1`, [legacyKey]);
      revalidateTag(tag);
    },

    async replaceImage(url) {
      const stored = await readStored();
      if (stored.content === null) return 0;
      const parsed = schema.safeParse(stored.content);
      if (!parsed.success) return 0;
      let replaced = 0;
      const updated = mapImages(parsed.data, (current, fallback = DEFAULT_COVER_IMAGE) => {
        if (current !== url) return current;
        replaced += 1;
        return fallback;
      });
      if (replaced) await write(updated, null);
      return replaced;
    },
  };
}

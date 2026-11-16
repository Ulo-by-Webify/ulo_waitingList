// Seeds the journal with the original launch stories (db/seed/journal-posts.json).
// Usage: npm run journal:seed — existing slugs are left untouched, so it's safe to re-run.
import { readFile } from "node:fs/promises";
import pg from "pg";
import { loadLocalEnv, pgConfig } from "./lib/pg-config.mjs";

loadLocalEnv();

const posts = JSON.parse(await readFile(new URL("../db/seed/journal-posts.json", import.meta.url), "utf8"));
const client = new pg.Client(pgConfig());

try {
  await client.connect();
  // Posts reference categories by name (foreign key), so create those first.
  for (const name of new Set(posts.map((p) => p.category))) {
    await client.query("INSERT INTO journal_categories (name) VALUES ($1) ON CONFLICT DO NOTHING", [name]);
  }
  let inserted = 0;
  for (const post of posts) {
    const result = await client.query(
      `INSERT INTO journal_posts
         (slug, title, excerpt, content, cover_image, category, author_name, tags, status, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'published', $9)
       ON CONFLICT (slug) DO NOTHING`,
      [post.slug, post.title, post.excerpt, JSON.stringify(post.content), post.coverImage, post.category, post.author, post.tags, post.publishedAt],
    );
    inserted += result.rowCount;
  }
  console.log(`Seeded ${inserted} of ${posts.length} posts (existing slugs skipped).`);
} catch (error) {
  console.error("Seed failed:", error.message);
  process.exitCode = 1;
} finally {
  await client.end();
}

import "server-only";
import { getPool } from "./db";

export type JournalCategory = { id: string; name: string; postCount: number; createdAt: string };

function toCategory(row: Record<string, unknown>): JournalCategory {
  return {
    id: String(row.id),
    name: row.name as string,
    postCount: Number(row.post_count ?? 0),
    createdAt: (row.created_at as Date).toISOString(),
  };
}

const SELECT_WITH_COUNTS = `
  SELECT c.id, c.name, c.created_at, count(p.id)::int AS post_count
  FROM journal_categories c
  LEFT JOIN journal_posts p ON p.category = c.name`;

export async function listCategories(): Promise<JournalCategory[]> {
  const result = await getPool().query(`${SELECT_WITH_COUNTS} GROUP BY c.id ORDER BY lower(c.name)`);
  return result.rows.map(toCategory);
}

async function getCategory(id: string): Promise<JournalCategory | null> {
  const result = await getPool().query(`${SELECT_WITH_COUNTS} WHERE c.id = $1 GROUP BY c.id`, [id]);
  return result.rows[0] ? toCategory(result.rows[0]) : null;
}

export type CategoryResult = { category: JournalCategory } | { error: "name-taken" | "not-found" | "in-use"; postCount?: number };

const isUniqueViolation = (error: unknown) => (error as { code?: string }).code === "23505";

export async function createCategory(name: string): Promise<CategoryResult> {
  try {
    const result = await getPool().query(
      `INSERT INTO journal_categories (name) VALUES ($1) RETURNING id, name, created_at, 0 AS post_count`,
      [name],
    );
    return { category: toCategory(result.rows[0]) };
  } catch (error) {
    if (isUniqueViolation(error)) return { error: "name-taken" };
    throw error;
  }
}

/** Renaming cascades to every post in the category (ON UPDATE CASCADE). */
export async function renameCategory(id: string, name: string): Promise<CategoryResult> {
  try {
    const result = await getPool().query(`UPDATE journal_categories SET name = $2 WHERE id = $1 RETURNING id`, [id, name]);
    if (!result.rowCount) return { error: "not-found" };
    const category = await getCategory(id);
    return category ? { category } : { error: "not-found" };
  } catch (error) {
    if (isUniqueViolation(error)) return { error: "name-taken" };
    throw error;
  }
}

export async function deleteCategory(id: string): Promise<CategoryResult> {
  const category = await getCategory(id);
  if (!category) return { error: "not-found" };
  if (category.postCount > 0) return { error: "in-use", postCount: category.postCount };
  try {
    await getPool().query(`DELETE FROM journal_categories WHERE id = $1`, [id]);
    return { category };
  } catch (error) {
    // A post may have been assigned between the count and the delete.
    if ((error as { code?: string }).code === "23503") return { error: "in-use" };
    throw error;
  }
}

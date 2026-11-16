import { z } from "zod";

/** Field rules shared by the admin-editable pages (Home, Experiences). Safe to import from client components. */

export const requiredText = (label: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} can't be empty`)
    .max(max, `${label} must be ${max} characters or fewer`);

export const optionalText = (label: string, max: number) =>
  z.string().trim().max(max, `${label} must be ${max} characters or fewer`);

/** Stable key for list items (React keys). */
export const itemIdSchema = z.string().regex(/^[a-z0-9-]{1,64}$/, "Invalid item id");

/** True when every item in the list has a different id. */
export const hasUniqueIds = (items: { id: string }[]) => new Set(items.map((item) => item.id)).size === items.length;

/** A short random id for a new list item. */
export function newItemId(prefix: string): string {
  const random = Math.random().toString(36).slice(2, 10);
  return `${prefix}-${random}`;
}

export const unsplashUrl = (id: string, width = 1200) =>
  `https://images.unsplash.com/photo-${id}?q=80&w=${width}&auto=format&fit=crop`;

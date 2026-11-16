import "server-only";
import { revalidateTag, unstable_cache } from "next/cache";
import { getPool } from "./db";
import { SITE_IMAGES, type SiteImageKey } from "@/lib/site-settings";
import { SOCIAL_NETWORKS, type SocialLinks } from "@/lib/social-links";

const SETTINGS_TAG = "site-settings";

export type SiteImage = { key: SiteImageKey; url: string; isCustom: boolean; updatedAt: string | null };

async function readOverrides(): Promise<Record<string, { value: string; updatedAt: string }>> {
  const result = await getPool().query(`SELECT key, value, updated_at FROM site_settings`);
  return Object.fromEntries(
    result.rows.map((r) => [r.key as string, { value: r.value as string, updatedAt: (r.updated_at as Date).toISOString() }]),
  );
}

// Public pages read settings on every visit, so cache them and refresh only when an admin saves.
const cachedOverrides = unstable_cache(readOverrides, ["site-settings"], { tags: [SETTINGS_TAG] });

/** The image a public page should show. Never throws: falls back to the built-in default. */
export async function getSiteImageUrl(key: SiteImageKey): Promise<string> {
  try {
    const overrides = await cachedOverrides();
    return overrides[key]?.value || SITE_IMAGES[key].defaultUrl;
  } catch (error) {
    console.error(`[settings] could not read ${key}; using the default`, error);
    return SITE_IMAGES[key].defaultUrl;
  }
}

/** Current value of every editable image, for the admin page (uncached). */
export async function listSiteImages(): Promise<SiteImage[]> {
  const overrides = await readOverrides();
  return (Object.keys(SITE_IMAGES) as SiteImageKey[]).map((key) => ({
    key,
    url: overrides[key]?.value ?? SITE_IMAGES[key].defaultUrl,
    isCustom: Boolean(overrides[key]),
    updatedAt: overrides[key]?.updatedAt ?? null,
  }));
}

export async function setSiteImage(key: SiteImageKey, url: string, adminId: string): Promise<void> {
  await getPool().query(
    `INSERT INTO site_settings (key, value, updated_by) VALUES ($1, $2, $3)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_by = EXCLUDED.updated_by, updated_at = now()`,
    [key, url, adminId],
  );
  revalidateTag(SETTINGS_TAG);
}

/** Goes back to the built-in default image. */
export async function resetSiteImage(key: SiteImageKey): Promise<void> {
  await getPool().query(`DELETE FROM site_settings WHERE key = $1`, [key]);
  revalidateTag(SETTINGS_TAG);
}

/** Resets any setting that points at a deleted media file. Returns how many were reset. */
export async function resetSettingsUsing(url: string): Promise<number> {
  const result = await getPool().query(`DELETE FROM site_settings WHERE value = $1`, [url]);
  if (result.rowCount) revalidateTag(SETTINGS_TAG);
  return result.rowCount ?? 0;
}

// ---------- Social links ----------

const socialKey = (id: string) => `social_${id}`;

/** Links shown in the footer and on the sign-up success screen. Never throws: no links on failure. */
export async function getSocialLinks(): Promise<SocialLinks> {
  try {
    const overrides = await cachedOverrides();
    return Object.fromEntries(
      SOCIAL_NETWORKS.flatMap((n) => (overrides[socialKey(n.id)] ? [[n.id, overrides[socialKey(n.id)].value]] : [])),
    );
  } catch (error) {
    console.error("[settings] could not read social links", error);
    return {};
  }
}

/** Uncached, for the admin page. */
export async function getSocialLinksForAdmin(): Promise<SocialLinks> {
  const overrides = await readOverrides();
  return Object.fromEntries(
    SOCIAL_NETWORKS.flatMap((n) => (overrides[socialKey(n.id)] ? [[n.id, overrides[socialKey(n.id)].value]] : [])),
  );
}

/** Saves every network at once: a blank link removes that network from the site. */
export async function setSocialLinks(links: SocialLinks, adminId: string): Promise<void> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    for (const network of SOCIAL_NETWORKS) {
      const url = links[network.id];
      if (url) {
        await client.query(
          `INSERT INTO site_settings (key, value, updated_by) VALUES ($1, $2, $3)
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_by = EXCLUDED.updated_by, updated_at = now()`,
          [socialKey(network.id), url, adminId],
        );
      } else {
        await client.query(`DELETE FROM site_settings WHERE key = $1`, [socialKey(network.id)]);
      }
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
  revalidateTag(SETTINGS_TAG);
}

import "server-only";
import { revalidateTag, unstable_cache } from "next/cache";
import { getPublishedStory, listHeroSlides, listPublishedStories, listRelatedStories } from "./journal-repo";

/**
 * Cached reads for the public journal. Each query to the database costs ~300ms from far away,
 * so public pages reuse results until an admin changes a post, a category or a cover image.
 * The short time limit also lets scheduled posts appear on their own.
 */
const JOURNAL_TAG = "journal";
const options = { tags: [JOURNAL_TAG], revalidate: 60 };

export const getCachedPublishedStories = unstable_cache(listPublishedStories, ["journal:stories"], options);
export const getCachedHeroSlides = unstable_cache(listHeroSlides, ["journal:hero"], options);
export const getCachedStory = unstable_cache(getPublishedStory, ["journal:story"], options);
export const getCachedRelatedStories = unstable_cache(listRelatedStories, ["journal:related"], options);

/** Call after any change that affects what the public journal shows. */
export function refreshJournalCache(): void {
  revalidateTag(JOURNAL_TAG);
}

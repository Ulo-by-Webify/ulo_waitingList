import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import JournalClient from "@/screens/JournalClient";
import { getCachedHeroSlides, getCachedPublishedStories } from "@/lib/server/journal-cache";
import { getSiteImageUrl } from "@/lib/server/settings-repo";

export const metadata: Metadata = pageMetadata({
  title: "Journal",
  description: "Stories, culture and moments from across Africa, curated by Ulô.",
  path: "/journal",
});

// Posts are managed in the admin, so render on each request to show changes immediately.
export const dynamic = "force-dynamic";

export default async function Page() {
  const [heroSlides, stories, emptyHeroImage] = await Promise.all([
    getCachedHeroSlides(),
    getCachedPublishedStories(),
    getSiteImageUrl("journal_hero_empty"),
  ]);
  return <JournalClient heroSlides={heroSlides} stories={stories} emptyHeroImage={emptyHeroImage} />;
}

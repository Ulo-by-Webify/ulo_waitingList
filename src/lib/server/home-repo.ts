import "server-only";
import { DEFAULT_HOME_CONTENT, HOME_PHOTO_SLOTS, homeContentSchema, type HomeContent } from "@/lib/home-content";
import { createPageContentRepo, type PageContentState } from "./page-content-repo";

export type HomeContentState = PageContentState<HomeContent>;

const repo = createPageContentRepo<HomeContent>({
  slug: "home",
  schema: homeContentSchema,
  defaults: DEFAULT_HOME_CONTENT,
  // Before the whole page was editable, only the "Every step brings you closer." photo was.
  legacyImage: {
    key: "home_closer_banner",
    apply: (content, url) => ({ ...content, closer: { ...content.closer, image: url } }),
  },
  mapImages: (content, swap) => ({
    ...content,
    // A deleted video falls back to the built-in one, not an image.
    hero: { ...content.hero, video: swap(content.hero.video, DEFAULT_HOME_CONTENT.hero.video) },
    showcase: {
      ...content.showcase,
      previewVideo: swap(content.showcase.previewVideo, DEFAULT_HOME_CONTENT.showcase.previewVideo),
      poster: swap(content.showcase.poster, DEFAULT_HOME_CONTENT.showcase.poster),
      film: swap(content.showcase.film, DEFAULT_HOME_CONTENT.showcase.film),
    },
    listing: { ...content.listing, cards: content.listing.cards.map((c) => ({ ...c, image: swap(c.image) })) },
    closer: { ...content.closer, image: swap(content.closer.image) },
    places: { ...content.places, items: content.places.items.map((p) => ({ ...p, image: swap(p.image) })) },
    homes: {
      ...content.homes,
      photos: Object.fromEntries(
        HOME_PHOTO_SLOTS.map((slot) => [slot, { ...content.homes.photos[slot], image: swap(content.homes.photos[slot].image) }]),
      ) as HomeContent["homes"]["photos"],
    },
  }),
});

export const getHomeContent = repo.getContent;
export const getHomeContentForAdmin = repo.getForAdmin;
export const saveHomeContent = repo.save;
export const resetHomeContent = repo.reset;
export const replaceHomeImage = repo.replaceImage;

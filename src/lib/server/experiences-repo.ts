import "server-only";
import {
  DEFAULT_EXPERIENCES_CONTENT,
  experiencesContentSchema,
  type ExperiencesContent,
} from "@/lib/experiences-content";
import { createPageContentRepo, type PageContentState } from "./page-content-repo";

export type ExperiencesContentState = PageContentState<ExperiencesContent>;

const repo = createPageContentRepo<ExperiencesContent>({
  slug: "experiences",
  schema: experiencesContentSchema,
  defaults: DEFAULT_EXPERIENCES_CONTENT,
  // Before the whole page was editable, only the hero image was.
  legacyImage: {
    key: "experiences_hero",
    apply: (content, url) => ({ ...content, hero: { ...content.hero, image: url } }),
  },
  mapImages: (content, swap) => ({
    ...content,
    hero: { ...content.hero, image: swap(content.hero.image) },
    showcase: { ...content.showcase, slides: content.showcase.slides.map((s) => ({ ...s, image: swap(s.image) })) },
    rows: content.rows.map((row) => ({ ...row, cards: row.cards.map((c) => ({ ...c, image: swap(c.image) })) })),
    provider: { ...content.provider, image: swap(content.provider.image) },
  }),
});

export const getExperiencesContent = repo.getContent;
export const getExperiencesContentForAdmin = repo.getForAdmin;
export const saveExperiencesContent = repo.save;
export const resetExperiencesContent = repo.reset;
export const replaceExperiencesImage = repo.replaceImage;

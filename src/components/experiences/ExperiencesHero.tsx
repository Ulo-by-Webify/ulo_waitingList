"use client";

import Header from "@/components/Header";
import CoverImage from "@/components/journal/CoverImage";
import type { ExperiencesContent } from "@/lib/experiences-content";

type ExperiencesHeroProps = { hero: ExperiencesContent["hero"] };

/** Top of /experiences. Text and photo are edited on the admin Experiences page. */
const ExperiencesHero = ({ hero }: ExperiencesHeroProps) => (
  <section className="relative flex min-h-[90dvh] w-full flex-col overflow-hidden">
    <CoverImage
      src={hero.image}
      alt=""
      fetchPriority="high"
      className="absolute inset-0 h-full w-full object-cover"
    />
    <div className="absolute inset-0 bg-black/35" />
    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

    <div className="relative z-10 flex flex-1 flex-col">
      <Header overlay={false} />

      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-24 pt-6 text-center sm:pb-32">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl">{hero.title}</h1>
        {hero.subtitle && <p className="mt-6 max-w-xl text-base text-white/85 sm:text-lg">{hero.subtitle}</p>}
      </div>
    </div>
  </section>
);

export default ExperiencesHero;

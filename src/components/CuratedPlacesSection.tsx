"use client";

import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import type { HomeContent } from "@/lib/home-content";

type CuratedPlacesSectionProps = {
  /** Heading, cities and link, edited on the admin Home page. */
  places: HomeContent["places"];
};

const COLUMN = "mx-auto max-w-7xl px-6";
// The row starts in line with the heading and runs off the right edge, so the last card shows half.
const BLEED_START = "pl-[max(1.5rem,calc((100vw_-_80rem)/2_+_1.5rem))]";
const BLEED_END = "last:mr-[max(1.5rem,calc((100vw_-_80rem)/2_+_1.5rem))]";
const CARD_WIDTH =
  "flex-[0_0_calc((100%_-_1rem)/1.5)] sm:flex-[0_0_calc((100%_-_2rem)/2.5)] lg:flex-[0_0_calc((100%_-_4rem)/4.5)]";

/** Homepage "Curated Places": the cities Ulô is launching in. */
export default function CuratedPlacesSection({ places }: CuratedPlacesSectionProps) {
  const [emblaRef] = useEmblaCarousel({ align: "start", dragFree: true, containScroll: "trimSnaps" });

  return (
    <section id="explore-section" aria-labelledby="curated-places-heading" className="scroll-mt-20 bg-white py-16 md:py-24">
      <div className={`${COLUMN} grid gap-6 md:grid-cols-2 md:gap-12`}>
        <div>
          {places.tag && (
            <span className="mb-6 inline-block rounded-full border border-gray-400 px-4 py-1.5 text-sm text-gray-700">{places.tag}</span>
          )}
          <h2 id="curated-places-heading" className="text-4xl font-medium tracking-tight text-gray-900 md:text-5xl">
            {places.title}
          </h2>
        </div>
        {places.body && <p className="text-lg leading-relaxed text-gray-500 md:text-xl text-pretty">{places.body}</p>}
      </div>

      <div className="mt-12 overflow-hidden md:mt-16" ref={emblaRef}>
        <ul className={`flex gap-4 ${BLEED_START}`}>
          {places.items.map((place) => (
            <li key={place.id} className={`min-w-0 ${CARD_WIDTH} ${BLEED_END}`}>
              <article className="relative aspect-[3/5] overflow-hidden rounded-[2rem] bg-gray-800">
                <img src={place.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <div className="flex items-center justify-between gap-3 border-b border-white/60 pb-2">
                    <h3 className="text-xl font-medium text-white">
                      {place.city}, {place.country}
                    </h3>
                    <img
                      src={`https://flagcdn.com/w80/${place.countryCode}.png`}
                      alt={`${place.country} flag`}
                      loading="lazy"
                      className="h-5 w-8 shrink-0 rounded-sm object-cover"
                    />
                  </div>
                  {place.tagline && <p className="mt-3 text-sm text-white/90">{place.tagline}</p>}
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/begin-your-journey"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-900 underline underline-offset-4 hover:text-gray-600"
        >
          {places.linkLabel} <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

"use client";

import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaCarouselType } from "embla-carousel";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import CoverImage from "@/components/journal/CoverImage";
import type { ExperienceRow } from "@/lib/experiences-content";

interface ExperienceCategoryRowProps {
  row: ExperienceRow;
  showCta?: boolean;
  onCtaClick?: () => void;
}

/**
 * Cards start in line with the max-w-7xl content column and run off the right edge of the screen,
 * so the next card peeks in. The same space is left after the last card. That end space is a margin
 * on the last card: Embla counts it when deciding where to stop, but ignores right padding on the track.
 */
const COLUMN = "mx-auto max-w-7xl px-6";
const BLEED_START = "pl-[max(1.5rem,calc((100vw_-_80rem)/2_+_1.5rem))]";
const BLEED_END = "last:mr-[max(1.5rem,calc((100vw_-_80rem)/2_+_1.5rem))]";
/**
 * Whole cards plus exactly half of the next one fill the space from the heading to the screen edge:
 * 1½ on phones, 2½ on tablets, 4½ on laptops. % is of that space; the rem is the gap-4 gaps before the half card.
 * Cards may grow: a row too short to scroll (e.g. 4 cards on a laptop) stretches to fill the content column
 * instead of leaving a gap. Rows that overflow have no spare space, so they stay at the base width.
 */
const CARD_WIDTH =
  "flex-[1_0_calc((100%_-_1rem)/1.5)] sm:flex-[1_0_calc((100%_-_2rem)/2.5)] lg:flex-[1_0_calc((100%_-_4rem)/4.5)]";

const ARROW_BASE =
  "flex h-9 w-9 items-center justify-center rounded-full border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/30 disabled:cursor-default";
const ARROW_ACTIVE = "border-gray-900 bg-gray-900 text-white hover:bg-gray-700";
const ARROW_IDLE = "border-gray-300 bg-white text-gray-500";

const ExperienceCategoryRow: React.FC<ExperienceCategoryRowProps> = ({
  row,
  showCta = false,
  onCtaClick,
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    dragFree: true,
    containScroll: "trimSnaps",
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateButtons = useCallback((api: EmblaCarouselType) => {
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    updateButtons(emblaApi);
    emblaApi.on("select", updateButtons).on("reInit", updateButtons).on("scroll", updateButtons);
    return () => {
      emblaApi.off("select", updateButtons).off("reInit", updateButtons).off("scroll", updateButtons);
    };
  }, [emblaApi, updateButtons]);

  return (
    <section className="py-10 sm:py-14" id={row.id}>
      <div className={COLUMN}>
        <div className="flex items-start justify-between gap-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
              {row.title}
            </h2>
            <p className="mt-2 text-gray-500">{row.subtitle}</p>
          </div>

          {showCta && (
            <button
              onClick={onCtaClick}
              className="hidden shrink-0 whitespace-nowrap text-sm font-medium text-gray-900 underline underline-offset-4 decoration-1 hover:opacity-70 transition sm:block"
            >
              Be Among the First →
            </button>
          )}
        </div>
      </div>

      <div className="mt-8 overflow-hidden" ref={emblaRef}>
        <div className={`flex gap-4 ${BLEED_START}`}>
            {row.cards.map((item) => (
              <div
                key={item.id}
                className={`min-w-0 ${CARD_WIDTH} ${BLEED_END}`}
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
                  <CoverImage
                    src={item.image}
                    loading="lazy"
                    alt={item.title}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <h3 className="text-base font-semibold text-white">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs text-white/80">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className={COLUMN}>
        <div className="mt-6 flex items-center justify-between gap-4">
          <span className="inline-flex items-center rounded-full border border-gray-500 px-4 py-1.5 text-xs font-medium text-gray-700">
            Handpicked
          </span>

          {(canScrollPrev || canScrollNext) && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => emblaApi?.scrollPrev()}
                disabled={!canScrollPrev}
                aria-label={`Previous ${row.title} items`}
                className={`${ARROW_BASE} ${canScrollPrev ? ARROW_ACTIVE : ARROW_IDLE}`}
              >
                <ChevronLeftIcon className="h-4 w-4" strokeWidth={2.5} />
              </button>
              <button
                type="button"
                onClick={() => emblaApi?.scrollNext()}
                disabled={!canScrollNext}
                aria-label={`Next ${row.title} items`}
                className={`${ARROW_BASE} ${canScrollNext ? ARROW_ACTIVE : ARROW_IDLE}`}
              >
                <ChevronRightIcon className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ExperienceCategoryRow;

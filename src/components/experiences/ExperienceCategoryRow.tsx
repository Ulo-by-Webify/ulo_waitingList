"use client";

import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ExperienceCategory } from "@/data/experiences";

interface ExperienceCategoryRowProps {
  category: ExperienceCategory;
  showCta?: boolean;
  onCtaClick?: () => void;
}

const ExperienceCategoryRow: React.FC<ExperienceCategoryRowProps> = ({
  category,
  showCta = false,
  onCtaClick,
}) => {
  const [emblaRef] = useEmblaCarousel({
    align: "start",
    dragFree: true,
    containScroll: "trimSnaps",
  });

  return (
    <section className="py-10 sm:py-14" id={category.id}>
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
              {category.title}
            </h2>
            <p className="mt-2 text-gray-500">{category.subtitle}</p>
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

        <div className="mt-8 overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4">
            {category.items.map((item) => (
              <div
                key={item.title}
                className="min-w-0 flex-[0_0_78%] sm:flex-[0_0_42%] lg:flex-[0_0_calc(25%-0.75rem)]"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
                  <img
                    src={item.image}
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

        <div className="mt-6">
          <span className="inline-flex items-center rounded-full border border-gray-500 px-4 py-1.5 text-xs font-medium text-gray-700">
            Handpicked
          </span>
        </div>
      </div>
    </section>
  );
};

export default ExperienceCategoryRow;

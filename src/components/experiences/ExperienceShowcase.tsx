"use client";

import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CoverImage from "@/components/journal/CoverImage";
import type { ExperiencesContent } from "@/lib/experiences-content";

type ExperienceShowcaseProps = { showcase: ExperiencesContent["showcase"] };

const ExperienceShowcase = ({ showcase }: ExperienceShowcaseProps) => {
  const slides = showcase.slides;
  const hasMany = slides.length > 1;
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: hasMany, active: hasMany });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect).on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect).off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi || !hasMany) return;
    const interval = setInterval(() => emblaApi.scrollNext(), 4500);
    return () => clearInterval(interval);
  }, [emblaApi, hasMany]);

  const current = slides[Math.min(selectedIndex, slides.length - 1)];

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  );

  return (
    <section className="relative bg-[#F7F1E8] pb-20 pt-16 sm:pb-28 sm:pt-0">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-full h-16 rounded-t-[100%] bg-[#F7F1E8] sm:h-28"
      />

      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-3xl font-semibold text-gray-900 sm:text-4xl">
          {showcase.title}
        </h2>
        {showcase.body && <p className="mt-4 text-gray-500">{showcase.body}</p>}
      </div>

      <div className="mx-auto mt-12 max-w-4xl px-6">
        <div className="relative overflow-hidden rounded-3xl" ref={emblaRef}>
          <div className="flex">
            {slides.map((slide) => (
              <div key={slide.id} className="relative min-w-0 flex-[0_0_100%]">
                <div className="relative aspect-[16/10] sm:aspect-[16/9]">
                  <CoverImage
                    src={slide.image}
                    alt={slide.title}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />
                </div>
              </div>
            ))}
          </div>

          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6">
            <div>
              <p className="text-lg font-medium text-white">
                {current?.title}
              </p>
              {current?.subtitle && (
                <p className="mt-1 text-sm text-white/75">{current.subtitle}</p>
              )}
            </div>

            <div className={`flex items-center gap-1.5 ${hasMany ? "" : "hidden"}`}>
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollTo(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === selectedIndex ? "w-6 bg-white" : "w-1.5 bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className={`mt-6 items-center justify-center gap-3 ${hasMany ? "flex" : "hidden"}`}>
          <button
            onClick={scrollPrev}
            aria-label="Previous"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-900 transition hover:bg-black/5"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={scrollNext}
            aria-label="Next"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-white transition hover:bg-gray-700"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default ExperienceShowcase;

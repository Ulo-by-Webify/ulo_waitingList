"use client";

import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

interface LivedCard {
  title: string;
  subtitle: string;
  image?: string;
  icon?: string;
  bg?: string;
}

const cards: LivedCard[] = [
  {
    title: "Stay Somewhere That Means Something",
    subtitle: "Homes rooted in culture, not just comfort.",
    image: "/Africanna.jpg",
  },
  {
    title: "Move Like You Belong",
    subtitle: "Explore with trusted locals who open up the real Africa.",
    image: "/Eden.jpg",
  },
  {
    title: "Ulô Has Your Back",
    subtitle: "Helping you settle in, every step of the way.",
    icon: "/icons/ulo-badge.png",
    bg: "#5B3A29",
  },
  {
    title: "Pay However Feels Right",
    subtitle: "Borderless payments, so you can focus on the journey.",
    icon: "/icons/coweries.png",
    bg: "#12312A",
  },
  {
    title: "Comfort, Reimagined",
    subtitle: "Modern stays without losing the soul of the place.",
    image: "/Urban.jpg",
  },
];

const NotAListingSection: React.FC = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    dragFree: true,
    containScroll: "trimSnaps",
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  const onScroll = useCallback(() => {
    if (!emblaApi) return;
    const progress = Math.max(0, Math.min(1, emblaApi.scrollProgress()));
    setScrollProgress(progress * 100);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    onScroll();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("scroll", onScroll);
    emblaApi.on("reInit", onScroll);
  }, [emblaApi, onSelect, onScroll]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const scrollToExplore = () => {
    const section = document.getElementById("explore-section");
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  const thumbWidth = 25;

  return (
    <section className="bg-[#F4EEE2] py-20 md:py-28">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-6xl font-bold text-neutral-900 leading-[1.05] tracking-tight">
          Africa is not a listing.
          <br />
          It’s lived.
        </h2>
        <p className="mt-5 text-lg text-neutral-500">
          Built for a deeper way to experience Africa
        </p>
      </div>

      <div className="mt-14">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-5 pl-6 md:pl-[max(1.5rem,calc((100vw-72rem)/2))]">
            {cards.map((card, index) => (
              <div
                key={index}
                className={`flex-[0_0_82%] sm:flex-[0_0_55%] lg:flex-[0_0_37%] min-w-0 ${
                  index === cards.length - 1
                    ? "mr-6 md:mr-[max(1.5rem,calc((100vw-72rem)/2))]"
                    : ""
                }`}
              >
                <div className="relative aspect-[3/2] rounded-3xl overflow-hidden">
                  {card.image ? (
                    <img
                      src={card.image}
                      alt={card.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ backgroundColor: card.bg }}
                    >
                      {card.icon && (
                        <img
                          src={card.icon}
                          alt=""
                          className="h-auto w-40 md:w-52 object-contain opacity-90"
                        />
                      )}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 inset-x-0 p-6 md:p-7 text-left">
                    <h3 className="text-white text-xl md:text-2xl font-bold">
                      {card.title}
                    </h3>
                    <p className="text-white/85 mt-1.5 max-w-sm">
                      {card.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-8 flex items-center justify-between">
        <div className="h-1 w-32 sm:w-48 bg-neutral-300 rounded-full overflow-hidden">
          <div
            className="h-full bg-neutral-900 rounded-full"
            style={{
              width: `${thumbWidth}%`,
              transform: `translateX(${
                (scrollProgress / 100) * (100 / thumbWidth - 1) * 100
              }%)`,
            }}
          />
        </div>

        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            aria-label="Previous"
            className="h-11 w-11 flex items-center justify-center rounded-full border border-neutral-300 text-neutral-900 disabled:opacity-30 hover:bg-black/5 transition"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={scrollNext}
            disabled={!canScrollNext}
            aria-label="Next"
            className="h-11 w-11 flex items-center justify-center rounded-full bg-neutral-900 text-white disabled:opacity-30 hover:bg-neutral-700 transition"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="mt-10 flex justify-center">
        <button
          onClick={scrollToExplore}
          className="group inline-flex items-center gap-2 rounded-full border border-neutral-900 px-6 py-3 text-neutral-900 font-medium hover:bg-neutral-900 hover:text-white transition"
        >
          Explore Further
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </section>
  );
};

export default NotAListingSection;

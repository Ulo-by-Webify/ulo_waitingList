"use client";

import React, { useEffect, useRef, useState } from "react";
import CoverImage from "./CoverImage";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { JournalFeaturedStory } from "@/types";
import Header from "@/components/Header";

interface JournalHeroProps {
  stories: JournalFeaturedStory[];
  /** Background photo while no post is featured. Falls back to a warm gradient if it can't load. */
  emptyImage?: string;
}

const SLIDE_INTERVAL_MS = 6000;

/** Shown when no published post carries the "featured" tag. */
const JournalHeroEmpty = ({ image }: { image?: string }) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [hasImage, setHasImage] = useState(Boolean(image));

  // The image can fail before React hydrates (onError never fires); a loaded image with no pixels failed.
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth === 0) setHasImage(false);
  }, []);

  return (
    <section className="px-4 sm:px-6 lg:px-8 pt-6 sm:h-[100dvh] sm:pb-6">
      <div className="relative rounded-[28px] overflow-hidden min-h-[600px] sm:h-full sm:min-h-0 flex flex-col bg-[#2B2520]">
        {hasImage && image ? (
          <>
            <img
              ref={imgRef}
              src={image}
              alt=""
              onError={() => setHasImage(false)}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-black/35" />
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
            />
          </>
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-60"
            style={{
              background:
                "radial-gradient(ellipse at 20% 100%, rgba(196,140,84,0.45), transparent 60%), radial-gradient(ellipse at 90% 10%, rgba(247,241,232,0.18), transparent 55%)",
            }}
          />
        )}
        <div className="relative z-10">
          <Header overlay={false} />
        </div>
        <div className="relative z-10 mt-auto px-6 sm:px-10 lg:px-12 pb-12 pt-24">
          <div className="max-w-2xl">
            <p className="text-white/70 text-sm font-medium mb-3">
              The Ulô Journal
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white leading-tight mb-4">
              Stories from across Africa, told up close
            </h1>
            <p className="text-white/75 text-sm sm:text-base max-w-lg">
              Featured stories will appear here soon. In the meantime, explore
              the latest below.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

const JournalHero: React.FC<JournalHeroProps> = ({ stories, emptyImage }) => {
  const [current, setCurrent] = useState(0);

  const hasMultiple = stories.length > 1;

  useEffect(() => {
    if (!hasMultiple) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % stories.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [hasMultiple, stories.length]);

  if (stories.length === 0) return <JournalHeroEmpty image={emptyImage} />;

  const goTo = (index: number) => setCurrent(index);
  const prevSlide = () =>
    setCurrent((prev) => (prev - 1 + stories.length) % stories.length);
  const nextSlide = () => setCurrent((prev) => (prev + 1) % stories.length);

  // Guard against the slide list shrinking while `current` points past the end.
  const story = stories[current % stories.length];

  return (
    <section className="px-4 sm:px-6 lg:px-8 pt-6 sm:h-[100dvh] sm:pb-6">
      <div className="relative rounded-[28px] overflow-hidden min-h-[600px] sm:h-full sm:min-h-0 flex flex-col">
        {/* Background */}
        {stories.map((slide, index) => (
          <CoverImage
            key={slide.id}
            src={slide.image}
            alt={slide.title}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              index === current ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Header */}
        <div className="relative z-10">
          <Header overlay={false} />
        </div>

        {/* Content */}
        <div className="relative z-10 mt-auto px-6 sm:px-10 lg:px-12 pb-10 pt-24">
          <div className="max-w-2xl">
            <p className="text-white/80 text-sm font-medium mb-3">
              {story.tag}
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white leading-tight mb-4">
              {story.title}
            </h1>
            <p className="text-white/80 text-sm sm:text-base max-w-lg mb-6">
              {story.description}
            </p>
            <Link
              href={story.href}
              className="inline-flex items-center gap-1.5 text-white font-medium underline underline-offset-4 decoration-1 hover:opacity-80 transition"
            >
              Read story →
            </Link>
          </div>

          {hasMultiple && (
            <div className="flex items-center justify-between mt-10">
              <div className="flex items-center gap-2">
                {stories.map((slide, index) => (
                  <button
                    key={slide.id}
                    onClick={() => goTo(index)}
                    aria-label={`Go to slide ${index + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === current ? "w-6 bg-white" : "w-1.5 bg-white/40"
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={prevSlide}
                  aria-label="Previous story"
                  className="h-9 w-9 rounded-full border border-white/50 text-white flex items-center justify-center hover:bg-white/10 transition"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={nextSlide}
                  aria-label="Next story"
                  className="h-9 w-9 rounded-full bg-white text-gray-900 flex items-center justify-center hover:opacity-90 transition"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default JournalHero;

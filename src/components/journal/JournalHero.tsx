"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { JournalFeaturedStory } from "@/types";
import Header from "@/components/Header";

interface JournalHeroProps {
  stories: JournalFeaturedStory[];
}

const JournalHero: React.FC<JournalHeroProps> = ({ stories }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % stories.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [stories.length]);

  const goTo = (index: number) => setCurrent(index);
  const prevSlide = () =>
    setCurrent((prev) => (prev - 1 + stories.length) % stories.length);
  const nextSlide = () => setCurrent((prev) => (prev + 1) % stories.length);

  const story = stories[current];

  return (
    <section className="px-4 sm:px-6 lg:px-8 pt-6 sm:h-[100dvh] sm:pb-6">
      <div className="relative rounded-[28px] overflow-hidden min-h-[600px] sm:h-full sm:min-h-0 flex flex-col">
        {/* Background */}
        {stories.map((slide, index) => (
          <img
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
            <p className="text-white/80 text-sm font-medium mb-3">{story.tag}</p>
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
        </div>
      </div>
    </section>
  );
};

export default JournalHero;

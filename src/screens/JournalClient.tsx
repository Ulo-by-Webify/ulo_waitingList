"use client";

import React, { useEffect, useRef, useState } from "react";
import { BookOpenIcon } from "@heroicons/react/24/outline";
import JournalHero from "@/components/journal/JournalHero";
import StoryCard from "@/components/journal/StoryCard";
import Footer from "@/components/Footer";
import Newsletter from "@/components/Newsletter";
import type { JournalFeaturedStory, JournalStory } from "@/types";

const PAGE_SIZE = 9;

interface JournalClientProps {
  heroSlides: JournalFeaturedStory[];
  /** Hero background while no post is featured (set on the admin Site page). */
  emptyHeroImage: string;
  stories: JournalStory[];
}

const JournalClient = ({ heroSlides, stories: journalStories, emptyHeroImage }: JournalClientProps) => {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const visibleStories = journalStories.slice(0, visibleCount);
  const hasMore = visibleCount < journalStories.length;

  useEffect(() => {
    if (!hasMore) return;
    const sentinel = loadMoreRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, journalStories.length));
        }
      },
      { rootMargin: "400px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, visibleCount]);

  return (
    <div className="min-h-screen bg-[#F7F1E8]">
      <JournalHero stories={heroSlides} emptyImage={emptyHeroImage} />

      <section className="px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center">
        <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-4">
          A different way to see Africa
        </h2>
        <p className="text-gray-500 max-w-lg mx-auto">
          Not through highlights, but through the details, how people live,
          move, and experience it every day.
        </p>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 pb-10">
        <div className="max-w-7xl mx-auto border-t border-gray-200 pt-10">
          <div className="mb-10">
            <h3 className="text-xl font-semibold text-gray-900">Recent Stories</h3>
          </div>

          {journalStories.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-300 bg-white/60 px-6 py-16 text-center">
              <BookOpenIcon className="mx-auto h-10 w-10 text-gray-400" aria-hidden="true" />
              <h4 className="mt-4 text-lg font-semibold text-gray-900">No stories yet</h4>
              <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
                We&apos;re gathering stories from across the continent. Subscribe below and we&apos;ll
                let you know when the first ones land.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {visibleStories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          )}

          {hasMore && (
            <div ref={loadMoreRef} className="flex justify-center mt-14 h-10">
              <div className="h-6 w-6 rounded-full border-2 border-gray-300 border-t-gray-900 animate-spin" />
            </div>
          )}
        </div>
      </section>

      <Newsletter />

      <Footer />
    </div>
  );
};

export default JournalClient;

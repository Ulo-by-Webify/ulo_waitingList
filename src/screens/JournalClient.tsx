"use client";

import React, { useEffect, useRef, useState } from "react";
import JournalHero from "@/components/journal/JournalHero";
import StoryCard from "@/components/journal/StoryCard";
import Footer from "@/components/Footer";
import Newsletter from "@/components/Newsletter";
import { journalFeaturedStories, journalStories } from "@/data";

const PAGE_SIZE = 9;

const JournalClient = () => {
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
      <JournalHero stories={journalFeaturedStories} />

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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {visibleStories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>

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

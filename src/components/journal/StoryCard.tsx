"use client";

import Link from "next/link";
import { JournalStory } from "@/types";

interface StoryCardProps {
  story: JournalStory;
}

const StoryCard: React.FC<StoryCardProps> = ({ story }) => {
  return (
    <Link href={story.href} className="group block">
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-300 mb-4">
        <img
          src={story.image ?? "/placeholder.jpg"}
          alt={story.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 leading-snug mb-2 group-hover:opacity-70 transition">
        {story.title}
      </h3>
      <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2">
        {story.excerpt}
      </p>

      <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
        <img
          src={story.authorAvatar ?? "/avatar-placeholder.jpg"}
          alt={story.author}
          className="h-6 w-6 rounded-full object-cover flex-shrink-0"
        />
        <span className="text-sm font-medium text-gray-900">{story.author}</span>
        <span className="text-sm text-gray-400">· {story.category}</span>
        <span className="text-sm text-gray-400">· {story.date}</span>
      </div>
    </Link>
  );
};

export default StoryCard;

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import {
  FaWhatsapp,
  FaFacebookF,
  FaLinkedinIn,
  FaXTwitter,
  FaThreads,
} from "react-icons/fa6";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import RichText from "@/components/journal/RichText";
import { JournalStory } from "@/types";

const shareLinks = [
  { icon: FaWhatsapp, label: "WhatsApp" },
  { icon: FaFacebookF, label: "Facebook" },
  { icon: FaLinkedinIn, label: "LinkedIn" },
  { icon: FaXTwitter, label: "X" },
  { icon: FaThreads, label: "Threads" },
];

interface JournalDetailClientProps {
  story: JournalStory;
  relatedStories: JournalStory[];
}

const JournalDetailClient: React.FC<JournalDetailClientProps> = ({
  story,
  relatedStories,
}) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(story.likes ?? 0);
  const [comment, setComment] = useState("");

  const toggleLike = () => {
    setLiked((prev) => !prev);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    toast.success("Comment posted!");
    setComment("");
  };

  return (
    <div className="min-h-screen bg-[#F7F1E8]">
      <Header theme="light" overlay={false} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="flex items-center justify-between py-6">
          <Link
            href="/journal"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-900 hover:opacity-70 transition"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Go Back to Stories
          </Link>

          <div className="relative hidden sm:block">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="search"
              placeholder="Search stories..."
              className="w-56 rounded-full border border-gray-200 bg-white/70 pl-10 pr-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10 pb-16">
          {/* Main column */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 leading-tight mb-3">
              {story.title}
            </h1>
            <div className="flex items-center gap-2 mb-6">
              <img
                src={story.authorAvatar ?? "/avatar-placeholder.jpg"}
                alt={story.author}
                className="h-8 w-8 rounded-full object-cover flex-shrink-0"
              />
              <span className="text-sm font-medium text-gray-900">
                {story.author}
              </span>
              <span className="text-sm text-gray-400">
                · {story.category}
              </span>
              <span className="text-sm text-gray-400">· {story.date}</span>
            </div>

            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-gray-300 mb-8">
              <img
                src={story.image ?? "/placeholder.jpg"}
                alt={story.title}
                className="w-full h-full object-cover"
              />
            </div>

            <article className="space-y-5 text-gray-700 leading-relaxed">
              {(story.content ?? [{ type: "paragraph", text: story.excerpt }]).map(
                (block, index) => {
                  if (block.type === "heading") {
                    return (
                      <h3
                        key={index}
                        className="text-lg font-semibold text-gray-900 pt-2"
                      >
                        {block.text}
                      </h3>
                    );
                  }

                  if (block.type === "list") {
                    return (
                      <ul key={index} className="space-y-3 list-disc pl-5">
                        {block.items.map((item, itemIndex) => (
                          <li key={itemIndex}>
                            <RichText text={item} />
                          </li>
                        ))}
                      </ul>
                    );
                  }

                  return (
                    <p key={index}>
                      <RichText text={block.text} />
                    </p>
                  );
                }
              )}
            </article>

            {/* Engagement bar */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-10 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-5">
                <button
                  onClick={toggleLike}
                  className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition"
                >
                  {liked ? (
                    <HeartIconSolid className="h-5 w-5 text-red-500" />
                  ) : (
                    <HeartIcon className="h-5 w-5" />
                  )}
                  {likeCount} Likes
                </button>
                <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                  <ChatBubbleLeftIcon className="h-5 w-5" />
                  {story.commentsCount ?? 0} Comments
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                  <ShareIcon className="h-5 w-5" />
                  {story.shares ?? 0} Shares
                </span>
              </div>

              <form
                onSubmit={handleComment}
                className="flex-1 flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2"
              >
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
                />
                <button
                  type="submit"
                  aria-label="Post comment"
                  className="h-8 w-8 flex-shrink-0 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-gray-800 transition"
                >
                  <PaperAirplaneIcon className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-10">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">
                Share to
              </h4>
              <div className="flex items-center gap-2">
                {shareLinks.map(({ icon: Icon, label }) => (
                  <button
                    key={label}
                    aria-label={`Share to ${label}`}
                    className="h-9 w-9 rounded-full border border-gray-200 bg-white text-gray-700 flex items-center justify-center hover:bg-gray-900 hover:text-white hover:border-gray-900 transition"
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>

            {relatedStories.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-4">
                  Related Stories
                </h4>
                <div className="space-y-4">
                  {relatedStories.map((related) => (
                    <Link
                      key={related.id}
                      href={related.href}
                      className="group flex items-center gap-3"
                    >
                      <div className="h-16 w-16 flex-shrink-0 rounded-xl overflow-hidden bg-gray-300">
                        <img
                          src={related.image ?? "/placeholder.jpg"}
                          alt={related.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 leading-snug line-clamp-2 group-hover:opacity-70 transition">
                          {related.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {related.category}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default JournalDetailClient;

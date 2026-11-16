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
  LinkIcon,
  CheckIcon,
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
import CoverImage from "@/components/journal/CoverImage";
import { JournalComment, JournalStory } from "@/types";
import CommentsSection from "@/components/journal/CommentsSection";
import { shareIntentUrl, type ShareNetwork } from "@/lib/share";

const shareLinks = [
  { network: "whatsapp", icon: FaWhatsapp, label: "WhatsApp" },
  { network: "facebook", icon: FaFacebookF, label: "Facebook" },
  { network: "linkedin", icon: FaLinkedinIn, label: "LinkedIn" },
  { network: "x", icon: FaXTwitter, label: "X" },
  { network: "threads", icon: FaThreads, label: "Threads" },
] as const;

const SHARE_POPUP_FEATURES = "noopener,noreferrer,width=600,height=640";
const COPIED_RESET_MS = 2000;

function recordShare(slug: string, network: ShareNetwork) {
  fetch(`/api/journal/${slug}/share`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ network }),
    keepalive: true,
  }).catch(() => {
    // Counting is best-effort; the share itself already happened.
  });
}

interface JournalDetailClientProps {
  story: JournalStory;
  relatedStories: JournalStory[];
  /** Null when likes and comments couldn't be loaded; the story still renders. */
  engagement: {
    likes: number;
    liked: boolean;
    commentCount: number;
    comments: JournalComment[];
  } | null;
}

const JournalDetailClient: React.FC<JournalDetailClientProps> = ({
  story,
  relatedStories,
  engagement,
}) => {
  const [liked, setLiked] = useState(engagement?.liked ?? false);
  const [likeCount, setLikeCount] = useState(engagement?.likes ?? 0);
  const [isLiking, setIsLiking] = useState(false);
  const [comments, setComments] = useState(engagement?.comments ?? []);
  const [commentCount, setCommentCount] = useState(engagement?.commentCount ?? 0);
  const [shareCount, setShareCount] = useState(story.shares ?? 0);
  const [isCopied, setIsCopied] = useState(false);

  // Always share the clean article URL, without any tracking params from the current visit.
  const articleUrl = () => `${window.location.origin}/journal/${story.slug}`;

  const countShare = (network: ShareNetwork) => {
    setShareCount((prev) => prev + 1);
    recordShare(story.slug, network);
  };

  const shareTo = (network: Exclude<ShareNetwork, "copy">) => {
    window.open(shareIntentUrl(network, { url: articleUrl(), title: story.title }), "_blank", SHARE_POPUP_FEATURES);
    countShare(network);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(articleUrl());
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), COPIED_RESET_MS);
      toast.success("Link copied");
      countShare("copy");
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  // Optimistic: flip immediately, then settle on the server's count (or roll back on failure).
  const toggleLike = async () => {
    if (isLiking) return;
    const next = !liked;
    setIsLiking(true);
    setLiked(next);
    setLikeCount((prev) => Math.max(0, prev + (next ? 1 : -1)));
    try {
      const response = await fetch(`/api/journal/${story.slug}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ liked: next }),
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(json.error ?? "Couldn't save your like");
      setLiked(json.data.liked);
      setLikeCount(json.data.likes);
    } catch (error) {
      setLiked(!next);
      setLikeCount((prev) => Math.max(0, prev + (next ? -1 : 1)));
      toast.error(error instanceof Error ? error.message : "Couldn't save your like");
    } finally {
      setIsLiking(false);
    }
  };

  const handleCommentPosted = (comment: JournalComment) => {
    setComments((prev) => [comment, ...prev]);
    setCommentCount((prev) => prev + 1);
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
              <CoverImage
                src={story.image}
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
                  type="button"
                  onClick={toggleLike}
                  aria-pressed={liked}
                  aria-label={liked ? "Unlike this story" : "Like this story"}
                  className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition"
                >
                  {liked ? (
                    <HeartIconSolid className="h-5 w-5 text-red-500" />
                  ) : (
                    <HeartIcon className="h-5 w-5" />
                  )}
                  {likeCount} {likeCount === 1 ? "Like" : "Likes"}
                </button>
                <a
                  href="#comments"
                  className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition"
                >
                  <ChatBubbleLeftIcon className="h-5 w-5" />
                  {commentCount} {commentCount === 1 ? "Comment" : "Comments"}
                </a>
                <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                  <ShareIcon className="h-5 w-5" />
                  {shareCount} {shareCount === 1 ? "Share" : "Shares"}
                </span>
              </div>

            </div>

            <CommentsSection
              slug={story.slug}
              comments={comments}
              isUnavailable={engagement === null}
              onPosted={handleCommentPosted}
            />
          </div>

          {/* Sidebar */}
          <aside className="space-y-10">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">
                Share to
              </h4>
              <div className="flex items-center gap-2">
                {shareLinks.map(({ network, icon: Icon, label }) => (
                  <button
                    key={network}
                    type="button"
                    onClick={() => shareTo(network)}
                    aria-label={`Share to ${label}`}
                    title={`Share to ${label}`}
                    className="h-9 w-9 rounded-full border border-gray-200 bg-white text-gray-700 flex items-center justify-center hover:bg-gray-900 hover:text-white hover:border-gray-900 transition"
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={copyLink}
                  aria-label="Copy link"
                  title="Copy link"
                  className="h-9 w-9 rounded-full border border-gray-200 bg-white text-gray-700 flex items-center justify-center hover:bg-gray-900 hover:text-white hover:border-gray-900 transition"
                >
                  {isCopied ? <CheckIcon className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
                </button>
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
                        <CoverImage
                          src={related.image}
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

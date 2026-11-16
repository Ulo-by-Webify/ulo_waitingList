import type { Metadata } from "next";
import { cache } from "react";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import JournalDetailClient from "@/screens/JournalDetailClient";
import { getCachedRelatedStories, getCachedStory } from "@/lib/server/journal-cache";
import { DEFAULT_COVER_IMAGE } from "@/lib/journal";
import JsonLd from "@/components/seo/JsonLd";
import { LOGO_PATH, SITE_NAME, absoluteUrl } from "@/lib/seo";
import type { JournalStory } from "@/types";
import { VISITOR_COOKIE, getStoryEngagement, visitorHashFromCookie } from "@/lib/server/engagement-repo";

export const dynamic = "force-dynamic";

// generateMetadata and the page both need the story; fetch it once per request (and cache across requests).
const getPublishedStory = cache(getCachedStory);

/** Likes and comments are extras: if they can't load, still show the story. */
async function loadEngagement(storyId: string, visitorHash: string | null) {
  try {
    return await getStoryEngagement(storyId, visitorHash);
  } catch (error) {
    console.error("[journal] could not load likes and comments", error);
    return null;
  }
}

interface JournalStoryPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: JournalStoryPageProps): Promise<Metadata> {
  const story = await getPublishedStory(params.slug);
  if (!story) return { title: "Story Not Found", robots: { index: false, follow: true } };
  const shareImage = story.image || DEFAULT_COVER_IMAGE;

  return {
    title: story.title,
    description: story.excerpt,
    alternates: { canonical: story.href },
    openGraph: {
      title: story.title,
      description: story.excerpt,
      type: "article",
      url: story.href,
      siteName: SITE_NAME,
      ...(story.publishedAt ? { publishedTime: story.publishedAt } : {}),
      ...(story.updatedAt ? { modifiedTime: story.updatedAt } : {}),
      ...(story.author ? { authors: [story.author] } : {}),
      images: [shareImage],
    },
    twitter: {
      card: "summary_large_image",
      title: story.title,
      description: story.excerpt,
      images: [shareImage],
    },
  };
}

/** The post as a schema.org article, so search engines can show it as one. */
function articleData(story: JournalStory) {
  const image = absoluteUrl(story.image || DEFAULT_COVER_IMAGE);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: story.title,
    description: story.excerpt,
    ...(image ? { image: [image] } : {}),
    ...(story.publishedAt ? { datePublished: story.publishedAt } : {}),
    ...(story.updatedAt ? { dateModified: story.updatedAt } : {}),
    ...(story.author ? { author: { "@type": "Person", name: story.author } } : {}),
    articleSection: story.category,
    ...(absoluteUrl(story.href) ? { mainEntityOfPage: absoluteUrl(story.href) } : {}),
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      ...(absoluteUrl(LOGO_PATH) ? { logo: { "@type": "ImageObject", url: absoluteUrl(LOGO_PATH) } } : {}),
    },
  };
}

export default async function Page({ params }: JournalStoryPageProps) {
  const story = await getPublishedStory(params.slug);
  if (!story) notFound();

  const visitorHash = visitorHashFromCookie(cookies().get(VISITOR_COOKIE)?.value);
  const [relatedStories, engagement] = await Promise.all([
    getCachedRelatedStories(params.slug),
    loadEngagement(story.id, visitorHash),
  ]);
  return (
    <>
      <JsonLd data={articleData(story)} />
      <JournalDetailClient story={story} relatedStories={relatedStories} engagement={engagement} />
    </>
  );
}

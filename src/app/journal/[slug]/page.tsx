import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JournalDetailClient from "@/screens/JournalDetailClient";
import { journalStories } from "@/data";

interface JournalStoryPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return journalStories.map((story) => ({ slug: story.slug }));
}

export async function generateMetadata({
  params,
}: JournalStoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const story = journalStories.find((item) => item.slug === slug);

  if (!story) {
    return { title: "Story Not Found | Ulô" };
  }

  return {
    title: `${story.title} | Ulô`,
    description: story.excerpt,
  };
}

export default async function Page({ params }: JournalStoryPageProps) {
  const { slug } = await params;
  const story = journalStories.find((item) => item.slug === slug);

  if (!story) {
    notFound();
  }

  const relatedStories = journalStories
    .filter((item) => item.slug !== slug)
    .slice(0, 6);

  return <JournalDetailClient story={story} relatedStories={relatedStories} />;
}

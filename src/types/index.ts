export interface HeroContent {
  title: string;
  description: string;
  videoUrl: string;
}

export interface BusinessSlide {
  id: number;
  title: string;
  description: string;
  videoUrl: string;
}

export interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  bgColor: string;
  iconColor: string;
}

export interface AnalyticsStat {
  label: string;
  value: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FooterLink {
  title: string;
  href: string;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface FlippedSlide {
  id: number
  title: string
  description: string
  contentType: 'video' | 'image' | 'component'
  videoUrl?: string
  imageUrl?: string
  component?: React.ReactNode
  // SpotlightCard specific properties
  icon?: string | React.ReactNode
  spotlightTitle?: string
  spotlightDescription?: string
}

// Alias for backward compatibility and semantic clarity
export interface ServiceSlide extends FlippedSlide {}

export interface JournalFeaturedStory {
  id: number;
  tag: string;
  title: string;
  description: string;
  image: string;
  href: string;
}

export interface JournalContentBlock {
  type: "paragraph" | "heading";
  text: string;
}

export interface JournalListBlock {
  type: "list";
  items: string[];
}

export type JournalBodyBlock = JournalContentBlock | JournalListBlock;

export interface JournalStory {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  image?: string;
  category: string;
  date: string;
  author: string;
  authorAvatar?: string;
  href: string;
  badge?: string;
  content?: JournalBodyBlock[];
  likes?: number;
  commentsCount?: number;
  shares?: number;
}

import type { Metadata } from "next";

/**
 * Applies to every /admin page, signed in or not. The admin is private: keep it out of search
 * results and strip the public site's description and social-preview tags inherited from the
 * root layout, so a pasted admin link shows no preview. next.config.mjs also sends an
 * X-Robots-Tag header for /admin and /api/admin.
 */
export const metadata: Metadata = {
  title: { default: "Ulô Admin", template: "%s | Ulô Admin" },
  description: null,
  keywords: null,
  authors: null,
  openGraph: null,
  twitter: null,
  alternates: null,
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true, "max-snippet": 0, "max-image-preview": "none" },
  },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}

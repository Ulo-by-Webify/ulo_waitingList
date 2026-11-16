import type { Metadata } from "next";
import Script from "next/script";
import "@/index.css";
import { Suspense } from "react";
import Providers from "@/app/providers";
import PageViewTracker from "@/components/PageViewTracker";
import { SocialLinksProvider } from "@/components/SocialLinksProvider";
import { getSocialLinks } from "@/lib/server/settings-repo";
import { DEFAULT_DESCRIPTION, DEFAULT_SHARE_IMAGE, SITE_NAME, SITE_TAGLINE, siteOrigin } from "@/lib/seo";

// Lets pages use relative URLs (e.g. uploaded cover images) in share-preview metadata.
export const metadata: Metadata = {
  metadataBase: siteOrigin() ?? undefined,
  title: { default: `${SITE_NAME} | ${SITE_TAGLINE}`, template: `%s | ${SITE_NAME}` },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "African travel",
    "authentic travel Africa",
    "soulful stays",
    "Lagos short stays",
    "Accra stays",
    "Nairobi stays",
    "Kigali stays",
    "Cape Town stays",
    "African experiences",
    "local guides Africa",
  ],
  icons: { icon: "/favicon.ico" },
  openGraph: {
    siteName: SITE_NAME,
    type: "website",
    locale: "en",
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: DEFAULT_DESCRIPTION,
    images: [{ url: DEFAULT_SHARE_IMAGE, width: 1200, height: 630, alt: `${SITE_NAME} — ${SITE_TAGLINE}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_SHARE_IMAGE],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
};

export const revalidate = 300;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const socialLinks = await getSocialLinks();
  return (
    <html lang="en">
      <body>
        <Providers>
          <SocialLinksProvider links={socialLinks}>{children}</SocialLinksProvider>
        </Providers>
        <Suspense fallback={null}>
          <PageViewTracker />
        </Suspense>
        <Script id="mailerlite-universal" strategy="afterInteractive">
          {`
            (function(w,d,e,u,f,l,n){w[f]=w[f]||function(){(w[f].q=w[f].q||[])
            .push(arguments);},l=d.createElement(e),l.async=1,l.src=u,
            n=d.getElementsByTagName(e)[0],n.parentNode.insertBefore(l,n);})
            (window,document,'script','https://assets.mailerlite.com/js/universal.js','ml');
            ml('account', '1718389');
          `}
        </Script>
      </body>
    </html>
  );
}

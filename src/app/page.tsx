import type { Metadata } from "next";
import IndexClient from "@/screens/IndexClient";
import JsonLd from "@/components/seo/JsonLd";
import { getHomeContent } from "@/lib/server/home-repo";
import { getSocialLinks } from "@/lib/server/settings-repo";
import { DEFAULT_DESCRIPTION, LOGO_PATH, SITE_NAME, SITE_TAGLINE, absoluteUrl, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMetadata({ title: SITE_TAGLINE, description: DEFAULT_DESCRIPTION, path: "/" }),
  // The homepage leads with the brand rather than "… | Ulô".
  title: { absolute: `Beyond the Tour: ${SITE_TAGLINE} | ${SITE_NAME}` },
};

/** Who Ulô is, for search engines (name, logo, social profiles). */
async function organizationData() {
  const socialLinks = await getSocialLinks();
  const url = absoluteUrl("/");
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_NAME,
      ...(url ? { url, logo: absoluteUrl(LOGO_PATH) } : {}),
      description: DEFAULT_DESCRIPTION,
      sameAs: Object.values(socialLinks).filter(Boolean),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      ...(url ? { url } : {}),
      description: DEFAULT_DESCRIPTION,
    },
  ];
}

export default async function Page() {
  const [content, structuredData] = await Promise.all([getHomeContent(), organizationData()]);
  return (
    <>
      <JsonLd data={structuredData} />
      <IndexClient content={content} />
    </>
  );
}

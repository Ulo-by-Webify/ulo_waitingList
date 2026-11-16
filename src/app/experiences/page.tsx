import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import ExperiencesClient from "@/screens/ExperiencesClient";
import { getExperiencesContent } from "@/lib/server/experiences-repo";

export const metadata: Metadata = pageMetadata({
  title: "Experiences",
  description:
    "Beyond your stay: private chefs, city drivers, local guides, cultural tours and wellness, with trusted services that make your journey across Africa seamless.",
  path: "/experiences",
});

export default async function Page() {
  const content = await getExperiencesContent();
  return <ExperiencesClient content={content} />;
}

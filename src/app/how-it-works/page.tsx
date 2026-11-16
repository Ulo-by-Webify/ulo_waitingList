import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import HowItWorksClient from "@/screens/HowItWorksClient";
import { getSiteImageUrl } from "@/lib/server/settings-repo";

export const metadata: Metadata = pageMetadata({
  title: "How Ulô Works",
  description:
    "From booking to check-out, see how Ulô prepares, manages and supports every stay across Africa, with certified associates, Cowries payments and the Guest Navbook.",
  path: "/how-it-works",
});

export default async function Page() {
  const heroImage = await getSiteImageUrl("how_it_works_hero");
  return <HowItWorksClient heroImage={heroImage} />;
}

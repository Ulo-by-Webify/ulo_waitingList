import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import OnboardingClient from "@/screens/OnboardingClient";
import { getSiteImageUrl } from "@/lib/server/settings-repo";

export const metadata: Metadata = pageMetadata({
  title: "Begin Your Journey",
  description: "Get early access before Ulô becomes invite-only. Join the waitlist as a guest, host or associate.",
  path: "/begin-your-journey",
});

// Rendered per request so a deploy never bakes in a stale image. The setting itself is cached
// (see settings-repo) and refreshed whenever an admin changes it.
export const dynamic = "force-dynamic";

export default async function Page() {
  const imageUrl = await getSiteImageUrl("onboarding_image");
  return <OnboardingClient imageUrl={imageUrl} />;
}

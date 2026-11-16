import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import ThankYouClient from "@/screens/ThankYouClient";

export const metadata: Metadata = pageMetadata({
  title: "Thank You",
  description: "You're on the Ulô waitlist.",
  path: "/thank-you",
  noIndex: true,
});

export default function Page() {
  return <ThankYouClient />;
}

import type { Metadata } from "next";
import OnboardingClient from "@/screens/OnboardingClient";

export const metadata: Metadata = {
  title: "Begin Your Journey | Ulô",
  description:
    "Get early access before Ulô becomes invite-only — join as a guest, host, or associate.",
};

export default function Page() {
  return <OnboardingClient />;
}

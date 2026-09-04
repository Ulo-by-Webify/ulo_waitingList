import type { Metadata } from "next";
import HowItWorksClient from "@/screens/HowItWorksClient";

export const metadata: Metadata = {
  title: "How Ulô Works | Ulô",
  description:
    "From booking to check-out, see how Ulô prepares, manages, and supports every stay across Africa.",
};

export default function Page() {
  return <HowItWorksClient />;
}

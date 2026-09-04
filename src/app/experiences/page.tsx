import type { Metadata } from "next";
import ExperiencesClient from "@/screens/ExperiencesClient";

export const metadata: Metadata = {
  title: "Experiences | Ulô",
  description:
    "Beyond your stay — trusted services and curated experiences that make your journey across Africa seamless.",
};

export default function Page() {
  return <ExperiencesClient />;
}

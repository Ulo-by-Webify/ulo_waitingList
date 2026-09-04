import type { Metadata } from "next";
import JournalClient from "@/screens/JournalClient";

export const metadata: Metadata = {
  title: "Journal | Ulô",
  description:
    "Stories, culture, and moments from across Africa, curated by Ulô.",
};

export default function Page() {
  return <JournalClient />;
}

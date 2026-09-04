import type { Metadata } from "next";
import ThankYouClient from "@/screens/ThankYouClient";

export const metadata: Metadata = {
  title: "Thank You | Ulô",
};

export default function Page() {
  return <ThankYouClient />;
}

import React from "react";
import Link from "next/link";

type EarlyAccessSectionProps = {
  /** Heading above the button. Pass null to show only the button and caption. */
  title?: React.ReactNode | null;
};

const DEFAULT_TITLE = "Be among the first to access homes and services across Africa.";

/** "Get Early Access →" call to action. Always leads to the waitlist sign-up on /begin-your-journey. */
const EarlyAccessSection = ({ title = DEFAULT_TITLE }: EarlyAccessSectionProps) => (
  <section className="bg-white px-6 py-20 text-center sm:py-28">
    {title && <h2 className="mx-auto mb-8 max-w-2xl text-3xl font-semibold text-gray-900 sm:text-4xl">{title}</h2>}

    <Link
      href="/begin-your-journey"
      className="inline-flex items-center rounded-full bg-gray-900 px-8 py-3.5 text-sm font-medium text-white transition hover:bg-gray-800"
    >
      Get Early Access →
    </Link>

    <p className="mt-4 text-sm text-gray-500">Launching soon across select African cities</p>
  </section>
);

export default EarlyAccessSection;

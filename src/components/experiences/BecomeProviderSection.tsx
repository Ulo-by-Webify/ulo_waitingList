"use client";

import React, { useState } from "react";
import MailerLiteModal from "@/components/mailer-lite/MailerLiteModal";
import CoverImage from "@/components/journal/CoverImage";
import type { ExperiencesContent } from "@/lib/experiences-content";

type BecomeProviderSectionProps = { provider: ExperiencesContent["provider"] };

const BecomeProviderSection = ({ provider }: BecomeProviderSectionProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="px-6 py-10 sm:py-16">
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="text-3xl font-semibold text-gray-900 sm:text-4xl">{provider.title}</h2>
        {provider.subtitle && <p className="mt-3 text-gray-500">{provider.subtitle}</p>}
      </div>

      <div className="relative mx-auto mt-10 aspect-[16/8] max-w-5xl overflow-hidden rounded-3xl">
        <CoverImage
          src={provider.image}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/25" />
      </div>

      <div className="mt-8 text-center">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 text-gray-900 font-medium underline underline-offset-4 decoration-1 hover:opacity-70 transition"
        >
          {provider.linkLabel}
        </button>
      </div>

      <MailerLiteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userType="associate"
      />
    </section>
  );
};

export default BecomeProviderSection;

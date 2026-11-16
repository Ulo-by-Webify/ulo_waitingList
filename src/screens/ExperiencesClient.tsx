"use client";

import React, { useState } from "react";
import Footer from "@/components/Footer";
import ExperiencesHero from "@/components/experiences/ExperiencesHero";
import ExperienceShowcase from "@/components/experiences/ExperienceShowcase";
import ExperienceCategoryRow from "@/components/experiences/ExperienceCategoryRow";
import EarlyAccessSection from "@/components/experiences/EarlyAccessSection";
import BecomeProviderSection from "@/components/experiences/BecomeProviderSection";
import MailerLiteModal from "@/components/mailer-lite/MailerLiteModal";
import type { ExperiencesContent } from "@/lib/experiences-content";

const ExperiencesClient = ({ content }: { content: ExperiencesContent }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F1E8]">
      <ExperiencesHero hero={content.hero} />
      <ExperienceShowcase showcase={content.showcase} />

      {content.rows.map((row, index) => (
        <ExperienceCategoryRow
          key={row.id}
          row={row}
          showCta={index === 0}
          onCtaClick={() => setIsModalOpen(true)}
        />
      ))}

      <EarlyAccessSection title={content.earlyAccess.title || null} />
      <BecomeProviderSection provider={content.provider} />

      <Footer />

      <MailerLiteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userType="guest"
      />
    </div>
  );
};

export default ExperiencesClient;

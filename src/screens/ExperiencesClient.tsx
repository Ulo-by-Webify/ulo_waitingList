"use client";

import React, { useState } from "react";
import Footer from "@/components/Footer";
import ExperiencesHero from "@/components/experiences/ExperiencesHero";
import ExperienceShowcase from "@/components/experiences/ExperienceShowcase";
import ExperienceCategoryRow from "@/components/experiences/ExperienceCategoryRow";
import EarlyAccessSection from "@/components/experiences/EarlyAccessSection";
import BecomeProviderSection from "@/components/experiences/BecomeProviderSection";
import MailerLiteModal from "@/components/mailer-lite/MailerLiteModal";
import { experienceCategories } from "@/data/experiences";

const ExperiencesClient = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F1E8]">
      <ExperiencesHero />
      <ExperienceShowcase />

      {experienceCategories.map((category, index) => (
        <ExperienceCategoryRow
          key={category.id}
          category={category}
          showCta={index === 0}
          onCtaClick={() => setIsModalOpen(true)}
        />
      ))}

      <EarlyAccessSection />
      <BecomeProviderSection />

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

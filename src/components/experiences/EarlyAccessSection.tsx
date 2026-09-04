"use client";

import React, { useState } from "react";
import MailerLiteModal from "@/components/mailer-lite/MailerLiteModal";

const EarlyAccessSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="px-6 py-20 text-center sm:py-28">
      <h2 className="mx-auto max-w-2xl text-3xl font-semibold text-gray-900 sm:text-4xl">
        Be among the first to access homes and services across Africa.
      </h2>

      <button
        onClick={() => setIsModalOpen(true)}
        className="mt-8 inline-flex items-center rounded-full bg-gray-900 px-8 py-3.5 text-sm font-medium text-white transition hover:bg-gray-800"
      >
        Get Early Access →
      </button>

      <p className="mt-4 text-sm text-gray-500">
        Launching soon across select African cities
      </p>

      <MailerLiteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userType="guest"
      />
    </section>
  );
};

export default EarlyAccessSection;

"use client";

import React, { useState } from "react";
import MailerLiteModal from "@/components/mailer-lite/MailerLiteModal";

const providerImage =
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1600&auto=format&fit=crop";

const BecomeProviderSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="px-6 py-10 sm:py-16">
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="text-3xl font-semibold text-gray-900 sm:text-4xl">
          Offer Your Service on Ulô
        </h2>
        <p className="mt-3 text-gray-500">
          Do what you're great at, and let it become someone's unforgettable
          experience.
        </p>
      </div>

      <div className="relative mx-auto mt-10 aspect-[16/8] max-w-5xl overflow-hidden rounded-3xl">
        <img
          src={providerImage}
          alt="A provider getting ready to offer their service on Ulô"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/25" />
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 text-gray-900 font-medium underline underline-offset-4 decoration-1 hover:opacity-70 transition"
        >
          Become a Provider →
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

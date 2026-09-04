"use client";

import Header from "@/components/Header";
import { experiencesHeroImage } from "@/data/experiences";

const ExperiencesHero = () => {
  return (
    <section className="relative flex min-h-[90dvh] w-full flex-col overflow-hidden">
      <img
        src={experiencesHeroImage}
        alt="Friends gathered together, sharing a moment"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/35" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

      <div className="relative z-10 flex flex-1 flex-col">
        <Header overlay={false} />

        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-24 pt-6 text-center sm:pb-32">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl">
            Beyond your Stay
          </h1>
          <p className="mt-6 max-w-xl text-base text-white/85 sm:text-lg">
            From how you move to how you live, Ulô connects you to trusted
            services that make your experience seamless.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ExperiencesHero;

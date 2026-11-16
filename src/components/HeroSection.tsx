"use client";

import React, { useRef } from "react";
import type { HomeContent } from "@/lib/home-content";
import BlurText from "@/components/BlurText";
import { ArrowDownIcon } from "@heroicons/react/24/outline";
import { useMobileVideoPlayback } from "../hooks/useMobileVideoPlayback";

interface HeroSectionProps {
  hero: HomeContent["hero"];
}

const handleScrollToVideo = () => {
  const videoSection = document.getElementById("video-section");
  if (videoSection) {
    videoSection.scrollIntoView({ behavior: "smooth" });
  }
};

const HeroSection: React.FC<HeroSectionProps> = ({ hero }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  useMobileVideoPlayback(videoRef);

  return (
    <section className="relative min-h-[100dvh] w-full flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Video */}
      <video
        // ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover z-0"
        key={hero.video}
        src={hero.video}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        {/* <source  type="video/mp4" /> */}
        Your browser does not support the video tag.
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20 z-10"></div>
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent z-10"></div>

      {/* Content */}
      <div className="relative z-20 max-w-sm md:max-w-5xl p-5 mx-auto mt-40 text-center">
        <BlurText
          key={`${hero.title}|${hero.emphasis}`}
          text={hero.title}
          bottomText={hero.emphasis || undefined}
          animateBy="words"
          direction="top"
          className="text-[2.2rem] sm:text-6xl md:text-8xl text-white mb-1 tracking-tight font-bold leading-[0.9]"
          bottomTextClassName="text-[2.6rem] sm:text-7xl md:text-9xl font-thin"
        />
        {hero.text && (
          <p className="text-lg text-white mt-6 mb-24 md:px-20 leading-relaxed animate-fade-in max-w-3xl mx-auto tracking-wide font-light">
            {hero.text}
          </p>
        )}

        <div className="flex justify-center animate-bounce duration-1000 mb-12">
          <button
            onClick={handleScrollToVideo}
            aria-label="Scroll to video section"
            className="flex items-center justify-center h-16 w-16 rounded-full border border-dashed border-white/70 text-white hover:bg-white/10 transition"
          >
            <ArrowDownIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

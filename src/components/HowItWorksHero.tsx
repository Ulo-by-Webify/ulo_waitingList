"use client";

import { useEffect, useRef, useState } from "react";

type HowItWorksHeroProps = {
  /** Background photo, set on the admin Site page. Falls back to a night-sky gradient if it can't load. */
  image?: string;
};

/** Hero for /how-it-works: "Africa. Now in your pocket." over a full-bleed night photo. */
export default function HowItWorksHero({ image }: HowItWorksHeroProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [hasImage, setHasImage] = useState(Boolean(image));

  // A server-rendered image can fail before React hydrates (onError never fires); catch that too.
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth === 0) setHasImage(false);
  }, []);

  return (
    <section className="relative flex min-h-[100dvh] w-full items-center justify-center overflow-hidden bg-[#141a33] px-4 sm:px-6 lg:px-8">
      {hasImage && image ? (
        <img
          ref={imgRef}
          src={image}
          alt=""
          fetchPriority="high"
          onError={() => setHasImage(false)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 115%, rgba(255,176,82,0.35), transparent 45%), linear-gradient(180deg, #1b2347 0%, #141a33 55%, #0b0e1c 100%)",
          }}
        />
      )}
      {/* Keeps the white text readable on any photo. */}
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-[#141a33]/60 via-[#141a33]/25 to-black/40" />

      <div className="relative z-10 mx-auto max-w-5xl pb-24 pt-32 text-center sm:pb-32">
        <h1 className="font-semibold leading-[0.95] tracking-tight text-[#FBF7F0]">
          <span className="block text-6xl sm:text-8xl lg:text-[8.5rem]">Africa.</span>
          <span className="mt-2 block text-[2.6rem] sm:text-7xl lg:text-[6.75rem]">Now in your pocket.</span>
        </h1>
        <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-white/90 sm:text-xl lg:text-2xl text-balance">
          Everything you need to live, move, and experience Africa thoughtfully connected in one place.
        </p>
      </div>
    </section>
  );
}

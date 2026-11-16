"use client";

import { useEffect, useRef, useState } from "react";

type CloserBannerProps = {
  title: string;
  /** Photo set on the admin Home page. Falls back to a dusk gradient if it can't load. */
  image?: string;
};

/** Curved top and bottom edges: the page colour bows into the photo, deepest in the middle. */
const CURVE_PATH = "M0 0 H100 V0 Q50 18 0 0 Z";

function EdgeCurve({ position }: { position: "top" | "bottom" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 10"
      preserveAspectRatio="none"
      className={`absolute inset-x-0 z-10 h-[8%] w-full fill-white ${position === "top" ? "top-0" : "bottom-0 rotate-180"}`}
    >
      <path d={CURVE_PATH} />
    </svg>
  );
}

/** Homepage banner: "Every step brings you closer." over a full-width photo with curved edges. */
export default function CloserBanner({ title, image }: CloserBannerProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [hasImage, setHasImage] = useState(Boolean(image));

  // A new image (e.g. after an admin saves) gets a fresh chance to load.
  useEffect(() => setHasImage(Boolean(image)), [image]);

  // A server-rendered image can fail before React hydrates (onError never fires); catch that too.
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth === 0) setHasImage(false);
  }, []);

  return (
    <section className="relative flex h-[70vh] min-h-[420px] max-h-[820px] w-full items-center justify-center overflow-hidden bg-[#1d2638]">
      {hasImage && image ? (
        <img
          ref={imgRef}
          src={image}
          alt=""
          loading="lazy"
          onError={() => setHasImage(false)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, #2b3a5c 0%, #1d2638 60%, #141a26 100%)" }}
        />
      )}
      {/* Keeps the white text readable on any photo. */}
      <div aria-hidden="true" className="absolute inset-0 bg-black/40" />

      <EdgeCurve position="top" />
      <EdgeCurve position="bottom" />

      <h2 className="relative z-10 px-6 text-center text-3xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl text-balance">
        {title}
      </h2>
    </section>
  );
}

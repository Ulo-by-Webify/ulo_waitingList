"use client";

import { useEffect, useRef, useState, type ImgHTMLAttributes } from "react";
import { DEFAULT_COVER_IMAGE } from "@/lib/journal";

type CoverImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src?: string | null;
};

/**
 * A journal cover image. Falls back to the default Ulô cover when the post has no cover, or
 * when its image fails to load (for example, the file was deleted from storage).
 */
export default function CoverImage({ src, alt = "", onError, ...rest }: CoverImageProps) {
  const wanted = src?.trim() || DEFAULT_COVER_IMAGE;
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const shown = failedSrc === wanted ? DEFAULT_COVER_IMAGE : wanted;
  const imgRef = useRef<HTMLImageElement>(null);

  // A server-rendered image can fail before React hydrates, and then onError never fires.
  // A finished image with no pixels is a failed one, so fall back here too.
  useEffect(() => {
    const img = imgRef.current;
    if (img && shown !== DEFAULT_COVER_IMAGE && img.complete && img.naturalWidth === 0) {
      setFailedSrc(wanted);
    }
  }, [shown, wanted]);

  return (
    <img
      {...rest}
      ref={imgRef}
      src={shown}
      alt={alt}
      onError={(event) => {
        if (shown !== DEFAULT_COVER_IMAGE) setFailedSrc(wanted);
        onError?.(event);
      }}
    />
  );
}

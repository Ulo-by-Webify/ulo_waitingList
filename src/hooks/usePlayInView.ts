import { useEffect, type RefObject } from "react";

/**
 * Plays a muted video only while it's on screen. Pair with preload="none" so the file isn't
 * downloaded until the visitor scrolls near it.
 */
export function usePlayInView(ref: RefObject<HTMLVideoElement>, rootMargin = "200px") {
  useEffect(() => {
    const video = ref.current;
    if (!video || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { rootMargin },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [ref, rootMargin]);
}

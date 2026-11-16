"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// Sends one cookieless page view per route change. Admin pages are not tracked.
export default function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;

    const body = JSON.stringify({
      path: pathname,
      referrer: document.referrer || undefined,
      utmSource: searchParams.get("utm_source") ?? undefined,
      utmMedium: searchParams.get("utm_medium") ?? undefined,
      utmCampaign: searchParams.get("utm_campaign") ?? undefined,
    });

    const sent = navigator.sendBeacon?.("/api/track", new Blob([body], { type: "text/plain" }));
    if (!sent) {
      fetch("/api/track", { method: "POST", body, keepalive: true }).catch(() => {
        // Analytics is best-effort; never surface tracking failures to visitors.
      });
    }
  }, [pathname, searchParams]);

  return null;
}

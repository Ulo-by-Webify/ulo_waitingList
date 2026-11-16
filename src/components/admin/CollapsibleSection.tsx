"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

type Badge = { label: string; tone?: "neutral" | "success" | "warning" };

type CollapsibleSectionProps = {
  /** Stable id used to remember whether this section was left open. */
  storageKey: string;
  title: string;
  description?: ReactNode;
  badge?: Badge;
  defaultOpen?: boolean;
  children: ReactNode;
};

const BADGE_TONES: Record<NonNullable<Badge["tone"]>, string> = {
  neutral: "bg-gray-100 text-gray-600",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-800",
};

function readOpen(key: string): boolean | null {
  try {
    const value = window.localStorage.getItem(key);
    return value === null ? null : value === "1";
  } catch {
    return null;
  }
}

function writeOpen(key: string, open: boolean) {
  try {
    window.localStorage.setItem(key, open ? "1" : "0");
  } catch {
    // Storage can be blocked; the section just won't remember its state.
  }
}

/** Card with a clickable header that shows or hides its content. Remembers its state per browser. */
export default function CollapsibleSection({
  storageKey,
  title,
  description,
  badge,
  defaultOpen = false,
  children,
}: CollapsibleSectionProps) {
  const key = `ulo-admin-section:v2:${storageKey}`;
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentId = useId();
  const bodyRef = useRef<HTMLDivElement>(null);

  // inert keeps controls in a collapsed section out of the tab order and screen readers.
  // Set directly: React 18 doesn't render a boolean `inert` prop.
  useEffect(() => {
    bodyRef.current?.toggleAttribute("inert", !isOpen);
  }, [isOpen]);

  useEffect(() => {
    const saved = readOpen(key);
    if (saved !== null) setIsOpen(saved);
  }, [key]);

  function toggle() {
    setIsOpen((open) => {
      writeOpen(key, !open);
      return !open;
    });
  }

  return (
    <section className="rounded-2xl border border-gray-100 bg-white shadow-sm">
      <h2>
        <button
          type="button"
          onClick={toggle}
          aria-expanded={isOpen}
          aria-controls={contentId}
          className="flex w-full items-start justify-between gap-4 rounded-2xl px-6 py-5 text-left transition hover:bg-gray-50/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          <span className="min-w-0">
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-lg font-semibold text-gray-900">{title}</span>
              {badge && (
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${BADGE_TONES[badge.tone ?? "neutral"]}`}>
                  {badge.label}
                </span>
              )}
            </span>
            {description && <span className="mt-1 block text-sm font-normal text-gray-500">{description}</span>}
          </span>
          <ChevronDownIcon
            aria-hidden="true"
            className={`mt-1 h-5 w-5 shrink-0 text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
      </h2>
      <div
        id={contentId}
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        {/* relative: clips absolutely positioned children (e.g. sr-only file inputs) too; without it they
            escape the collapsed section and stretch the page. */}
        <div ref={bodyRef} className="relative overflow-hidden">
          <div className="border-t border-gray-100 px-6 pb-6 pt-5">{children}</div>
        </div>
      </div>
    </section>
  );
}

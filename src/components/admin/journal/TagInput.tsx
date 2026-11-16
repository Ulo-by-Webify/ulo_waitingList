"use client";

import { useState } from "react";
import { StarIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { FEATURED_TAG, isFeatured, normalizeTag } from "@/lib/journal";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export default function TagInput({ tags, onChange }: TagInputProps) {
  const [draft, setDraft] = useState("");
  const featured = isFeatured(tags);

  const addTag = (raw: string) => {
    const tag = normalizeTag(raw);
    if (tag && !tags.includes(tag)) onChange([...tags, tag]);
    setDraft("");
  };
  const removeTag = (tag: string) => onChange(tags.filter((t) => t !== tag));
  const toggleFeatured = () => (featured ? removeTag(FEATURED_TAG) : onChange([FEATURED_TAG, ...tags]));

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag(draft);
    } else if (event.key === "Backspace" && !draft && tags.length) {
      removeTag(tags[tags.length - 1]);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={toggleFeatured}
        aria-pressed={featured}
        className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
          featured ? "border-amber-300 bg-amber-50" : "border-gray-200 bg-white hover:bg-gray-50"
        }`}
      >
        {featured ? (
          <StarIconSolid className="h-5 w-5 shrink-0 text-amber-500" aria-hidden="true" />
        ) : (
          <StarIcon className="h-5 w-5 shrink-0 text-gray-400" aria-hidden="true" />
        )}
        <span>
          <span className="block text-sm font-medium text-gray-900">
            {featured ? "Featured in the journal hero" : "Feature in the journal hero"}
          </span>
          <span className="block text-xs text-gray-500">
            Adds the <code>{FEATURED_TAG}</code> tag. Shows once published with a cover image.
          </span>
        </span>
      </button>

      <div className="flex min-h-[46px] flex-wrap items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-2 py-1.5 focus-within:ring-2 focus-within:ring-primary/20">
        {tags.map((tag) => (
          <span
            key={tag}
            className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium ${
              tag === FEATURED_TAG ? "bg-amber-100 text-amber-900" : "bg-gray-100 text-gray-700"
            }`}
          >
            {tag}
            <button type="button" onClick={() => removeTag(tag)} aria-label={`Remove tag ${tag}`} className="rounded hover:text-gray-900">
              <XMarkIcon className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => draft && addTag(draft)}
          placeholder={tags.length ? "" : "Add tags, press Enter"}
          aria-label="Add tag"
          className="min-w-[120px] flex-1 bg-transparent px-1 py-1 text-sm focus:outline-none"
        />
      </div>
    </div>
  );
}

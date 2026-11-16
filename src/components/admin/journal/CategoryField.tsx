"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { adminInputClass } from "../PasswordInput";

interface CategoryFieldProps {
  id: string;
  value: string;
  categories: string[];
  onChange: (value: string) => void;
  onCreated: (name: string) => void;
}

const NEW_OPTION = "__new__";

export default function CategoryField({ id, value, categories, onChange, onCreated }: CategoryFieldProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [draft, setDraft] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleCreate() {
    const name = draft.trim();
    if (!name) return;
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/journal/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(body.error ?? "Could not create category");
        return;
      }
      onCreated(body.data.name);
      onChange(body.data.name);
      setDraft("");
      setIsCreating(false);
      toast.success(`Category “${body.data.name}” created`);
    } catch {
      toast.error("Network error. Try again.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isCreating) {
    return (
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            id={id}
            value={draft}
            autoFocus
            maxLength={60}
            placeholder="New category name"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleCreate();
              } else if (e.key === "Escape") {
                setIsCreating(false);
              }
            }}
            className={`${adminInputClass} py-2`}
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={isSaving || !draft.trim()}
            className="shrink-0 rounded-xl bg-primary px-3 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {isSaving ? "Adding…" : "Add"}
          </button>
        </div>
        <button type="button" onClick={() => setIsCreating(false)} className="text-xs text-gray-500 hover:text-gray-900">
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <select
        id={id}
        value={value}
        required
        onChange={(e) => (e.target.value === NEW_OPTION ? setIsCreating(true) : onChange(e.target.value))}
        className={`${adminInputClass} py-2`}
      >
        <option value="" disabled>
          {categories.length ? "Choose a category" : "No categories yet"}
        </option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
        <option value={NEW_OPTION}>+ New category…</option>
      </select>
      <Link href="/admin/journal/categories" className="inline-block text-xs text-gray-500 hover:text-gray-900">
        Manage categories
      </Link>
    </div>
  );
}

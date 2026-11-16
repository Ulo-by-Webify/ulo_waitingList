"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FolderIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { adminInputClass } from "../PasswordInput";
import EmptyState from "../EmptyState";
import { useConfirm } from "../ConfirmDialog";

type Category = { id: string; name: string; postCount: number };

async function send(url: string, method: string, body?: unknown) {
  const response = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(json.error ?? "Something went wrong");
  return json.data;
}

function CategoryRow({ category, onChanged }: { category: Category; onChanged: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [isBusy, setIsBusy] = useState(false);
  const isInUse = category.postCount > 0;
  const [confirm, confirmDialog] = useConfirm();

  async function rename() {
    const next = name.trim();
    if (!next || next === category.name) {
      setName(category.name);
      setIsEditing(false);
      return;
    }
    setIsBusy(true);
    try {
      await send(`/api/admin/journal/categories/${category.id}`, "PATCH", { name: next });
      toast.success(isInUse ? `Renamed. ${category.postCount} post${category.postCount === 1 ? "" : "s"} updated.` : "Category renamed");
      setIsEditing(false);
      onChanged();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsBusy(false);
    }
  }

  async function remove() {
    const confirmed = await confirm({ title: `Delete the “${category.name}” category?`, description: "It has no posts, so nothing else changes." });
    if (!confirmed) return;
    setIsBusy(true);
    try {
      await send(`/api/admin/journal/categories/${category.id}`, "DELETE");
      toast.success("Category deleted");
      onChanged();
    } catch (error) {
      toast.error((error as Error).message);
      setIsBusy(false);
    }
  }

  return (
    <li className="flex items-center gap-4 px-5 py-3">
      {confirmDialog}
      <div className="min-w-0 flex-1">
        {isEditing ? (
          <input
            value={name}
            autoFocus
            maxLength={60}
            aria-label={`Rename ${category.name}`}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") rename();
              if (e.key === "Escape") {
                setName(category.name);
                setIsEditing(false);
              }
            }}
            className={`${adminInputClass} py-1.5`}
          />
        ) : (
          <p className="truncate text-sm font-medium text-gray-900">{category.name}</p>
        )}
      </div>
      <Link
        href={`/admin/journal?q=${encodeURIComponent(category.name)}`}
        className="shrink-0 text-xs tabular-nums text-gray-500 hover:text-gray-900"
      >
        {category.postCount} post{category.postCount === 1 ? "" : "s"}
      </Link>
      <div className="flex shrink-0 items-center gap-3 text-xs font-medium">
        {isEditing ? (
          <>
            <button type="button" onClick={rename} disabled={isBusy} className="text-gray-900 hover:underline disabled:opacity-50">
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setName(category.name);
                setIsEditing(false);
              }}
              className="text-gray-500 hover:text-gray-900"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button type="button" onClick={() => setIsEditing(true)} className="text-gray-900 hover:underline">
              Rename
            </button>
            <button
              type="button"
              onClick={remove}
              disabled={isBusy || isInUse}
              title={isInUse ? "Move this category's posts elsewhere before deleting it" : undefined}
              className="text-red-600 hover:text-red-800 disabled:cursor-not-allowed disabled:text-gray-300"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </li>
  );
}

export default function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  async function create(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    setIsCreating(true);
    try {
      const created = await send("/api/admin/journal/categories", "POST", { name });
      toast.success(`Category “${created.name}” created`);
      setName("");
      router.refresh();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={create} className="flex gap-2 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          placeholder="New category name, e.g. Wellness"
          aria-label="New category name"
          className={`${adminInputClass} py-2`}
        />
        <button
          type="submit"
          disabled={isCreating || !name.trim()}
          className="shrink-0 rounded-xl bg-primary px-4 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {isCreating ? "Adding…" : "Add category"}
        </button>
      </form>

      {categories.length === 0 ? (
        <EmptyState
          icon={FolderIcon}
          title="No categories yet"
          description="Categories group your stories, such as Culture, Travel or Food. Add your first one above."
        />
      ) : (
        <ul className="divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white shadow-sm">
          {categories.map((category) => (
            <CategoryRow key={category.id} category={category} onChanged={() => router.refresh()} />
          ))}
        </ul>
      )}
    </div>
  );
}

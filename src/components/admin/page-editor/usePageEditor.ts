"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { z } from "zod";
import { useConfirm } from "../ConfirmDialog";

type UsePageEditorOptions<T> = {
  initial: T;
  schema: z.ZodType<T, z.ZodTypeDef, unknown>;
  /** PUT saves the page, DELETE resets it. */
  endpoint: string;
  /** Page name for messages, e.g. "Experiences page". */
  pageName: string;
  describePath: (content: T, path: (string | number)[]) => string;
};

export type PageEditor<T> = {
  content: T;
  setContent: (update: (current: T) => T) => void;
  /** Merges a patch into one top-level section. */
  patch: <K extends keyof T>(key: K, value: Partial<T[K]>) => void;
  isDirty: boolean;
  isSaving: boolean;
  save: () => Promise<void>;
  reset: () => Promise<void>;
  discard: () => void;
  confirmDialog: ReactNode;
};

async function send(endpoint: string, init: RequestInit, fallbackError: string) {
  const response = await fetch(endpoint, init);
  const json = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(json.error ?? fallbackError);
}

/** State, save, reset and unsaved-changes warning for an admin page editor that saves the whole page at once. */
export function usePageEditor<T extends object>({ initial, schema, endpoint, pageName, describePath }: UsePageEditorOptions<T>): PageEditor<T> {
  const router = useRouter();
  const [content, setContentState] = useState(initial);
  const [isSaving, setIsSaving] = useState(false);
  const [confirm, confirmDialog] = useConfirm();
  const isDirty = JSON.stringify(content) !== JSON.stringify(initial);

  // After a save or reset the server sends fresh content; start from it.
  useEffect(() => setContentState(initial), [initial]);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!isDirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);

  const setContent = (update: (current: T) => T) => setContentState(update);
  const patch = <K extends keyof T>(key: K, value: Partial<T[K]>) =>
    setContentState((current) => ({ ...current, [key]: { ...current[key], ...value } }));

  async function run(action: () => Promise<void>, successMessage: string) {
    setIsSaving(true);
    try {
      await action();
      toast.success(successMessage);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Network error. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  async function save() {
    const parsed = schema.safeParse(content);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      toast.error(`${describePath(content, issue.path)}: ${issue.message}`);
      return;
    }
    await run(
      () =>
        send(
          endpoint,
          { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) },
          `Couldn't save the ${pageName}`,
        ),
      `${pageName} saved and live on the site`,
    );
  }

  async function reset() {
    const confirmed = await confirm({
      title: `Reset the ${pageName}?`,
      description: "Every section goes back to the content the site shipped with. Your uploaded images stay in Media.",
      confirmLabel: "Reset page",
    });
    if (!confirmed) return;
    await run(() => send(endpoint, { method: "DELETE" }, `Couldn't reset the ${pageName}`), `Original ${pageName} restored`);
  }

  return { content, setContent, patch, isDirty, isSaving, save, reset, discard: () => setContentState(initial), confirmDialog };
}

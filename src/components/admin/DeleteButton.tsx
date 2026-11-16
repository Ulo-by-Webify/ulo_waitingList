"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useConfirm } from "./ConfirmDialog";

interface DeleteButtonProps {
  endpoint: string;
  label: string;
}

export default function DeleteButton({ endpoint, label }: DeleteButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [confirm, confirmDialog] = useConfirm();

  async function handleDelete() {
    const confirmed = await confirm({
      title: `Delete ${label}?`,
      description: "This can't be undone.",
    });
    if (!confirmed) return;
    setPending(true);
    try {
      const response = await fetch(endpoint, { method: "DELETE" });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(body.error ?? "Delete failed");
        return;
      }
      toast.success("Deleted");
      router.refresh();
    } catch {
      toast.error("Network error. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        aria-label={`Delete ${label}`}
        className="text-xs font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
      >
        {pending ? "Deleting…" : "Delete"}
      </button>
      {confirmDialog}
    </>
  );
}

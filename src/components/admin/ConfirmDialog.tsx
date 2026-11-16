"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export type ConfirmOptions = {
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** "danger" styles the confirm button red (deletes, removals). */
  tone?: "danger" | "default";
};

type PendingConfirm = ConfirmOptions & { resolve: (confirmed: boolean) => void };

/**
 * Accessible replacement for window.confirm.
 *
 *   const [confirm, confirmDialog] = useConfirm();
 *   if (!(await confirm({ title: "Delete post?" }))) return;
 *   ...
 *   return <>{...}{confirmDialog}</>;
 */
export function useConfirm(): [(options: ConfirmOptions) => Promise<boolean>, ReactNode] {
  const [pending, setPending] = useState<PendingConfirm | null>(null);
  const pendingRef = useRef<PendingConfirm | null>(null);

  const settle = useCallback((confirmed: boolean) => {
    pendingRef.current?.resolve(confirmed);
    pendingRef.current = null;
    setPending(null);
  }, []);

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        pendingRef.current?.resolve(false);
        const next = { ...options, resolve };
        pendingRef.current = next;
        setPending(next);
      }),
    [],
  );

  const dialog = (
    <ConfirmDialog
      open={pending !== null}
      options={pending}
      onConfirm={() => settle(true)}
      onCancel={() => settle(false)}
    />
  );

  return [confirm, dialog];
}

function ConfirmDialog({
  open,
  options,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  options: ConfirmOptions | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const isDanger = (options?.tone ?? "danger") === "danger";

  return (
    <AlertDialog.Root open={open} onOpenChange={(next) => !next && onCancel()}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-gray-100 bg-white px-6 py-10 text-center shadow-2xl sm:px-10 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
          {isDanger && (
            <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 ring-8 ring-red-50/50">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" aria-hidden="true" />
            </span>
          )}
          <AlertDialog.Title className="text-xl font-semibold text-gray-900 text-balance">{options?.title}</AlertDialog.Title>
          {options?.description ? (
            <AlertDialog.Description className="mx-auto mt-2 max-w-sm text-base text-gray-600 text-pretty">
              {options.description}
            </AlertDialog.Description>
          ) : (
            <AlertDialog.Description className="sr-only">Confirm this action</AlertDialog.Description>
          )}
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <AlertDialog.Cancel className="order-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 sm:order-1">
              {options?.cancelLabel ?? "Cancel"}
            </AlertDialog.Cancel>
            <AlertDialog.Action
              onClick={onConfirm}
              className={`order-1 rounded-xl px-5 py-3 text-sm font-medium text-white transition sm:order-2 ${
                isDanger ? "bg-red-600 hover:bg-red-700" : "bg-primary hover:bg-gray-800"
              }`}
            >
              {options?.confirmLabel ?? "Delete"}
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowPathIcon, SignalSlashIcon } from "@heroicons/react/24/outline";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Shown when an admin page throws on the server (most often a brief database or network
 * outage). Production builds hide the real message, so the copy stays generic.
 */
export default function AdminError({ error, reset }: Props) {
  const router = useRouter();
  const [isRetrying, startRetry] = useTransition();

  useEffect(() => {
    console.error("[admin] page failed to load", error);
  }, [error]);

  function retry() {
    startRetry(() => {
      router.refresh();
      reset();
    });
  }

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center">
        <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 ring-8 ring-amber-50/50">
          <SignalSlashIcon className="h-7 w-7 text-amber-600" aria-hidden="true" />
        </span>
        <h1 className="text-xl font-semibold text-gray-900">We couldn&apos;t load this page</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-gray-600 text-pretty">
          The dashboard couldn&apos;t reach the database. This is usually a brief connection problem, so try again in a
          moment.
        </p>
        <button
          type="button"
          onClick={retry}
          disabled={isRetrying}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-60"
        >
          <ArrowPathIcon className={`h-4 w-4 ${isRetrying ? "animate-spin" : ""}`} aria-hidden="true" />
          {isRetrying ? "Retrying…" : "Try again"}
        </button>
        {error.digest && <p className="mt-6 text-xs text-gray-400">Error reference: {error.digest}</p>}
      </div>
    </main>
  );
}

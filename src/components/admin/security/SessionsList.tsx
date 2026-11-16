"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ComputerDesktopIcon, DevicePhoneMobileIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";

export type SessionView = {
  id: string;
  device: string;
  isMobile: boolean;
  ip: string | null;
  lastSeen: string;
  signedIn: string;
  isCurrent: boolean;
};

async function revoke(url: string) {
  const response = await fetch(url, { method: "DELETE" });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error ?? "Couldn't sign that session out");
  return body.data;
}

export default function SessionsList({ sessions }: { sessions: SessionView[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const others = sessions.filter((s) => !s.isCurrent).length;

  async function handle(id: string, url: string, success: string) {
    setBusyId(id);
    try {
      await revoke(url);
      toast.success(success);
      router.refresh();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-3">
      <ul className="divide-y divide-gray-100 rounded-xl border border-gray-100">
        {sessions.map((s) => {
          const Icon = s.isMobile ? DevicePhoneMobileIcon : ComputerDesktopIcon;
          return (
            <li key={s.id} className="flex items-center gap-3 px-4 py-3">
              <Icon className="h-5 w-5 shrink-0 text-gray-400" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {s.device}
                  {s.isCurrent && <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">This device</span>}
                </p>
                <p className="text-xs text-gray-500">
                  {s.ip ?? "Unknown IP"} · Active {s.lastSeen} · Signed in {s.signedIn}
                </p>
              </div>
              {!s.isCurrent && (
                <button
                  type="button"
                  disabled={busyId !== null}
                  onClick={() => handle(s.id, `/api/admin/account/sessions/${s.id}`, "Session signed out")}
                  className="shrink-0 text-xs font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
                >
                  {busyId === s.id ? "Signing out…" : "Sign out"}
                </button>
              )}
            </li>
          );
        })}
      </ul>
      {others > 0 && (
        <button
          type="button"
          disabled={busyId !== null}
          onClick={() => handle("all", "/api/admin/account/sessions", `${others} other session${others === 1 ? "" : "s"} signed out`)}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
        >
          Sign out all other sessions
        </button>
      )}
    </div>
  );
}

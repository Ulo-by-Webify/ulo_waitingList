"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LockClosedIcon, ShieldCheckIcon, ShieldExclamationIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { ROLES, ROLE_LABELS, type Role } from "@/lib/permissions";
import CopyLinkNotice from "./CopyLinkNotice";
import { useConfirm } from "../ConfirmDialog";

export type MemberView = {
  id: string;
  email: string;
  fullName: string | null;
  role: Role;
  mfaEnabled: boolean;
  isLocked: boolean;
  pendingInvite: boolean;
  activeSessions: number;
  lastLogin: string;
  isSelf: boolean;
};

async function call(method: string, url: string, body?: unknown) {
  const response = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(json.error ?? "Something went wrong");
  return json.data;
}

const actionClass = "text-xs font-medium text-gray-700 hover:text-gray-900 hover:underline disabled:opacity-40";

export default function TeamTable({ members }: { members: MemberView[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [link, setLink] = useState<{ url: string; description: string } | null>(null);
  const [confirm, confirmDialog] = useConfirm();

  async function act(member: MemberView, action: () => Promise<void>) {
    setBusyId(member.id);
    try {
      await action();
      router.refresh();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  const label = (m: MemberView) => m.fullName || m.email;

  return (
    <div className="space-y-4">
      {confirmDialog}
      {link && <CopyLinkNotice url={link.url} description={link.description} onDismiss={() => setLink(null)} />}
      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              {["Member", "Role", "Security", "Last sign-in", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  {h || <span className="sr-only">Actions</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {members.map((m) => {
              const busy = busyId === m.id;
              return (
                <tr key={m.id} className="align-top">
                  <td className="px-4 py-3 text-sm">
                    <p className="font-medium text-gray-900">
                      {label(m)} {m.isSelf && <span className="text-xs font-normal text-gray-500">(you)</span>}
                    </p>
                    {m.fullName && <p className="text-xs text-gray-500">{m.email}</p>}
                    {m.pendingInvite && <span className="mt-1 inline-block rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">Invite pending</span>}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <select
                      value={m.role}
                      disabled={m.isSelf || busy}
                      aria-label={`Role for ${label(m)}`}
                      title={m.isSelf ? "You can't change your own role" : undefined}
                      onChange={(e) =>
                        act(m, async () => {
                          await call("PATCH", `/api/admin/team/${m.id}`, { role: e.target.value });
                          toast.success(`${label(m)} is now ${ROLE_LABELS[e.target.value as Role]}`);
                        })
                      }
                      className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm disabled:bg-gray-50"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                      ))}
                    </select>
                  </td>
                  <td className="space-y-1 px-4 py-3 text-xs">
                    {m.mfaEnabled ? (
                      <span className="flex items-center gap-1 text-emerald-700"><ShieldCheckIcon className="h-4 w-4" aria-hidden="true" /> 2FA on</span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-700"><ShieldExclamationIcon className="h-4 w-4" aria-hidden="true" /> 2FA off</span>
                    )}
                    {m.isLocked && <span className="flex items-center gap-1 text-red-700"><LockClosedIcon className="h-4 w-4" aria-hidden="true" /> Locked</span>}
                    <span className="block text-gray-500">{m.activeSessions} active session{m.activeSessions === 1 ? "" : "s"}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{m.lastLogin}</td>
                  <td className="px-4 py-3 text-right">
                    {!m.isSelf && (
                      <div className="flex flex-col items-end gap-1.5">
                        <button
                          type="button"
                          disabled={busy}
                          className={actionClass}
                          onClick={() =>
                            act(m, async () => {
                              const data = await call("POST", `/api/admin/team/${m.id}/link`);
                              const kind = data.purpose === "invite" ? "invite" : "password reset";
                              if (data.emailed) toast.success(`New ${kind} link emailed`);
                              else setLink({ url: data.url, description: `Email isn't set up. Share this ${kind} link with ${label(m)}; it works once.` });
                            })
                          }
                        >
                          {m.pendingInvite || m.lastLogin === "Never" ? "Resend invite" : "Send reset link"}
                        </button>
                        {m.isLocked && (
                          <button type="button" disabled={busy} className={actionClass} onClick={() => act(m, async () => { await call("POST", `/api/admin/team/${m.id}/unlock`); toast.success("Account unlocked"); })}>
                            Unlock
                          </button>
                        )}
                        {m.activeSessions > 0 && (
                          <button type="button" disabled={busy} className={actionClass} onClick={() => act(m, async () => { const d = await call("DELETE", `/api/admin/team/${m.id}/sessions`); toast.success(`Signed out of ${d.revoked} session(s)`); })}>
                            Sign out everywhere
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={busy}
                          className="text-xs font-medium text-red-600 hover:text-red-800 disabled:opacity-40"
                          onClick={async () => {
                            const confirmed = await confirm({
                              title: `Remove ${label(m)} from the team?`,
                              description: "They'll be signed out and lose access immediately.",
                              confirmLabel: "Remove",
                            });
                            if (!confirmed) return;
                            act(m, async () => { await call("DELETE", `/api/admin/team/${m.id}`); toast.success(`${label(m)} removed`); });
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

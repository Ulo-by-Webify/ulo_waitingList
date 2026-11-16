"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ROLES, ROLE_DESCRIPTIONS, ROLE_LABELS, type Role } from "@/lib/permissions";
import { adminInputClass } from "../PasswordInput";
import CopyLinkNotice from "./CopyLinkNotice";

export default function InviteForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<Role>("editor");
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, fullName, role }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(body.error ?? "Couldn't send the invite");
        return;
      }
      toast.success(body.data.emailed ? `Invite emailed to ${email}` : "Invite created");
      setInviteUrl(body.data.inviteUrl);
      setEmail("");
      setFullName("");
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-[1fr_1fr_160px_auto] sm:items-end">
        <div className="space-y-1.5">
          <label htmlFor="invite-email" className="block text-xs font-medium text-gray-600">Email</label>
          <input id="invite-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={`${adminInputClass} py-2`} />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="invite-name" className="block text-xs font-medium text-gray-600">Name (optional)</label>
          <input id="invite-name" maxLength={120} value={fullName} onChange={(e) => setFullName(e.target.value)} className={`${adminInputClass} py-2`} />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="invite-role" className="block text-xs font-medium text-gray-600">Role</label>
          <select id="invite-role" value={role} onChange={(e) => setRole(e.target.value as Role)} className={`${adminInputClass} py-2`}>
            {ROLES.map((r) => (
              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={submitting} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60">
          {submitting ? "Inviting…" : "Invite"}
        </button>
      </form>
      <p className="text-xs text-gray-500">{ROLE_LABELS[role]}: {ROLE_DESCRIPTIONS[role]}</p>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {inviteUrl && (
        <CopyLinkNotice url={inviteUrl} description="Email isn't set up, so share this invite link with them directly. It works once and expires in 7 days." onDismiss={() => setInviteUrl(null)} />
      )}
    </div>
  );
}

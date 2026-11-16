"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SOCIAL_NETWORKS, type SocialLinks, type SocialNetworkId } from "@/lib/social-links";
import { adminInputClass } from "../PasswordInput";

type FieldErrors = Partial<Record<SocialNetworkId, string>>;

export default function SocialLinksForm({ initial }: { initial: SocialLinks }) {
  const router = useRouter();
  const [links, setLinks] = useState<Record<SocialNetworkId, string>>(
    () => Object.fromEntries(SOCIAL_NETWORKS.map((n) => [n.id, initial[n.id] ?? ""])) as Record<SocialNetworkId, string>,
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  const isDirty = SOCIAL_NETWORKS.some((n) => (initial[n.id] ?? "") !== links[n.id].trim());
  const activeCount = SOCIAL_NETWORKS.filter((n) => links[n.id].trim()).length;

  async function save(event: FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    setErrors({});
    try {
      const response = await fetch("/api/admin/site/social", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(links),
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) {
        // validationError reports the first problem as "<network>: message" or just the message.
        const message: string = json.error ?? "Couldn't save the links";
        const field = SOCIAL_NETWORKS.find((n) => message.includes(n.label) || message.startsWith(`${n.id} `));
        if (field) setErrors({ [field.id]: message });
        toast.error(message);
        return;
      }
      toast.success("Social links saved and live on the site");
      router.refresh();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>

      {SOCIAL_NETWORKS.every((n) => !initial[n.id]) && (
        <p className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          No links saved yet, so the “Follow us” icons are hidden on the site. Add at least one link below and save.
        </p>
      )}

      <form onSubmit={save} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          {SOCIAL_NETWORKS.map((network) => {
            const error = errors[network.id];
            const inputId = `social-${network.id}`;
            return (
              <div key={network.id} className="space-y-1">
                <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
                  {network.label}
                </label>
                <input
                  id={inputId}
                  type="url"
                  inputMode="url"
                  value={links[network.id]}
                  onChange={(e) => {
                    setLinks((prev) => ({ ...prev, [network.id]: e.target.value }));
                    setErrors((prev) => ({ ...prev, [network.id]: undefined }));
                  }}
                  placeholder={network.placeholder}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? `${inputId}-error` : undefined}
                  className={`${adminInputClass} py-2.5 ${error ? "border-red-400 focus:ring-red-200" : ""}`}
                />
                {error && (
                  <p id={`${inputId}-error`} className="text-xs text-red-600">
                    {error}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-gray-400">
            {activeCount} of {SOCIAL_NETWORKS.length} networks will show. Leave a box blank to hide that icon.
          </p>
          <button
            type="submit"
            disabled={isSaving || !isDirty}
            className="rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
          >
            {isSaving ? "Saving…" : "Save links"}
          </button>
        </div>
      </form>
    </div>
  );
}

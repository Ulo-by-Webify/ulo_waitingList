"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import PasswordInput, { adminInputClass } from "./PasswordInput";

interface ProfileFormProps {
  initialFullName: string;
  initialEmail: string;
}

export default function ProfileForm({ initialFullName, initialEmail }: ProfileFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialFullName);
  const [email, setEmail] = useState(initialEmail);
  const [savedEmail, setSavedEmail] = useState(initialEmail);
  const [currentPassword, setCurrentPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const isEmailChanged = email.trim().toLowerCase() !== savedEmail.toLowerCase();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, currentPassword: isEmailChanged ? currentPassword : undefined }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(body.error ?? "Could not save your profile");
        return;
      }
      setSavedEmail(body.data.email);
      setEmail(body.data.email);
      setCurrentPassword("");
      toast.success("Profile updated");
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="profile-name" className="block text-sm font-medium text-gray-700">
            Full name
          </label>
          <input
            id="profile-name"
            type="text"
            maxLength={120}
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={adminInputClass}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="profile-email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="profile-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={adminInputClass}
          />
        </div>
      </div>

      {isEmailChanged && (
        <div className="space-y-1.5 sm:max-w-[calc(50%-0.5rem)]">
          <label htmlFor="profile-current-password" className="block text-sm font-medium text-gray-700">
            Current password
          </label>
          <PasswordInput
            id="profile-current-password"
            value={currentPassword}
            onChange={setCurrentPassword}
            autoComplete="current-password"
            describedBy="profile-email-hint"
          />
          <p id="profile-email-hint" className="text-xs text-gray-500">
            Confirm your password to change the email you sign in with.
          </p>
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={isSaving}
        className="rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-60"
      >
        {isSaving ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}

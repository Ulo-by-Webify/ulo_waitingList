"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MIN_PASSWORD_LENGTH } from "@/lib/validation";
import PasswordInput from "./PasswordInput";

function validate(current: string, next: string, confirm: string): string | null {
  if (next.length < MIN_PASSWORD_LENGTH) return `New password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  if (next === current) return "New password must be different from the current one";
  if (next !== confirm) return "New passwords don't match";
  return null;
}

export default function ChangePasswordForm() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const validationError = validate(currentPassword, newPassword, confirmPassword);
    if (validationError) {
      setError(validationError);
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(body.error ?? "Could not change your password");
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password changed. Other sessions have been signed out.");
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setIsSaving(false);
    }
  }

  const tooShort = newPassword.length > 0 && newPassword.length < MIN_PASSWORD_LENGTH;
  const mismatch = confirmPassword.length > 0 && confirmPassword !== newPassword;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5 sm:max-w-[calc(50%-0.5rem)]">
        <label htmlFor="current-password" className="block text-sm font-medium text-gray-700">
          Current password
        </label>
        <PasswordInput id="current-password" value={currentPassword} onChange={setCurrentPassword} autoComplete="current-password" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
            New password
          </label>
          <PasswordInput
            id="new-password"
            value={newPassword}
            onChange={setNewPassword}
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            describedBy="new-password-hint"
          />
          <p id="new-password-hint" className={`text-xs ${tooShort ? "text-red-600" : "text-gray-500"}`}>
            At least {MIN_PASSWORD_LENGTH} characters. A passphrase of a few random words works well.
          </p>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
            Confirm new password
          </label>
          <PasswordInput
            id="confirm-password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
            describedBy="confirm-password-hint"
          />
          {mismatch && (
            <p id="confirm-password-hint" className="text-xs text-red-600">
              Doesn&apos;t match the new password.
            </p>
          )}
        </div>
      </div>

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
        {isSaving ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}

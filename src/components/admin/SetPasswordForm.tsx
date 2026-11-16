"use client";

import { useState } from "react";
import Link from "next/link";
import { MIN_PASSWORD_LENGTH } from "@/lib/validation";
import { submitErrorMessage, useTurnstile } from "@/components/turnstile/useTurnstile";
import { TURNSTILE_ACTIONS, TURNSTILE_FIELD } from "@/lib/turnstile";
import PasswordInput from "./PasswordInput";

interface SetPasswordFormProps {
  token: string;
  purpose: "reset" | "invite";
  email: string;
}

export default function SetPasswordForm({ token, purpose, email }: SetPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const turnstile = useTurnstile(TURNSTILE_ACTIONS.setPassword);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (password.length < MIN_PASSWORD_LENGTH) return setError(`Use at least ${MIN_PASSWORD_LENGTH} characters`);
    if (password !== confirm) return setError("Passwords don't match");
    setSubmitting(true);
    setError(null);
    try {
      const turnstileToken = await turnstile.getToken();
      const response = await fetch("/api/admin/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, purpose, password, [TURNSTILE_FIELD]: turnstileToken }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(body.error ?? "Couldn't set your password");
        return;
      }
      setIsDone(true);
    } catch (error) {
      setError(submitErrorMessage(error, "Network error. Try again."));
    } finally {
      turnstile.reset();
      setSubmitting(false);
    }
  }

  if (isDone) {
    return (
      <div className="mt-6 space-y-4 text-center text-sm text-gray-600">
        <p>Your password is set. Sign in to continue, then turn on two-factor authentication under Account → Security.</p>
        <Link href="/admin/login" className="inline-block rounded-xl bg-primary px-6 py-2.5 font-medium text-white hover:bg-gray-800">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <input type="email" value={email} autoComplete="username" readOnly hidden />
      <p className="rounded-xl bg-gray-50 px-3 py-2 text-center text-sm text-gray-700">{email}</p>
      <div className="space-y-1.5">
        <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
          New password
        </label>
        <PasswordInput id="new-password" value={password} onChange={setPassword} autoComplete="new-password" minLength={MIN_PASSWORD_LENGTH} describedBy="new-password-hint" />
        <p id="new-password-hint" className="text-xs text-gray-500">
          At least {MIN_PASSWORD_LENGTH} characters.
        </p>
      </div>
      <div className="space-y-1.5">
        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
          Confirm password
        </label>
        <PasswordInput id="confirm-password" value={confirm} onChange={setConfirm} autoComplete="new-password" />
      </div>
      {turnstile.widget}
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-primary px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-60"
      >
        {submitting ? "Saving…" : purpose === "invite" ? "Create account" : "Set new password"}
      </button>
    </form>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { submitErrorMessage, useTurnstile } from "@/components/turnstile/useTurnstile";
import { TURNSTILE_ACTIONS, TURNSTILE_FIELD } from "@/lib/turnstile";
import { adminInputClass } from "./PasswordInput";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<"sent" | "no-email" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const turnstile = useTurnstile(TURNSTILE_ACTIONS.forgotPassword);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const turnstileToken = await turnstile.getToken();
      const response = await fetch("/api/admin/password/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, [TURNSTILE_FIELD]: turnstileToken }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(body.error ?? "Something went wrong");
        return;
      }
      setResult(body.data.emailEnabled ? "sent" : "no-email");
    } catch (error) {
      setError(submitErrorMessage(error, "Network error. Try again."));
    } finally {
      turnstile.reset();
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="mt-6 space-y-4 text-center text-sm text-gray-600">
        {result === "sent" ? (
          <p>
            If an admin account exists for <span className="font-medium text-gray-900">{email}</span>, we&apos;ve emailed a
            link to reset the password. It expires in 30 minutes.
          </p>
        ) : (
          <p>Password reset emails aren&apos;t set up yet. Ask an owner on your team to send you a reset link from the Team page.</p>
        )}
        <Link href="/admin/login" className="inline-block font-medium text-gray-900 underline underline-offset-4">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="forgot-email"
          type="email"
          required
          autoFocus
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={adminInputClass}
        />
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
        {submitting ? "Sending…" : "Send reset link"}
      </button>
      <Link href="/admin/login" className="block text-center text-xs text-gray-500 hover:text-gray-900">
        Back to sign in
      </Link>
    </form>
  );
}

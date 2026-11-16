"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { submitErrorMessage, useTurnstile } from "@/components/turnstile/useTurnstile";
import { TURNSTILE_ACTIONS, TURNSTILE_FIELD } from "@/lib/turnstile";
import PasswordInput, { adminInputClass as inputClass } from "./PasswordInput";

// Only allow redirects back into the admin area to avoid open redirects.
function safeNext(next: string | null): string {
  return next && next.startsWith("/admin") && !next.startsWith("//") && !next.includes("\\") ? next : "/admin";
}

const buttonClass =
  "w-full rounded-xl bg-primary px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-60";

async function post(url: string, body: unknown) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, data: json.data, error: json.error as string | undefined };
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<"password" | "mfa">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const turnstile = useTurnstile(TURNSTILE_ACTIONS.adminLogin);

  function finish() {
    router.replace(safeNext(searchParams.get("next")));
    router.refresh();
  }

  async function handlePassword(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const turnstileToken = await turnstile.getToken();
      const result = await post("/api/admin/login", { email, password, [TURNSTILE_FIELD]: turnstileToken });
      if (!result.ok) {
        setError(result.error ?? "Sign in failed");
        return;
      }
      if (result.data?.mfaRequired) {
        setPassword("");
        setStep("mfa");
        return;
      }
      finish();
    } catch (error) {
      setError(submitErrorMessage(error, "Network error. Check your connection and try again."));
    } finally {
      turnstile.reset();
      setSubmitting(false);
    }
  }

  async function handleCode(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const result = await post("/api/admin/login/mfa", { code });
      if (!result.ok) {
        setError(result.error ?? "Verification failed");
        setCode("");
        // Pending sign-in expired, too many wrong codes or account locked: start over.
        if (result.status === 401 && /sign-in timed out/i.test(result.error ?? "")) setStep("password");
        if (result.status === 429) setStep("password");
        return;
      }
      finish();
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "mfa") {
    return (
      <form onSubmit={handleCode} className="mt-6 space-y-4">
        <p className="text-sm text-gray-600">
          {useRecoveryCode
            ? "Enter one of your recovery codes. Each code works once."
            : "Enter the 6-digit code from your authenticator app."}
        </p>
        <div className="space-y-1.5">
          <label htmlFor="admin-mfa-code" className="block text-sm font-medium text-gray-700">
            {useRecoveryCode ? "Recovery code" : "Authentication code"}
          </label>
          <input
            id="admin-mfa-code"
            required
            autoFocus
            autoComplete="one-time-code"
            inputMode={useRecoveryCode ? "text" : "numeric"}
            maxLength={useRecoveryCode ? 20 : 6}
            placeholder={useRecoveryCode ? "xxxxx-xxxxx" : "123456"}
            value={code}
            onChange={(e) => setCode(useRecoveryCode ? e.target.value : e.target.value.replace(/\D/g, ""))}
            className={`${inputClass} text-center font-mono text-lg tracking-[0.3em]`}
          />
        </div>
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        <button type="submit" disabled={submitting} className={buttonClass}>
          {submitting ? "Verifying…" : "Verify"}
        </button>
        <div className="flex justify-between text-xs">
          <button
            type="button"
            onClick={() => {
              setUseRecoveryCode((v) => !v);
              setCode("");
              setError(null);
            }}
            className="text-gray-500 hover:text-gray-900"
          >
            {useRecoveryCode ? "Use authenticator code" : "Use a recovery code"}
          </button>
          <button type="button" onClick={() => setStep("password")} className="text-gray-500 hover:text-gray-900">
            Back
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handlePassword} className="mt-6 space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="admin-email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="admin-email"
          type="email"
          required
          autoFocus
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <Link href="/admin/forgot-password" className="text-xs text-gray-500 hover:text-gray-900">
            Forgot password?
          </Link>
        </div>
        <PasswordInput id="admin-password" value={password} onChange={setPassword} autoComplete="current-password" />
      </div>
      {turnstile.widget}
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <button type="submit" disabled={submitting} className={buttonClass}>
        {submitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

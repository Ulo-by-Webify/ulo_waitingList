"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckBadgeIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import PasswordInput, { adminInputClass } from "../PasswordInput";

type Setup = { secret: string; qrDataUrl: string };

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

const primaryButton =
  "rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-60";
const secondaryButton =
  "rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60";

function RecoveryCodes({ codes, onDone }: { codes: string[]; onDone: () => void }) {
  const text = codes.join("\n");
  return (
    <div className="space-y-4 rounded-xl border border-amber-200 bg-amber-50 p-5">
      <div>
        <h3 className="text-sm font-semibold text-amber-900">Save your recovery codes</h3>
        <p className="mt-1 text-sm text-amber-800">
          Each code works once if you lose your phone. They won&apos;t be shown again, so store them in a password manager.
        </p>
      </div>
      <ul className="grid grid-cols-2 gap-2 rounded-lg bg-white p-4 font-mono text-sm text-gray-900 sm:grid-cols-5">
        {codes.map((code) => (
          <li key={code}>{code}</li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={secondaryButton}
          onClick={() => navigator.clipboard.writeText(text).then(() => toast.success("Codes copied"), () => toast.error("Couldn't copy"))}
        >
          Copy codes
        </button>
        <a
          className={secondaryButton}
          href={`data:text/plain;charset=utf-8,${encodeURIComponent(`Ulô Admin recovery codes\n\n${text}\n`)}`}
          download="ulo-admin-recovery-codes.txt"
        >
          Download .txt
        </a>
        <button type="button" className={primaryButton} onClick={onDone}>
          I&apos;ve saved them
        </button>
      </div>
    </div>
  );
}

interface TwoFactorPanelProps {
  enabled: boolean;
  remainingCodes: number;
}

export default function TwoFactorPanel({ enabled, remainingCodes }: TwoFactorPanelProps) {
  const router = useRouter();
  const [setup, setSetup] = useState<Setup | null>(null);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"idle" | "disable" | "regenerate">("idle");
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  async function run(action: () => Promise<void>) {
    setIsBusy(true);
    setError(null);
    try {
      await action();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsBusy(false);
    }
  }

  const reset = () => {
    setMode("idle");
    setCode("");
    setPassword("");
    setError(null);
  };

  if (recoveryCodes) {
    return (
      <RecoveryCodes
        codes={recoveryCodes}
        onDone={() => {
          setRecoveryCodes(null);
          router.refresh();
        }}
      />
    );
  }

  if (!enabled && setup) {
    return (
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          run(async () => {
            const data = await call("PUT", "/api/admin/account/mfa", { code });
            setSetup(null);
            setCode("");
            setRecoveryCodes(data.recoveryCodes);
            toast.success("Two-factor authentication is on");
          });
        }}
      >
        <ol className="list-decimal space-y-1 pl-5 text-sm text-gray-600">
          <li>Open an authenticator app (Google Authenticator, 1Password, Authy, Microsoft Authenticator).</li>
          <li>Scan the QR code, or enter the setup key by hand.</li>
          <li>Type the 6-digit code the app shows.</li>
        </ol>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <img src={setup.qrDataUrl} alt="QR code for your authenticator app" width={176} height={176} className="rounded-lg border border-gray-200 bg-white p-2" />
          <div className="min-w-0 space-y-1">
            <p className="text-xs font-medium text-gray-500">Setup key</p>
            <code className="block break-all rounded-lg bg-gray-50 px-3 py-2 text-sm tracking-wider text-gray-900">{setup.secret.replace(/(.{4})/g, "$1 ").trim()}</code>
          </div>
        </div>
        <div className="max-w-[220px] space-y-1.5">
          <label htmlFor="mfa-setup-code" className="block text-sm font-medium text-gray-700">
            6-digit code
          </label>
          <input
            id="mfa-setup-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            maxLength={6}
            required
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className={`${adminInputClass} text-center font-mono text-lg tracking-[0.4em]`}
          />
        </div>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button type="submit" disabled={isBusy || code.length !== 6} className={primaryButton}>
            {isBusy ? "Verifying…" : "Turn on 2FA"}
          </button>
          <button type="button" onClick={() => setSetup(null)} className={secondaryButton}>
            Cancel
          </button>
        </div>
      </form>
    );
  }

  if (!enabled) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <ExclamationTriangleIcon className="h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
          <p className="text-sm text-amber-900">
            Two-factor authentication is off. Anyone with your password can sign in. Turning it on adds a code from your phone.
          </p>
        </div>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <button
          type="button"
          disabled={isBusy}
          className={primaryButton}
          onClick={() => run(async () => setSetup(await call("POST", "/api/admin/account/mfa")))}
        >
          {isBusy ? "Preparing…" : "Set up two-factor authentication"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <CheckBadgeIcon className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
        <p className="text-sm text-emerald-900">
          Two-factor authentication is on. {remainingCodes} of 10 recovery codes left
          {remainingCodes <= 3 ? ", so generate new ones soon." : "."}
        </p>
      </div>

      {mode === "idle" && (
        <div className="flex flex-wrap gap-2">
          <button type="button" className={secondaryButton} onClick={() => setMode("regenerate")}>
            New recovery codes
          </button>
          <button type="button" className={`${secondaryButton} text-red-600`} onClick={() => setMode("disable")}>
            Turn off 2FA
          </button>
        </div>
      )}

      {mode !== "idle" && (
        <form
          className="space-y-3 rounded-xl border border-gray-200 p-4"
          onSubmit={(e) => {
            e.preventDefault();
            run(async () => {
              if (mode === "disable") {
                await call("DELETE", "/api/admin/account/mfa", { password, code });
                toast.success("Two-factor authentication turned off");
                reset();
                router.refresh();
              } else {
                const data = await call("POST", "/api/admin/account/mfa/recovery-codes", { password });
                reset();
                setRecoveryCodes(data.recoveryCodes);
              }
            });
          }}
        >
          <p className="text-sm font-medium text-gray-900">
            {mode === "disable" ? "Confirm with your password and a 2FA code" : "Confirm with your password. Old recovery codes will stop working."}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <PasswordInput id="mfa-confirm-password" value={password} onChange={setPassword} autoComplete="current-password" />
            {mode === "disable" && (
              <input
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="6-digit or recovery code"
                aria-label="2FA code"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={adminInputClass}
              />
            )}
          </div>
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={isBusy} className={mode === "disable" ? `${primaryButton} bg-red-600 hover:bg-red-700` : primaryButton}>
              {isBusy ? "Working…" : mode === "disable" ? "Turn off 2FA" : "Generate new codes"}
            </button>
            <button type="button" onClick={reset} className={secondaryButton}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

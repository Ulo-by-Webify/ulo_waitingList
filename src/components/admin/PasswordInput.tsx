"use client";

import { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export const adminInputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20";

interface PasswordInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: "current-password" | "new-password";
  required?: boolean;
  minLength?: number;
  describedBy?: string;
}

export default function PasswordInput({ id, value, onChange, autoComplete, required = true, minLength, describedBy }: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={isVisible ? "text" : "password"}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        aria-describedby={describedBy}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${adminInputClass} pr-12`}
      />
      <button
        type="button"
        onClick={() => setIsVisible((visible) => !visible)}
        aria-label={isVisible ? "Hide password" : "Show password"}
        aria-pressed={isVisible}
        aria-controls={id}
        className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-gray-500 transition hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
      >
        {isVisible ? <EyeSlashIcon className="h-5 w-5" aria-hidden="true" /> : <EyeIcon className="h-5 w-5" aria-hidden="true" />}
      </button>
    </div>
  );
}

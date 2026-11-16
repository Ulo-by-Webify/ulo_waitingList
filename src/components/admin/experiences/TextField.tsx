"use client";

import { useId } from "react";
import { adminInputClass } from "../PasswordInput";

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  isRequired?: boolean;
  isMultiline?: boolean;
  hint?: string;
};

/** Labelled text input with a character counter, used across the Experiences editor. */
export default function TextField({
  label,
  value,
  onChange,
  maxLength,
  isRequired = false,
  isMultiline = false,
  hint,
}: TextFieldProps) {
  const id = useId();
  const isEmpty = isRequired && !value.trim();
  const isNearLimit = value.length > maxLength * 0.9;
  const className = `${adminInputClass} py-2.5 ${isEmpty ? "border-red-300 focus:ring-red-200" : ""}`;

  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
          {!isRequired && <span className="font-normal text-gray-400"> (optional)</span>}
        </label>
        <span className={`text-xs tabular-nums ${isNearLimit ? "text-amber-700" : "text-gray-400"}`}>
          {value.length}/{maxLength}
        </span>
      </div>
      {isMultiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={maxLength}
          rows={3}
          aria-invalid={isEmpty}
          className={`${className} resize-y`}
        />
      ) : (
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={maxLength}
          aria-invalid={isEmpty}
          className={className}
        />
      )}
      {isEmpty ? (
        <p className="text-xs text-red-600">{label} can&apos;t be empty.</p>
      ) : (
        hint && <p className="text-xs text-gray-400">{hint}</p>
      )}
    </div>
  );
}

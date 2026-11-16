"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as Popover from "@radix-ui/react-popover";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import {
  EARLIEST_DAY,
  MAX_CUSTOM_DAYS,
  TRAFFIC_PRESETS,
  customPeriodError,
  formatPeriod,
  periodDays,
  todayUtc,
  type TrafficPeriod,
} from "@/lib/traffic-period";
import { adminInputClass } from "./PasswordInput";

const pillClass = (isActive: boolean) =>
  `inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm transition ${
    isActive ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100"
  }`;

export default function TrafficRangePicker({ period }: { period: TrafficPeriod }) {
  const router = useRouter();
  const isCustom = period.preset === null;
  const [isOpen, setIsOpen] = useState(false);
  const [from, setFrom] = useState(period.from);
  const [to, setTo] = useState(period.to);
  const [error, setError] = useState<string | null>(null);
  const today = todayUtc();

  function apply(event: FormEvent) {
    event.preventDefault();
    const problem = customPeriodError(from, to);
    if (problem) {
      setError(problem);
      return;
    }
    setIsOpen(false);
    router.push(`/admin/traffic?${new URLSearchParams({ from, to })}`);
  }

  function handleOpenChange(open: boolean) {
    if (open) {
      setFrom(period.from);
      setTo(period.to);
      setError(null);
    }
    setIsOpen(open);
  }

  const days = !customPeriodError(from, to) ? periodDays({ from, to }) : null;

  return (
    <nav aria-label="Date range" className="flex flex-wrap items-center gap-1 rounded-full border border-gray-200 bg-white p-1">
      {TRAFFIC_PRESETS.map((preset) => (
        <Link
          key={preset}
          href={`/admin/traffic?range=${preset}`}
          aria-current={period.preset === preset ? "page" : undefined}
          className={pillClass(period.preset === preset)}
        >
          {preset}d
        </Link>
      ))}

      <Popover.Root open={isOpen} onOpenChange={handleOpenChange}>
        <Popover.Trigger asChild>
          <button type="button" aria-current={isCustom ? "page" : undefined} className={pillClass(isCustom)}>
            <CalendarDaysIcon className="h-4 w-4" aria-hidden="true" />
            {isCustom ? formatPeriod(period) : "Custom"}
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            align="end"
            sideOffset={8}
            className="z-50 w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-gray-100 bg-white p-5 shadow-xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
          >
            <form onSubmit={apply} className="space-y-4" noValidate>
              <div>
                <p className="text-sm font-semibold text-gray-900">Custom range</p>
                <p className="text-xs text-gray-500">UTC days, up to {MAX_CUSTOM_DAYS} days.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1 text-xs font-medium text-gray-700">
                  <span>From</span>
                  <input
                    type="date"
                    value={from}
                    min={EARLIEST_DAY}
                    max={to || today}
                    onChange={(e) => {
                      setFrom(e.target.value);
                      setError(null);
                    }}
                    className={`${adminInputClass} py-2 text-sm`}
                    required
                  />
                </label>
                <label className="space-y-1 text-xs font-medium text-gray-700">
                  <span>To</span>
                  <input
                    type="date"
                    value={to}
                    min={from || EARLIEST_DAY}
                    max={today}
                    onChange={(e) => {
                      setTo(e.target.value);
                      setError(null);
                    }}
                    className={`${adminInputClass} py-2 text-sm`}
                    required
                  />
                </label>
              </div>
              {error ? (
                <p role="alert" className="text-xs text-red-600">
                  {error}
                </p>
              ) : (
                days && (
                  <p className="text-xs text-gray-500">
                    {days} day{days === 1 ? "" : "s"} selected
                  </p>
                )
              )}
              <div className="flex justify-end gap-2">
                <Popover.Close className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </Popover.Close>
                <button type="submit" className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
                  Apply
                </button>
              </div>
            </form>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </nav>
  );
}

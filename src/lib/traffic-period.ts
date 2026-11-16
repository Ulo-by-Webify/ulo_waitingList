import { format, parseISO } from "date-fns";

/**
 * Date ranges for the traffic dashboard. Days are UTC calendar days in YYYY-MM-DD form and
 * both ends are inclusive. Shared by the server (to validate the URL) and the date picker.
 */
export const TRAFFIC_PRESETS = [7, 30, 90] as const;
export type TrafficPreset = (typeof TRAFFIC_PRESETS)[number];
export const DEFAULT_PRESET: TrafficPreset = 30;

/** Longest custom range, so one request can't scan years of page views. */
export const MAX_CUSTOM_DAYS = 366;
/** Earliest date the picker allows. */
export const EARLIEST_DAY = "2024-01-01";

export type TrafficPeriod = {
  from: string;
  to: string;
  /** The preset this range came from, or null for a custom range. */
  preset: TrafficPreset | null;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

export function toIsoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function todayUtc(now = new Date()): string {
  return toIsoDay(now);
}

/** Number of days in the range, counting both ends. */
export function periodDays(period: Pick<TrafficPeriod, "from" | "to">): number {
  return Math.round((Date.parse(`${period.to}T00:00:00Z`) - Date.parse(`${period.from}T00:00:00Z`)) / DAY_MS) + 1;
}

export function presetPeriod(days: TrafficPreset, now = new Date()): TrafficPeriod {
  const to = todayUtc(now);
  const from = toIsoDay(new Date(Date.parse(`${to}T00:00:00Z`) - (days - 1) * DAY_MS));
  return { from, to, preset: days };
}

function isRealDay(value: string): boolean {
  if (!ISO_DAY.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && toIsoDay(parsed) === value;
}

/** Why a custom range is invalid, or null when it's fine. */
export function customPeriodError(from: string, to: string, now = new Date()): string | null {
  if (!isRealDay(from) || !isRealDay(to)) return "Choose a start and end date.";
  if (from > to) return "The start date must be on or before the end date.";
  if (from < EARLIEST_DAY) return "Dates before 2024 aren't available.";
  if (to > todayUtc(now)) return "The end date can't be in the future.";
  if (periodDays({ from, to }) > MAX_CUSTOM_DAYS) return `Choose a range of ${MAX_CUSTOM_DAYS} days or fewer.`;
  return null;
}

/** Reads the range from the URL: ?from=YYYY-MM-DD&to=YYYY-MM-DD, or ?range=7|30|90. Falls back to 30 days. */
export function resolvePeriod(params: { range?: string; from?: string; to?: string }, now = new Date()): TrafficPeriod {
  if (params.from && params.to && !customPeriodError(params.from, params.to, now)) {
    return { from: params.from, to: params.to, preset: null };
  }
  const requested = Number(params.range);
  const preset = TRAFFIC_PRESETS.includes(requested as TrafficPreset) ? (requested as TrafficPreset) : DEFAULT_PRESET;
  return presetPeriod(preset, now);
}

/** "3 Mar – 18 Mar 2026", or "3 Mar 2025 – 18 Jan 2026" across years. */
export function formatPeriod({ from, to }: Pick<TrafficPeriod, "from" | "to">): string {
  const start = parseISO(from);
  const end = parseISO(to);
  if (from === to) return format(end, "d MMM yyyy");
  const sameYear = start.getFullYear() === end.getFullYear();
  return `${format(start, sameYear ? "d MMM" : "d MMM yyyy")} – ${format(end, "d MMM yyyy")}`;
}

import type { ComponentType, SVGProps } from "react";
import { ChartBarIcon } from "@heroicons/react/24/outline";
import EmptyState from "./EmptyState";

type CountRow = { label: string; count: number };

interface BarListProps {
  title: string;
  rows: CountRow[];
  emptyText?: string;
  formatLabel?: (label: string) => string;
  emptyIcon?: ComponentType<SVGProps<SVGSVGElement>>;
}

export default function BarList({
  title,
  rows,
  emptyText = "No visits in this period yet.",
  formatLabel,
  emptyIcon = ChartBarIcon,
}: BarListProps) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        <span className="text-xs text-gray-500">Visitors</span>
      </div>
      {rows.length === 0 ? (
        <EmptyState
          variant="compact"
          icon={emptyIcon}
          title="Nothing to show yet"
          description={emptyText}
        />
      ) : (
        <ul className="mt-3 space-y-1.5">
          {rows.map((row) => {
            const label = formatLabel ? formatLabel(row.label) : row.label;
            return (
              <li
                key={row.label}
                className="relative flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-sm"
                title={`${label}: ${row.count}`}
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 rounded-lg bg-primary/[0.07]"
                  style={{ width: `${(row.count / max) * 100}%` }}
                />
                <span className="relative truncate text-gray-900">{label}</span>
                <span className="relative tabular-nums text-gray-600">
                  {row.count}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

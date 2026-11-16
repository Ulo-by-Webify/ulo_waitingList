"use client";

import type { ReactNode } from "react";
import { ArrowDownIcon, ArrowUpIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { move, removeAt, replaceAt } from "../experiences/list-utils";

const iconButtonClass =
  "rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:pointer-events-none disabled:opacity-30";

type ItemControlsProps = {
  label: string;
  index: number;
  count: number;
  minCount: number;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
};

/** Move up / move down / remove buttons for one item in a list. */
export function ItemControls({ label, index, count, minCount, onMove, onRemove }: ItemControlsProps) {
  return (
    <div className="flex items-center gap-0.5">
      <button type="button" onClick={() => onMove(-1)} disabled={index === 0} aria-label={`Move ${label} up`} className={iconButtonClass}>
        <ArrowUpIcon className="h-4 w-4" />
      </button>
      <button type="button" onClick={() => onMove(1)} disabled={index === count - 1} aria-label={`Move ${label} down`} className={iconButtonClass}>
        <ArrowDownIcon className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onRemove}
        disabled={count <= minCount}
        aria-label={`Remove ${label}`}
        title={count <= minCount ? `Keep at least ${minCount}` : undefined}
        className={`${iconButtonClass} hover:bg-red-50 hover:text-red-600`}
      >
        <TrashIcon className="h-4 w-4" />
      </button>
    </div>
  );
}

type ItemListProps<T extends { id?: string }> = {
  items: T[];
  onChange: (items: T[]) => void;
  /** Singular name used in labels, e.g. "card". */
  noun: string;
  max: number;
  min?: number;
  createItem: () => T;
  /** Shown after "card 2" in the item's labels, e.g. its title. */
  describe?: (item: T) => string;
  renderFields: (item: T, update: (patch: Partial<T>) => void) => ReactNode;
};

/** An ordered, editable list: each item gets move/remove controls, plus an "Add" button at the end. */
export default function ItemList<T extends { id?: string }>({
  items,
  onChange,
  noun,
  max,
  min = 1,
  createItem,
  describe,
  renderFields,
}: ItemListProps<T>) {
  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const detail = describe?.(item);
        const update = (patch: Partial<T>) => onChange(replaceAt(items, index, { ...item, ...patch }));
        return (
          <div key={item.id ?? index} className="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {noun} {index + 1}
              </p>
              <ItemControls
                label={`${noun} ${index + 1}${detail ? ` (${detail})` : ""}`}
                index={index}
                count={items.length}
                minCount={min}
                onMove={(direction) => onChange(move(items, index, direction))}
                onRemove={() => onChange(removeAt(items, index))}
              />
            </div>
            {renderFields(item, update)}
          </div>
        );
      })}

      <button
        type="button"
        onClick={() => onChange([...items, createItem()])}
        disabled={items.length >= max}
        className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50"
      >
        <PlusIcon className="h-4 w-4" aria-hidden="true" />
        {items.length >= max ? `Up to ${max} ${noun}s` : `Add ${noun}`}
      </button>
    </div>
  );
}

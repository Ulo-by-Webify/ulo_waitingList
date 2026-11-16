import type { SelectHTMLAttributes } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { toolbarSelectClass } from "./toolbar";

/** Toolbar dropdown with its chevron inset from the edge (the native arrow sits too close). */
export default function ToolbarSelect({ className = "", children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={`relative ${className}`}>
      <select {...props} className={toolbarSelectClass}>
        {children}
      </select>
      <ChevronDownIcon
        aria-hidden="true"
        className="pointer-events-none absolute right-5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
      />
    </div>
  );
}

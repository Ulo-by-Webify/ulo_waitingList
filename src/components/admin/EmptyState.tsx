import type { ComponentType, ReactNode, SVGProps } from "react";

type EmptyStateProps = {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  description?: ReactNode;
  /** Optional call to action (a link or button) shown under the text. */
  action?: ReactNode;
  /**
   * "card": standalone dashed card for a whole page section.
   * "plain": no border, for use inside an existing card or table cell.
   * "compact": smaller, for small panels such as the traffic lists.
   */
  variant?: "card" | "plain" | "compact";
};

const WRAPPER: Record<NonNullable<EmptyStateProps["variant"]>, string> = {
  card: "rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14",
  plain: "px-6 py-12",
  compact: "px-4 py-6",
};

/** Shared empty state for the admin dashboard: icon, title, short explanation and an optional action. */
export default function EmptyState({ icon: Icon, title, description, action, variant = "card" }: EmptyStateProps) {
  const isCompact = variant === "compact";
  return (
    <div className={`text-center ${WRAPPER[variant]}`}>
      <span
        className={`mx-auto flex items-center justify-center rounded-full bg-gray-50 ring-1 ring-gray-100 ${
          isCompact ? "h-10 w-10" : "h-14 w-14"
        }`}
      >
        <Icon className={`text-gray-400 ${isCompact ? "h-5 w-5" : "h-7 w-7"}`} aria-hidden="true" />
      </span>
      <p className={`font-semibold text-gray-900 ${isCompact ? "mt-3 text-sm" : "mt-4 text-base"}`}>{title}</p>
      {description && (
        <p className={`mx-auto mt-1 max-w-sm text-gray-500 text-pretty ${isCompact ? "text-xs" : "text-sm"}`}>{description}</p>
      )}
      {action && <div className={isCompact ? "mt-3" : "mt-5"}>{action}</div>}
    </div>
  );
}

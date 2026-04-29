import * as React from "react";

import { cn } from "./utils";
import { getStatusBadgeClasses, getStatusLabel } from "../../utils/statusColors";

/**
 * Filled status pill that maps a status string to canonical M3 container
 * colors via the central registry in `src/utils/statusColors.ts`.
 *
 * The visible label comes from `getStatusLabel`, so backend values like
 * `registered` automatically render as "Ready for Packing".
 *
 * Sizes:
 *   - `sm` (default) — compact pill for list rows / mobile cards
 *     (`px-2 py-0.5 label-small`).
 *   - `lg` — wider pill for desktop tables, with a min-width so columns
 *     stay visually aligned (`px-3 py-1.5 label-medium min-w-[120px]`).
 *
 * Usage:
 *   <StatusBadge status={item.status} />            // sm
 *   <StatusBadge status={order.status} size="lg" /> // desktop table
 *
 * Pass `children` to override the visible label while keeping the
 * status-driven color (e.g. localized text):
 *   <StatusBadge status="delivered">Levererad</StatusBadge>
 */
type StatusBadgeSize = "sm" | "lg";

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: string | null | undefined;
  size?: StatusBadgeSize;
}

const SIZE_CLASSES: Record<StatusBadgeSize, string> = {
  sm: "px-2 py-0.5 label-small",
  lg: "px-3 py-1.5 label-medium min-w-[120px] justify-center",
};

function StatusBadge({
  status,
  size = "sm",
  className,
  children,
  ...props
}: StatusBadgeProps) {
  return (
    <span
      data-slot="status-badge"
      data-size={size}
      className={cn(
        "inline-flex items-center rounded-full whitespace-nowrap",
        SIZE_CLASSES[size],
        getStatusBadgeClasses(status),
        className,
      )}
      {...props}
    >
      {children ?? getStatusLabel(status)}
    </span>
  );
}

export { StatusBadge };

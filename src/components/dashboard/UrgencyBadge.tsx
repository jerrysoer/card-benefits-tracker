import type { UrgencyState } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

interface UrgencyBadgeProps {
  urgency: UrgencyState | "used";
  label?: string;
}

const defaultLabels: Record<UrgencyState | "used", string> = {
  green: "Chill",
  amber: "Soon",
  red: "Expiring!",
  used: "Done",
};

const urgencyStyles: Record<UrgencyState | "used", string> = {
  green: "bg-green-bg text-green",
  amber: "bg-amber-bg text-amber",
  red: "bg-red-bg text-red",
  used: "bg-bg-elevated text-text-muted",
};

export default function UrgencyBadge({ urgency, label }: UrgencyBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        urgencyStyles[urgency]
      )}
    >
      {label ?? defaultLabels[urgency]}
    </span>
  );
}

import type { UrgencyState } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

interface UrgencyBadgeProps {
  urgency: UrgencyState | "used";
  label?: string;
}

const defaultLabels: Record<UrgencyState | "used", string> = {
  green: "Safe",
  amber: "Soon",
  red: "Urgent",
  used: "Used",
};

const urgencyStyles: Record<UrgencyState | "used", string> = {
  green: "bg-[#34D399]/15 text-[#34D399]",
  amber: "bg-[#FBBF24]/15 text-[#FBBF24]",
  red: "bg-[#F87171]/15 text-[#F87171]",
  used: "bg-[#525C6E]/15 text-[#525C6E]",
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

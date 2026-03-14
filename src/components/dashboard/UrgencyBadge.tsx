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
  green: "bg-[#D1FAE5] text-[#10B981]",
  amber: "bg-[#FEF3C7] text-[#F59E0B]",
  red: "bg-[#FEE2E2] text-[#EF4444]",
  used: "bg-[#F3F4F6] text-[#6B7280]",
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

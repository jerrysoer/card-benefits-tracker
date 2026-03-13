"use client";

import type { BenefitWithCard } from "@/lib/supabase/types";
import { getUrgencyColor } from "@/lib/benefits/urgency";
import { formatDaysRemaining, formatPeriodLabel } from "@/lib/benefits/deadline";
import { formatCurrency } from "@/lib/benefits/roi";
import { cn, getCategoryLabel } from "@/lib/utils";
import CountdownRing from "@/components/dashboard/CountdownRing";
import UrgencyBadge from "@/components/dashboard/UrgencyBadge";

interface BenefitRowProps {
  benefit: BenefitWithCard;
  onMarkUsed: (benefitId: string, amount?: number) => void;
  index?: number;
}

export default function BenefitRow({
  benefit,
  onMarkUsed,
  index = 0,
}: BenefitRowProps) {
  const isUsed = benefit.usage?.cc_is_fully_used ?? false;
  const urgency = isUsed ? "used" as const : benefit.urgency;
  const totalDays = Math.ceil(
    (benefit.period.end.getTime() - benefit.period.start.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <div
      className={cn(
        "animate-slide-up flex items-center gap-3 rounded-lg bg-bg-card border border-border px-4 py-3 transition-colors hover:bg-bg-elevated",
        isUsed && "opacity-60"
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Urgency stripe */}
      <div
        className="w-[3px] self-stretch rounded-full shrink-0"
        style={{ backgroundColor: getUrgencyColor(urgency) }}
      />

      {/* Countdown ring */}
      <CountdownRing
        daysRemaining={benefit.period.daysRemaining}
        totalDays={totalDays}
        urgency={urgency}
      />

      {/* Benefit info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn("text-sm font-medium truncate", isUsed ? "text-text-muted line-through" : "text-text-primary")}>
            {benefit.cc_benefit_name}
          </span>
          <UrgencyBadge urgency={urgency} />
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-text-secondary truncate">
            {benefit.card.cc_card_name}
          </span>
          <span className="text-xs text-text-muted">
            {getCategoryLabel(benefit.cc_category)}
          </span>
          {benefit.cc_merchant_notes && (
            <span className="text-xs text-text-muted truncate">
              {benefit.cc_merchant_notes}
            </span>
          )}
        </div>
      </div>

      {/* Value */}
      <div className="text-right shrink-0">
        <span className={cn("font-mono-data text-sm font-semibold", isUsed ? "text-text-muted" : "text-text-primary")}>
          {formatCurrency(benefit.cc_benefit_value)}
        </span>
        <div className="text-xs text-text-muted">
          {formatPeriodLabel(benefit.cc_benefit_period)}
        </div>
      </div>

      {/* Days remaining */}
      <div className="text-right shrink-0 w-24">
        <span className={cn("text-xs", isUsed ? "text-text-muted" : "text-text-secondary")}>
          {isUsed ? "Used" : formatDaysRemaining(benefit.period.daysRemaining)}
        </span>
      </div>

      {/* Mark Used button */}
      <button
        onClick={() => onMarkUsed(benefit.id)}
        disabled={isUsed}
        className={cn(
          "shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
          isUsed
            ? "bg-bg-elevated text-text-muted cursor-not-allowed"
            : "bg-bg-elevated text-text-secondary hover:bg-[#60A5FA]/15 hover:text-[#60A5FA] border border-border"
        )}
      >
        {isUsed ? (
          <span className="flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Done
          </span>
        ) : (
          "Mark Used"
        )}
      </button>
    </div>
  );
}

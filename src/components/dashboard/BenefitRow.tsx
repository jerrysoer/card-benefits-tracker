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

const urgencyBgColors: Record<string, string> = {
  green: "bg-green-bg",
  amber: "bg-amber-bg",
  red: "bg-red-bg",
  used: "bg-used-bg",
};

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
        "animate-slide-up rounded-2xl px-5 py-4 transition-shadow hover:shadow-sm",
        urgencyBgColors[urgency],
        isUsed && "opacity-60"
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Top row: ring + name + badge + value */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:block">
          <CountdownRing
            daysRemaining={benefit.period.daysRemaining}
            totalDays={totalDays}
            urgency={urgency}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn("text-sm font-medium truncate", isUsed ? "text-text-muted line-through" : "text-text-primary")}>
              {benefit.cc_benefit_name}
            </span>
            <UrgencyBadge urgency={urgency} />
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs text-text-secondary truncate">
              {benefit.card.cc_card_name}
            </span>
            <span className="text-text-muted">&middot;</span>
            <span className="text-xs text-text-muted shrink-0">
              {getCategoryLabel(benefit.cc_category)}
            </span>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className={cn("font-mono-data text-sm font-semibold", isUsed ? "text-text-muted" : "text-text-primary")}>
            {formatCurrency(benefit.cc_benefit_value)}
          </span>
          <div className="text-xs text-text-muted">
            {formatPeriodLabel(benefit.cc_benefit_period)}
          </div>
        </div>
      </div>

      {/* Bottom row: days remaining + action */}
      <div className="mt-2 flex items-center justify-between">
        <span className={cn("text-xs", isUsed ? "text-text-muted" : "text-text-secondary")}>
          {isUsed ? "Done" : formatDaysRemaining(benefit.period.daysRemaining)}
        </span>

        <button
          onClick={() => onMarkUsed(benefit.id)}
          disabled={isUsed}
          className={cn(
            "shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-transform",
            isUsed
              ? "bg-border text-text-muted cursor-not-allowed"
              : "bg-gold text-white active:scale-[0.97]"
          )}
        >
          {isUsed ? (
            <span className="flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-sage">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Nice!
            </span>
          ) : (
            "Got it!"
          )}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import type { BenefitWithCard, UrgencyState } from "@/lib/supabase/types";
import { getUrgencySortPriority } from "@/lib/benefits/urgency";
import { cn } from "@/lib/utils";
import BenefitRow from "@/components/dashboard/BenefitRow";

interface BenefitTimelineProps {
  benefits: BenefitWithCard[];
  onMarkUsed: (benefitId: string, amount?: number) => void;
}

type StatusFilter = "all" | "unused" | "used";
type PeriodFilter = "all" | "monthly" | "quarterly" | "semi_annual" | "annual";

export default function BenefitTimeline({
  benefits,
  onMarkUsed,
}: BenefitTimelineProps) {
  const [cardFilter, setCardFilter] = useState<string>("all");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const cards = useMemo(() => {
    const unique = new Map<string, string>();
    for (const b of benefits) {
      unique.set(b.card.id, b.card.cc_card_name);
    }
    return Array.from(unique.entries());
  }, [benefits]);

  const filtered = useMemo(() => {
    return benefits.filter((b) => {
      if (cardFilter !== "all" && b.card.id !== cardFilter) return false;
      if (periodFilter !== "all" && b.cc_benefit_period !== periodFilter)
        return false;
      const isUsed = b.usage?.cc_is_fully_used ?? false;
      if (statusFilter === "unused" && isUsed) return false;
      if (statusFilter === "used" && !isUsed) return false;
      return true;
    });
  }, [benefits, cardFilter, periodFilter, statusFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aUsed = a.usage?.cc_is_fully_used ?? false;
      const bUsed = b.usage?.cc_is_fully_used ?? false;
      if (aUsed !== bUsed) return aUsed ? 1 : -1;

      const aUrgency = aUsed ? "used" as const : a.urgency;
      const bUrgency = bUsed ? "used" as const : b.urgency;
      const urgencyDiff =
        getUrgencySortPriority(aUrgency) - getUrgencySortPriority(bUrgency);
      if (urgencyDiff !== 0) return urgencyDiff;

      return a.period.daysRemaining - b.period.daysRemaining;
    });
  }, [filtered]);

  const urgencyCounts = useMemo(() => {
    const counts: Record<UrgencyState | "used", number> = {
      green: 0,
      amber: 0,
      red: 0,
      used: 0,
    };
    for (const b of filtered) {
      if (b.usage?.cc_is_fully_used) {
        counts.used++;
      } else {
        counts[b.urgency]++;
      }
    }
    return counts;
  }, [filtered]);

  const selectClasses =
    "rounded-md border border-border bg-bg-elevated px-2 py-1 text-xs text-text-secondary outline-none focus:border-[#60A5FA] transition-colors";

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-text-primary">
            Benefits Timeline
          </h2>
          <span className="text-sm text-text-secondary">
            {sorted.length} benefit{sorted.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Urgency breakdown */}
        <div className="flex items-center gap-2 text-xs">
          {urgencyCounts.red > 0 && (
            <span className="text-[#F87171]">
              {urgencyCounts.red} urgent
            </span>
          )}
          {urgencyCounts.amber > 0 && (
            <span className="text-[#FBBF24]">
              {urgencyCounts.amber} soon
            </span>
          )}
          {urgencyCounts.green > 0 && (
            <span className="text-[#34D399]">
              {urgencyCounts.green} safe
            </span>
          )}
          {urgencyCounts.used > 0 && (
            <span className="text-text-muted">
              {urgencyCounts.used} used
            </span>
          )}
        </div>
      </div>

      {/* Filter controls */}
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={cardFilter}
          onChange={(e) => setCardFilter(e.target.value)}
          className={selectClasses}
        >
          <option value="all">All Cards</option>
          {cards.map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>

        <select
          value={periodFilter}
          onChange={(e) => setPeriodFilter(e.target.value as PeriodFilter)}
          className={selectClasses}
        >
          <option value="all">All Periods</option>
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
          <option value="semi_annual">Semi-Annual</option>
          <option value="annual">Annual</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className={selectClasses}
        >
          <option value="all">All Status</option>
          <option value="unused">Unused</option>
          <option value="used">Used</option>
        </select>
      </div>

      {/* Benefit rows */}
      <div className="flex flex-col gap-2">
        {sorted.length === 0 ? (
          <div className="flex items-center justify-center rounded-lg border border-border bg-bg-card px-4 py-8">
            <span className="text-sm text-text-muted">
              No benefits match the current filters.
            </span>
          </div>
        ) : (
          sorted.map((benefit, i) => (
            <BenefitRow
              key={benefit.id}
              benefit={benefit}
              onMarkUsed={onMarkUsed}
              index={i}
            />
          ))
        )}
      </div>
    </div>
  );
}

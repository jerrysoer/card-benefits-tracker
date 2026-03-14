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

function PillChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-[#111] text-white"
          : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"
      )}
    >
      {children}
    </button>
  );
}

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

  const periodOptions: { value: PeriodFilter; label: string }[] = [
    { value: "all", label: "All Periods" },
    { value: "monthly", label: "Monthly" },
    { value: "quarterly", label: "Quarterly" },
    { value: "semi_annual", label: "Semi-Annual" },
    { value: "annual", label: "Annual" },
  ];

  const statusOptions: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "unused", label: "Unused" },
    { value: "used", label: "Used" },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-text-primary">
            Your Benefits
          </h2>
          <span className="text-sm text-text-secondary">
            {sorted.length} benefit{sorted.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Urgency breakdown */}
        <div className="flex items-center gap-2 text-xs">
          {urgencyCounts.red > 0 && (
            <span className="text-[#EF4444]">
              {urgencyCounts.red} expiring
            </span>
          )}
          {urgencyCounts.amber > 0 && (
            <span className="text-[#F59E0B]">
              {urgencyCounts.amber} soon
            </span>
          )}
          {urgencyCounts.green > 0 && (
            <span className="text-[#10B981]">
              {urgencyCounts.green} chill
            </span>
          )}
          {urgencyCounts.used > 0 && (
            <span className="text-text-muted">
              {urgencyCounts.used} done
            </span>
          )}
        </div>
      </div>

      {/* Filter pill chips */}
      <div className="flex flex-col gap-2">
        {/* Card filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <PillChip active={cardFilter === "all"} onClick={() => setCardFilter("all")}>
            All Cards
          </PillChip>
          {cards.map(([id, name]) => (
            <PillChip key={id} active={cardFilter === id} onClick={() => setCardFilter(id)}>
              {name}
            </PillChip>
          ))}
        </div>

        {/* Period + Status filters */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {periodOptions.map((opt) => (
            <PillChip
              key={opt.value}
              active={periodFilter === opt.value}
              onClick={() => setPeriodFilter(opt.value)}
            >
              {opt.label}
            </PillChip>
          ))}
          <span className="mx-1 self-center text-[#E5E7EB]">|</span>
          {statusOptions.map((opt) => (
            <PillChip
              key={opt.value}
              active={statusFilter === opt.value}
              onClick={() => setStatusFilter(opt.value)}
            >
              {opt.label}
            </PillChip>
          ))}
        </div>
      </div>

      {/* Benefit rows */}
      <div className="flex flex-col gap-4">
        {sorted.length === 0 ? (
          <div className="flex items-center justify-center rounded-2xl bg-white px-4 py-8 shadow-card">
            <span className="text-sm text-text-muted">
              No benefits match your filters.
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

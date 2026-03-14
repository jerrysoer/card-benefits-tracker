"use client";

import { useMemo, useState } from "react";
import type { BenefitWithCard, UrgencyState } from "@/lib/supabase/types";
import { getUrgencySortPriority } from "@/lib/benefits/urgency";
import { formatCurrency } from "@/lib/benefits/roi";
import { cn } from "@/lib/utils";
import BenefitRow from "@/components/dashboard/BenefitRow";

interface BenefitTimelineProps {
  benefits: BenefitWithCard[];
  onMarkUsed: (benefitId: string, amount?: number) => void;
}

type StatusFilter = "all" | "unused" | "used";
type PeriodFilter = "all" | "monthly" | "quarterly" | "semi_annual" | "annual";
type SectionKey = "red" | "amber" | "green" | "used";

const sectionConfig: Record<SectionKey, { label: string; color: string; dotColor: string }> = {
  red: { label: "Expiring Soon", color: "text-[#EF4444]", dotColor: "bg-[#EF4444]" },
  amber: { label: "Coming Up", color: "text-[#F59E0B]", dotColor: "bg-[#F59E0B]" },
  green: { label: "No Rush", color: "text-[#10B981]", dotColor: "bg-[#10B981]" },
  used: { label: "Completed", color: "text-text-muted", dotColor: "bg-[#9CA3AF]" },
};

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

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("transition-transform", open ? "rotate-180" : "")}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export default function BenefitTimeline({
  benefits,
  onMarkUsed,
}: BenefitTimelineProps) {
  const [cardFilter, setCardFilter] = useState<string>("all");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [collapsed, setCollapsed] = useState<Record<SectionKey, boolean>>({
    red: false,
    amber: false,
    green: false,
    used: true,
  });

  const toggleSection = (key: SectionKey) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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

  const sections = useMemo(() => {
    const groups: Record<SectionKey, BenefitWithCard[]> = {
      red: [],
      amber: [],
      green: [],
      used: [],
    };

    for (const b of filtered) {
      if (b.usage?.cc_is_fully_used) {
        groups.used.push(b);
      } else {
        groups[b.urgency].push(b);
      }
    }

    // Sort within each group by days remaining
    for (const key of Object.keys(groups) as SectionKey[]) {
      groups[key].sort((a, b) => a.period.daysRemaining - b.period.daysRemaining);
    }

    return groups;
  }, [filtered]);

  const sectionTotals = useMemo(() => {
    const totals: Record<SectionKey, number> = { red: 0, amber: 0, green: 0, used: 0 };
    for (const key of Object.keys(sections) as SectionKey[]) {
      totals[key] = sections[key].reduce((sum, b) => sum + b.cc_benefit_value, 0);
    }
    return totals;
  }, [sections]);

  const totalCount = filtered.length;

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

  const sectionOrder: SectionKey[] = ["red", "amber", "green", "used"];
  let runningIndex = 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-text-primary">
            Your Benefits
          </h2>
          <span className="text-sm text-text-secondary">
            {totalCount} benefit{totalCount !== 1 ? "s" : ""}
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

      {/* Benefit sections */}
      {totalCount === 0 ? (
        <div className="flex items-center justify-center rounded-2xl bg-white px-4 py-8 shadow-card">
          <span className="text-sm text-text-muted">
            No benefits match your filters.
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sectionOrder.map((key) => {
            const items = sections[key];
            if (items.length === 0) return null;
            const config = sectionConfig[key];
            const isOpen = !collapsed[key];
            const startIndex = runningIndex;
            runningIndex += items.length;

            return (
              <div key={key} className="flex flex-col">
                {/* Section header */}
                <button
                  onClick={() => toggleSection(key)}
                  className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-card transition-colors hover:bg-[#F9FAFB]"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={cn("h-2.5 w-2.5 rounded-full", config.dotColor)} />
                    <span className={cn("text-sm font-semibold", config.color)}>
                      {config.label}
                    </span>
                    <span className="rounded-full bg-[#F3F4F6] px-2 py-0.5 text-xs font-medium text-[#6B7280]">
                      {items.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono-data text-xs font-medium text-text-secondary">
                      {formatCurrency(sectionTotals[key])}
                    </span>
                    <span className="text-text-muted">
                      <ChevronIcon open={isOpen} />
                    </span>
                  </div>
                </button>

                {/* Section content */}
                {isOpen && (
                  <div className="mt-2 flex flex-col gap-3 pl-2">
                    {items.map((benefit, i) => (
                      <BenefitRow
                        key={benefit.id}
                        benefit={benefit}
                        onMarkUsed={onMarkUsed}
                        index={startIndex + i}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

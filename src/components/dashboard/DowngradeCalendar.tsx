"use client";

import { useState, useEffect } from "react";
import type { CardROI, BenefitWithCard } from "@/lib/supabase/types";
import { calculateGrade, getVerdictForDowngrade } from "@/lib/scoring";
import { formatCurrency } from "@/lib/benefits/roi";
import { getCardOpenDates, setCardOpenDate } from "@/lib/local-storage";

interface DowngradeCalendarProps {
  cardROIs: CardROI[];
  benefits: BenefitWithCard[];
}

interface CalendarEntry {
  roi: CardROI;
  grade: ReturnType<typeof calculateGrade>;
  daysUntilRenewal: number;
  renewalDate: Date;
  openDate: string | null;
}

function calculateNextRenewal(openDateStr: string): { date: Date; days: number } {
  const openDate = new Date(openDateStr);
  const now = new Date();
  const thisYear = new Date(now.getFullYear(), openDate.getMonth(), openDate.getDate());
  const nextYear = new Date(now.getFullYear() + 1, openDate.getMonth(), openDate.getDate());
  const target = thisYear > now ? thisYear : nextYear;
  const days = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return { date: target, days };
}

function getMonthLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" }).toUpperCase();
}

export default function DowngradeCalendar({ cardROIs, benefits }: DowngradeCalendarProps) {
  const [openDates, setOpenDates] = useState<Record<string, string>>({});
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setOpenDates(getCardOpenDates());
    setMounted(true);
  }, []);

  // Only cards with annual fees
  const premiumROIs = cardROIs.filter((r) => r.card.cc_annual_fee > 0);

  // Build calendar entries
  const entries: CalendarEntry[] = premiumROIs.map((roi) => {
    const slug = roi.card.cc_card_slug;
    const dateStr = openDates[slug] || roi.userCard.cc_card_open_date;
    const grade = calculateGrade(roi.totalCaptured, roi.annualFee);

    if (dateStr) {
      const { date, days } = calculateNextRenewal(dateStr);
      return { roi, grade, daysUntilRenewal: days, renewalDate: date, openDate: dateStr };
    }

    // Unknown open date — place at end
    return {
      roi,
      grade,
      daysUntilRenewal: 999,
      renewalDate: new Date(Date.now() + 365 * 86400000),
      openDate: null,
    };
  });

  // Sort by nearest renewal
  entries.sort((a, b) => a.daysUntilRenewal - b.daysUntilRenewal);

  // Group by month
  const grouped = new Map<string, CalendarEntry[]>();
  for (const entry of entries) {
    const label = entry.openDate ? getMonthLabel(entry.renewalDate) : "DATE NEEDED";
    const group = grouped.get(label) ?? [];
    group.push(entry);
    grouped.set(label, group);
  }

  const decisionsIn90 = entries.filter((e) => e.daysUntilRenewal <= 90 && e.openDate).length;

  const handleSaveDate = (slug: string) => {
    if (editDate) {
      setCardOpenDate(slug, editDate);
      setOpenDates((prev) => ({ ...prev, [slug]: editDate }));
    }
    setEditingSlug(null);
    setEditDate("");
  };

  if (!mounted) return null;

  return (
    <div>
      <h2 className="font-display mb-4 text-sm text-text-secondary">
        ANNUAL FEE CALENDAR
      </h2>

      <div className="space-y-6">
        {Array.from(grouped.entries()).map(([monthLabel, group]) => (
          <div key={monthLabel}>
            <div className="mb-3 flex items-center gap-3">
              <div className="h-3 w-3 rounded-sm bg-text-muted" />
              <span className="font-display text-xs text-text-muted">
                {monthLabel}
              </span>
              <div className="h-px flex-1 bg-[#2A3040]" />
            </div>

            <div className="space-y-3">
              {group.map((entry) => {
                const { roi, grade, daysUntilRenewal, openDate } = entry;
                const card = roi.card;
                const downgrade = card.cc_downgrade_to;
                const verdictInfo = getVerdictForDowngrade(grade.grade, card, downgrade);
                const isUrgent = daysUntilRenewal <= 90 && openDate;

                return (
                  <div
                    key={card.id}
                    className="rounded-lg border-2 p-4"
                    style={{
                      borderColor: isUrgent
                        ? daysUntilRenewal <= 30
                          ? "#FF3131"
                          : "#FFE600"
                        : "#2A3040",
                      backgroundColor: "#1A1A1A",
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-text-primary">
                          {card.cc_card_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-right">
                        <span className="font-mono-data text-sm font-bold text-text-secondary">
                          {formatCurrency(card.cc_annual_fee)}
                        </span>
                        {openDate && (
                          <span className="font-mono-data text-xs text-text-muted">
                            in {daysUntilRenewal}d
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 flex items-center gap-3">
                      <span
                        className="inline-flex items-center gap-1 rounded border-2 px-2 py-0.5 font-mono-data text-xs font-bold"
                        style={{ borderColor: grade.color, color: grade.color }}
                      >
                        {grade.grade}
                      </span>
                      <span className="text-sm">
                        {verdictInfo.emoji}{" "}
                        <span className="font-bold" style={{ color: grade.color }}>
                          {verdictInfo.action}
                        </span>
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-text-secondary">
                      &ldquo;{verdictInfo.verdict}&rdquo;
                    </p>

                    {!openDate && editingSlug !== card.cc_card_slug && (
                      <button
                        onClick={() => {
                          setEditingSlug(card.cc_card_slug);
                          setEditDate("");
                        }}
                        className="mt-2 text-xs text-neon-blue transition-opacity hover:opacity-80"
                      >
                        Set card open date
                      </button>
                    )}

                    {editingSlug === card.cc_card_slug && (
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="rounded border border-[#2A3040] bg-[#252525] px-2 py-1 text-xs text-text-primary focus:border-neon-blue focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveDate(card.cc_card_slug)}
                          className="rounded bg-neon-blue px-2 py-1 text-xs font-bold text-black"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingSlug(null)}
                          className="text-xs text-text-muted"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {decisionsIn90 > 0 && (
        <div className="mt-4 rounded-lg border-2 border-neon-yellow bg-bg-card-neo px-4 py-3">
          <span className="font-mono-data text-sm font-bold text-neon-yellow">
            \uD83D\uDCCD {decisionsIn90} decision{decisionsIn90 !== 1 ? "s" : ""} in the next 90 days
          </span>
        </div>
      )}
    </div>
  );
}

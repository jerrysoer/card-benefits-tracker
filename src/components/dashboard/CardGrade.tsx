"use client";

import { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import type { CardROI, BenefitWithCard } from "@/lib/supabase/types";
import { calculateGrade, getStableVerdict } from "@/lib/scoring";
import { formatCurrency } from "@/lib/benefits/roi";
import { getCardOpenDates } from "@/lib/storage";

interface CardGradeProps {
  cardROI: CardROI;
  benefits: BenefitWithCard[];
  compact?: boolean;
}

export default function CardGrade({ cardROI, benefits, compact }: CardGradeProps) {
  const { card } = cardROI;
  const grade = calculateGrade(cardROI.totalCaptured, cardROI.annualFee);
  const verdict = getStableVerdict(grade.grade, card, benefits);

  const [daysUntilRenewal, setDaysUntilRenewal] = useState<number | null>(null);
  useEffect(() => {
    getCardOpenDates().then((dates) => {
      const openDate = dates[card.cc_card_slug];
      if (openDate) setDaysUntilRenewal(calculateDaysUntilRenewal(openDate));
    });
  }, [card.cc_card_slug]);

  const progressPercent = cardROI.annualFee > 0
    ? Math.min((cardROI.totalCaptured / cardROI.annualFee) * 100, 200)
    : 0;

  if (compact) {
    return (
      <div className="flex items-center gap-4 rounded-lg border-2 border-[#2A3040] bg-bg-card-neo p-4 transition-colors hover:bg-bg-card-hover-neo">
        <div
          className="animate-grade-bounce flex h-12 w-12 items-center justify-center border-3 font-mono-data text-lg font-bold"
          style={{ borderColor: grade.color, color: grade.color }}
        >
          {grade.grade}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <span className="truncate text-sm font-medium text-text-primary">
              {card.cc_card_name}
            </span>
            <span className="font-mono-data text-xs text-text-muted">
              {formatCurrency(card.cc_annual_fee)}/yr
            </span>
          </div>
          <p className="mt-1 truncate text-xs text-text-secondary">{verdict}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border-3 border-[#2A3040] bg-bg-card-neo p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-bold text-text-primary">{card.cc_card_name}</h3>
        <span className="font-mono-data text-sm font-bold text-text-secondary">
          {formatCurrency(card.cc_annual_fee)}/yr
        </span>
      </div>

      {/* Grade */}
      <div className="mt-6 flex justify-center">
        <div
          className="animate-grade-bounce flex items-center justify-center border-4 font-mono-data text-[80px] font-bold leading-none"
          style={{
            borderColor: grade.color,
            color: grade.color,
            width: "120px",
            height: "120px",
          }}
        >
          {grade.grade}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-6">
        <div className="flex items-baseline justify-between text-sm">
          <span className="text-text-secondary">
            <span className="font-mono-data font-bold text-text-primary">
              {formatCurrency(cardROI.totalCaptured)}
            </span>{" "}
            captured of {formatCurrency(cardROI.annualFee)} fee
          </span>
          <span className="font-mono-data font-bold" style={{ color: grade.color }}>
            {Math.round(grade.percentage)}%
          </span>
        </div>
        <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-[#252525]">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${Math.min(progressPercent, 100)}%`,
              backgroundColor: grade.color,
            }}
          />
        </div>
      </div>

      {/* Verdict */}
      <p className="mt-4 text-base text-text-secondary">&ldquo;{verdict}&rdquo;</p>

      {/* Renewal warning */}
      {daysUntilRenewal !== null && daysUntilRenewal <= 90 && (
        <div className="mt-3 flex items-center gap-2 text-sm" style={{ color: daysUntilRenewal <= 30 ? "#FF3131" : "#FFE600" }}>
          <AlertTriangle className="h-4 w-4" />
          <span>Annual fee renews in {daysUntilRenewal} days</span>
        </div>
      )}
    </div>
  );
}

function calculateDaysUntilRenewal(openDateStr: string): number {
  const openDate = new Date(openDateStr);
  const now = new Date();
  const thisYearAnniversary = new Date(now.getFullYear(), openDate.getMonth(), openDate.getDate());
  const nextYearAnniversary = new Date(now.getFullYear() + 1, openDate.getMonth(), openDate.getDate());

  const target = thisYearAnniversary > now ? thisYearAnniversary : nextYearAnniversary;
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

"use client";

import type { MoneyRatios as MoneyRatiosType } from "@/lib/fullwallet/types";
import { getRatioVerdict } from "@/lib/fullwallet/verdicts";

interface MoneyRatiosProps {
  ratios: MoneyRatiosType;
  annualIncome: number;
  annualFees: number;
  annualCaptured: number;
  annualSubBurn: number;
  annualSavings: number;
}

interface RatioCardProps {
  label: string;
  pct: number;
  numerator: number;
  denominator: number;
  verdict: string;
  color: string;
}

function RatioCard({
  label,
  pct,
  numerator,
  denominator,
  verdict,
  color,
}: RatioCardProps) {
  return (
    <div className="rounded-lg border border-border bg-bg-card px-4 py-3">
      <div className="mb-1 text-xs text-text-muted">{label}</div>
      <div className="font-mono-data text-xl font-bold" style={{ color }}>
        {pct.toFixed(1)}%
      </div>
      <div className="mb-1 text-[10px] text-text-muted">
        ${numerator.toLocaleString()} / ${denominator.toLocaleString()}
      </div>
      <p className="text-[11px] text-text-secondary">{verdict}</p>
    </div>
  );
}

function getColor(type: string, pct: number): string {
  switch (type) {
    case "fees":
      return pct < 1 ? "#6B8F71" : pct <= 3 ? "#C8963E" : "#C4717A";
    case "captured":
      return pct > 3 ? "#6B8F71" : pct > 1 ? "#C8963E" : "#C4717A";
    case "subscriptions":
      return pct < 3 ? "#6B8F71" : pct <= 5 ? "#C8963E" : "#C4717A";
    case "savings":
      return pct >= 20 ? "#6B8F71" : pct >= 10 ? "#C8963E" : "#C4717A";
    default:
      return "#A89C8E";
  }
}

export default function MoneyRatios({
  ratios,
  annualIncome,
  annualFees,
  annualCaptured,
  annualSubBurn,
  annualSavings,
}: MoneyRatiosProps) {
  return (
    <div className="space-y-3">
      <div className="font-display text-xs tracking-wide text-text-muted">
        YOUR MONEY RATIOS
      </div>
      <div className="grid grid-cols-2 gap-3">
        <RatioCard
          label="Card Fees"
          pct={ratios.feesOverIncome}
          numerator={annualFees}
          denominator={annualIncome}
          verdict={getRatioVerdict("fees", ratios.feesOverIncome)}
          color={getColor("fees", ratios.feesOverIncome)}
        />
        <RatioCard
          label="Value Captured"
          pct={ratios.capturedOverIncome}
          numerator={annualCaptured}
          denominator={annualIncome}
          verdict={getRatioVerdict("captured", ratios.capturedOverIncome)}
          color={getColor("captured", ratios.capturedOverIncome)}
        />
        <RatioCard
          label="Subscriptions"
          pct={ratios.subsOverIncome}
          numerator={annualSubBurn}
          denominator={annualIncome}
          verdict={getRatioVerdict("subscriptions", ratios.subsOverIncome)}
          color={getColor("subscriptions", ratios.subsOverIncome)}
        />
        <RatioCard
          label="Savings Rate"
          pct={ratios.savingsOverIncome}
          numerator={annualSavings}
          denominator={annualIncome}
          verdict={getRatioVerdict("savings", ratios.savingsOverIncome)}
          color={getColor("savings", ratios.savingsOverIncome)}
        />
      </div>
    </div>
  );
}

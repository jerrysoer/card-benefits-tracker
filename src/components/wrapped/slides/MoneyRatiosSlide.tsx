"use client";

import type { MonthlyWrappedData } from "@/lib/wrapped/queries";
import { useCountUp } from "../useCountUp";

interface MoneyRatiosSlideProps {
  data: MonthlyWrappedData;
  accentColor: string;
  animate: boolean;
}

export default function MoneyRatiosSlide({
  data,
  accentColor,
  animate,
}: MoneyRatiosSlideProps) {
  const score = useCountUp(data.financialScore ?? 0, animate);
  const ratios = data.moneyRatios;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 text-center">
      <h2
        className="font-display text-sm tracking-widest"
        style={{ color: accentColor }}
      >
        YOUR MONEY RATIOS
      </h2>

      {/* Financial Score */}
      <div
        className="animate-wrapped-enter"
        style={{ animationDelay: "100ms" }}
      >
        <p className="text-xs uppercase tracking-wide text-text-muted">
          Financial Score
        </p>
        <p
          className="font-mono-data text-5xl font-bold"
          style={{ color: data.financialScoreColor ?? "#39FF14" }}
        >
          {score}
        </p>
        <p
          className="font-display text-xs tracking-widest"
          style={{ color: data.financialScoreColor ?? "#39FF14" }}
        >
          {data.financialScoreLabel ?? ""}
        </p>
      </div>

      {/* Ratios */}
      {ratios && (
        <div
          className="animate-wrapped-enter grid grid-cols-2 gap-4"
          style={{ animationDelay: "200ms" }}
        >
          <div>
            <p className="font-mono-data text-lg font-bold text-text-primary">
              {ratios.feesOverIncome.toFixed(1)}%
            </p>
            <p className="text-xs text-text-muted">Card fees</p>
          </div>
          <div>
            <p className="font-mono-data text-lg font-bold text-text-primary">
              {ratios.subsOverIncome.toFixed(1)}%
            </p>
            <p className="text-xs text-text-muted">Subscriptions</p>
          </div>
          <div>
            <p className="font-mono-data text-lg font-bold text-text-primary">
              {ratios.savingsOverIncome.toFixed(1)}%
            </p>
            <p className="text-xs text-text-muted">Savings rate</p>
          </div>
          <div>
            <p className="font-mono-data text-lg font-bold text-text-primary">
              {ratios.capturedOverIncome.toFixed(1)}%
            </p>
            <p className="text-xs text-text-muted">Value captured</p>
          </div>
        </div>
      )}
    </div>
  );
}

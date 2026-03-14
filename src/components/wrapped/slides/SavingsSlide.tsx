"use client";

import type { MonthlyWrappedData } from "@/lib/wrapped/queries";
import { useCountUp } from "../useCountUp";

interface SavingsSlideProps {
  data: MonthlyWrappedData;
  accentColor: string;
  animate: boolean;
}

export default function SavingsSlide({
  data,
  accentColor,
  animate,
}: SavingsSlideProps) {
  const savings = data.savingsThisMonth ?? 0;
  const displaySavings = useCountUp(Math.abs(savings), animate);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 text-center">
      <h2
        className="font-display text-sm tracking-widest"
        style={{ color: accentColor }}
      >
        SAVINGS THIS MONTH
      </h2>

      <div
        className="animate-wrapped-enter"
        style={{ animationDelay: "100ms" }}
      >
        <p
          className="font-mono-data text-5xl font-bold"
          style={{ color: savings >= 0 ? "#34D399" : "#F87171" }}
        >
          {savings < 0 ? "-" : ""}${displaySavings.toLocaleString()}
        </p>
      </div>

      <div
        className="animate-wrapped-enter"
        style={{ animationDelay: "200ms" }}
      >
        <p className="text-sm text-text-secondary">
          {savings >= 2000
            ? "Serious savings month. Keep it up."
            : savings >= 1000
              ? "Solid month. Consistency beats intensity."
              : savings > 0
                ? "Every dollar counts. You showed up."
                : "Tough month. The goal is the average, not the streak."}
        </p>
      </div>
    </div>
  );
}

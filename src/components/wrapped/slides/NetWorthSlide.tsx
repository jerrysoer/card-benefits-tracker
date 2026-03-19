"use client";

import type { MonthlyWrappedData } from "@/lib/wrapped/queries";
import { useCountUp } from "../useCountUp";

interface NetWorthSlideProps {
  data: MonthlyWrappedData;
  accentColor: string;
  animate: boolean;
}

export default function NetWorthSlide({
  data,
  accentColor,
  animate,
}: NetWorthSlideProps) {
  const nw = data.netWorth ?? 0;
  const delta = data.netWorthDelta ?? 0;
  const displayNW = useCountUp(Math.abs(nw), animate);
  const isNegative = nw < 0;
  const color = isNegative ? "#C4717A" : "#6B8F71";
  const deltaColor = delta >= 0 ? "#6B8F71" : "#C4717A";

  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 text-center">
      <h2
        className="font-display text-sm tracking-widest"
        style={{ color: accentColor }}
      >
        YOUR NET WORTH
      </h2>

      <div
        className="animate-wrapped-enter"
        style={{ animationDelay: "100ms" }}
      >
        <p className="font-mono-data text-5xl font-bold" style={{ color }}>
          {isNegative ? "-" : ""}${displayNW.toLocaleString()}
        </p>
      </div>

      {delta !== 0 && (
        <div
          className="animate-wrapped-enter"
          style={{ animationDelay: "200ms" }}
        >
          <p className="font-mono-data text-2xl font-bold" style={{ color: deltaColor }}>
            {delta >= 0 ? "▲" : "▼"} {delta >= 0 ? "+" : ""}$
            {Math.abs(delta).toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-text-muted">this month</p>
        </div>
      )}

      {nw < 0 && (
        <div
          className="animate-wrapped-enter"
          style={{ animationDelay: "300ms" }}
        >
          <p className="text-sm text-text-secondary">
            Focus on the trajectory. Every step toward zero counts.
          </p>
        </div>
      )}
    </div>
  );
}

"use client";

import type { YearInReviewData } from "@/lib/wrapped/queries";
import { useCountUp } from "../useCountUp";

interface YearNetWorthSlideProps {
  data: YearInReviewData;
  accentColor: string;
  animate: boolean;
}

export default function YearNetWorthSlide({
  data,
  accentColor,
  animate,
}: YearNetWorthSlideProps) {
  const start = data.netWorthStart ?? 0;
  const end = data.netWorthEnd ?? 0;
  const delta = data.netWorthDelta ?? 0;
  const displayEnd = useCountUp(Math.abs(end), animate);
  const isNegative = end < 0;
  const deltaColor = delta >= 0 ? "#6B8F71" : "#C4717A";
  const pctChange = start !== 0 ? Math.round((delta / Math.abs(start)) * 100) : 0;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 text-center">
      <h2
        className="font-display text-sm tracking-widest"
        style={{ color: accentColor }}
      >
        NET WORTH JOURNEY
      </h2>

      <div className="animate-wrapped-enter" style={{ animationDelay: "100ms" }}>
        <p className="text-sm text-text-muted">JAN</p>
        <p className="font-mono-data text-2xl font-bold text-text-secondary">
          ${start.toLocaleString()}
        </p>
      </div>

      <div className="animate-wrapped-enter text-2xl text-text-muted" style={{ animationDelay: "150ms" }}>
        →
      </div>

      <div className="animate-wrapped-enter" style={{ animationDelay: "200ms" }}>
        <p className="text-sm text-text-muted">DEC</p>
        <p
          className="font-mono-data text-4xl font-bold"
          style={{ color: isNegative ? "#C4717A" : "#6B8F71" }}
        >
          {isNegative ? "-" : ""}${displayEnd.toLocaleString()}
        </p>
      </div>

      <div className="animate-wrapped-enter" style={{ animationDelay: "300ms" }}>
        <p className="font-mono-data text-xl font-bold" style={{ color: deltaColor }}>
          {delta >= 0 ? "▲" : "▼"} {delta >= 0 ? "+" : ""}$
          {Math.abs(delta).toLocaleString()}
          {pctChange !== 0 && ` (${pctChange > 0 ? "+" : ""}${pctChange}%)`}
        </p>
      </div>
    </div>
  );
}

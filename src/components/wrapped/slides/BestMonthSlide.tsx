"use client";

import type { YearInReviewData } from "@/lib/wrapped/queries";
import { useCountUp } from "../useCountUp";

interface BestMonthSlideProps {
  data: YearInReviewData;
  accentColor: string;
  animate: boolean;
}

export default function BestMonthSlide({
  data,
  accentColor,
  animate,
}: BestMonthSlideProps) {
  const captured = useCountUp(data.bestMonth.captured, animate);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
      <h2
        className="font-display text-sm tracking-widest"
        style={{ color: accentColor }}
      >
        YOUR BEST MONTH
      </h2>

      <div
        className="animate-wrapped-enter"
        style={{ animationDelay: "100ms" }}
      >
        <p className="font-display text-3xl" style={{ color: accentColor }}>
          {data.bestMonth.monthLabel}
        </p>
      </div>

      <div
        className="animate-wrapped-enter flex gap-8"
        style={{ animationDelay: "200ms" }}
      >
        <div>
          <p className="font-mono-data text-3xl font-bold text-green">
            {data.bestMonth.captureRate}%
          </p>
          <p className="text-xs text-text-muted">capture rate</p>
        </div>
        <div>
          <p className="font-mono-data text-3xl font-bold text-text-primary">
            ${captured.toLocaleString()}
          </p>
          <p className="text-xs text-text-muted">captured</p>
        </div>
      </div>

      <div
        className="animate-wrapped-enter"
        style={{ animationDelay: "300ms" }}
      >
        <p className="font-mono-data text-lg text-text-secondary">
          Wallet Score: {data.bestMonth.walletScore}
          <span className="ml-1 text-sm" style={{ color: accentColor }}>
            (your peak)
          </span>
        </p>
      </div>

      {data.bestMonth.highlight && (
        <div
          className="animate-wrapped-enter"
          style={{ animationDelay: "400ms" }}
        >
          <p className="max-w-xs text-sm italic text-text-secondary">
            &ldquo;{data.bestMonth.highlight}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}

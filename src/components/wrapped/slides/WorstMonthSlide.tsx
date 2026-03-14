"use client";

import type { YearInReviewData } from "@/lib/wrapped/queries";

interface WorstMonthSlideProps {
  data: YearInReviewData;
  accentColor: string;
  animate: boolean;
}

export default function WorstMonthSlide({
  data,
  accentColor,
  animate,
}: WorstMonthSlideProps) {
  void animate;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
      <h2
        className="font-display text-sm tracking-widest"
        style={{ color: accentColor }}
      >
        YOUR WORST MONTH
      </h2>

      <div
        className="animate-wrapped-enter"
        style={{ animationDelay: "100ms" }}
      >
        <p className="font-display text-3xl text-text-primary">
          {data.worstMonth.monthLabel}
        </p>
      </div>

      <div
        className="animate-wrapped-enter flex gap-8"
        style={{ animationDelay: "200ms" }}
      >
        <div>
          <p className="font-mono-data text-3xl font-bold text-red">
            {data.worstMonth.captureRate}%
          </p>
          <p className="text-xs text-text-muted">capture rate</p>
        </div>
        <div>
          <p className="font-mono-data text-3xl font-bold text-text-secondary">
            ${data.worstMonth.captured.toLocaleString()}
          </p>
          <p className="text-xs text-text-muted">captured</p>
        </div>
      </div>

      {data.worstMonth.wasted > 0 && (
        <div
          className="animate-wrapped-enter"
          style={{ animationDelay: "300ms" }}
        >
          <p className="font-mono-data text-lg text-red">
            You let ${data.worstMonth.wasted.toLocaleString()} expire unused
          </p>
        </div>
      )}

      <div
        className="animate-wrapped-enter"
        style={{ animationDelay: "400ms" }}
      >
        <p className="max-w-xs text-sm italic text-text-secondary">
          &ldquo;{data.worstMonth.verdict}&rdquo;
        </p>
      </div>
    </div>
  );
}

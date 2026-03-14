"use client";

import type { YearInReviewData } from "@/lib/wrapped/queries";
import { useCountUp } from "../useCountUp";

interface YearAtGlanceSlideProps {
  data: YearInReviewData;
  accentColor: string;
  animate: boolean;
}

export default function YearAtGlanceSlide({
  data,
  accentColor,
  animate,
}: YearAtGlanceSlideProps) {
  const captured = useCountUp(data.totalCaptured, animate);
  const wasted = useCountUp(data.totalWasted, animate);
  const netRoi = useCountUp(data.netRoi, animate);

  const netPositive = data.netRoi >= 0;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
      <h2
        className="font-display text-sm tracking-widest"
        style={{ color: accentColor }}
      >
        YOUR YEAR AT A GLANCE
      </h2>

      <div
        className="animate-wrapped-enter font-display text-4xl"
        style={{ animationDelay: "0ms", color: accentColor }}
      >
        {data.year}{data.isPartialYear ? " SO FAR" : ""}
      </div>

      <div
        className="animate-wrapped-enter"
        style={{ animationDelay: "100ms" }}
      >
        <p className="font-mono-data text-5xl font-bold text-text-primary">
          ${captured.toLocaleString()}
        </p>
        <p className="mt-1 text-sm text-text-secondary">captured</p>
      </div>

      <div
        className="animate-wrapped-enter flex gap-8"
        style={{ animationDelay: "200ms" }}
      >
        <div>
          <p className="font-mono-data text-xl font-bold text-text-secondary">
            ${wasted.toLocaleString()}
          </p>
          <p className="text-xs text-text-muted">wasted</p>
        </div>
        <div>
          <p className="font-mono-data text-xl font-bold text-text-secondary">
            {data.averageCaptureRate}%
          </p>
          <p className="text-xs text-text-muted">avg capture rate</p>
        </div>
      </div>

      <div
        className="animate-wrapped-enter"
        style={{ animationDelay: "300ms" }}
      >
        <p className="text-sm text-text-muted">
          on ${data.totalFees.toLocaleString()} in annual fees
        </p>
      </div>

      <div
        className="animate-wrapped-enter"
        style={{ animationDelay: "400ms" }}
      >
        <p
          className="font-mono-data text-2xl font-bold"
          style={{ color: netPositive ? "#34D399" : "#F87171" }}
        >
          NET: {netPositive ? "+" : ""}${netRoi.toLocaleString()}
        </p>
        <p className="mt-1 text-sm text-text-secondary">
          {netPositive
            ? "your cards made you money"
            : "your cards cost more than they earned"}
        </p>
      </div>
    </div>
  );
}

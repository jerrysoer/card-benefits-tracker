"use client";

import type { MonthlyWrappedData } from "@/lib/wrapped/queries";
import { useCountUp } from "../useCountUp";

interface NumbersSlideProps {
  data: MonthlyWrappedData;
  accentColor: string;
  animate: boolean;
}

export default function NumbersSlide({
  data,
  accentColor,
  animate,
}: NumbersSlideProps) {
  const captured = useCountUp(data.benefitsCapturedValue, animate);
  const wasted = useCountUp(data.benefitsWastedValue, animate);
  const rate = useCountUp(data.captureRate, animate);

  const rateImproved = data.captureRateDelta >= 0;
  const rateColor = rateImproved ? "#6B8F71" : "#C4717A";

  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 text-center">
      <h2
        className="font-display text-sm tracking-widest"
        style={{ color: accentColor }}
      >
        YOUR MONTH IN NUMBERS
      </h2>

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
        className="animate-wrapped-enter"
        style={{ animationDelay: "200ms" }}
      >
        <p className="font-mono-data text-2xl font-bold text-text-secondary">
          ${wasted.toLocaleString()}
        </p>
        <p className="mt-1 text-sm text-text-muted">wasted</p>
      </div>

      <div
        className="animate-wrapped-enter"
        style={{ animationDelay: "300ms" }}
      >
        <p className="font-mono-data text-3xl font-bold" style={{ color: rateColor }}>
          {rate}% capture rate
        </p>
        {!data.isFirstMonth && data.captureRateDelta !== 0 && (
          <p className="mt-1 text-sm" style={{ color: rateColor }}>
            {rateImproved ? "▲" : "▼"} {rateImproved ? "+" : ""}
            {Math.round(data.captureRateDelta)}% vs last month
          </p>
        )}
        {data.isFirstMonth && (
          <p className="mt-1 text-sm text-text-muted">
            Your first month on CardClock!
          </p>
        )}
      </div>
    </div>
  );
}

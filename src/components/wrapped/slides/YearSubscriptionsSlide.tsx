"use client";

import type { YearInReviewData } from "@/lib/wrapped/queries";
import { useCountUp } from "../useCountUp";

interface YearSubscriptionsSlideProps {
  data: YearInReviewData;
  accentColor: string;
  animate: boolean;
}

export default function YearSubscriptionsSlide({
  data,
  accentColor,
  animate,
}: YearSubscriptionsSlideProps) {
  const avgBurn = data.averageSubscriptionBurn ?? 0;
  const displayBurn = useCountUp(Math.round(avgBurn), animate);
  const annualTotal = Math.round(avgBurn * 12);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 text-center">
      <h2
        className="font-display text-sm tracking-widest"
        style={{ color: accentColor }}
      >
        SUBSCRIPTIONS IN {data.year}
      </h2>

      <div className="animate-wrapped-enter" style={{ animationDelay: "100ms" }}>
        <p className="font-mono-data text-4xl font-bold text-text-primary">
          ${displayBurn}/mo
        </p>
        <p className="mt-1 text-sm text-text-muted">average monthly burn</p>
      </div>

      <div className="animate-wrapped-enter" style={{ animationDelay: "200ms" }}>
        <p className="font-mono-data text-2xl font-bold text-text-secondary">
          ${annualTotal.toLocaleString()}/yr
        </p>
        <p className="mt-1 text-sm text-text-muted">total subscription spend</p>
      </div>
    </div>
  );
}

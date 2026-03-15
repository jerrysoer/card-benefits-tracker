"use client";

import type { MonthlyWrappedData } from "@/lib/wrapped/queries";
import { useCountUp } from "../useCountUp";

interface SubscriptionSlideProps {
  data: MonthlyWrappedData;
  accentColor: string;
  animate: boolean;
}

export default function SubscriptionSlide({
  data,
  accentColor,
  animate,
}: SubscriptionSlideProps) {
  const burn = useCountUp(data.subscriptionMonthlyBurn ?? 0, animate);
  const count = data.subscriptionCount ?? 0;
  const unusedCount = data.unusedSubscriptionCount ?? 0;
  const usedCount = count - unusedCount;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 text-center">
      <h2
        className="font-display text-sm tracking-widest"
        style={{ color: accentColor }}
      >
        YOUR SUBSCRIPTIONS
      </h2>

      <div
        className="animate-wrapped-enter"
        style={{ animationDelay: "100ms" }}
      >
        <p className="font-mono-data text-2xl font-bold text-text-primary">
          {count} SUBSCRIPTIONS
        </p>
        <p className="mt-1 font-mono-data text-4xl font-bold text-text-primary">
          ${burn}/MO
        </p>
      </div>

      <div
        className="animate-wrapped-enter"
        style={{ animationDelay: "200ms" }}
      >
        <div className="flex items-center justify-center gap-6">
          <div>
            <p className="font-mono-data text-xl font-bold text-[#6B8F71]">
              {usedCount}
            </p>
            <p className="text-xs text-text-muted">Used</p>
          </div>
          <div>
            <p className="font-mono-data text-xl font-bold text-[#C4717A]">
              {unusedCount}
            </p>
            <p className="text-xs text-text-muted">Unused</p>
          </div>
        </div>
      </div>

      {data.topUnusedSub && (
        <div
          className="animate-wrapped-enter rounded-lg bg-[#C4717A]/10 px-4 py-3"
          style={{ animationDelay: "300ms" }}
        >
          <p className="text-sm text-[#C4717A]">
            {data.topUnusedSub.name}: ${data.topUnusedSub.cost}/mo unused
          </p>
        </div>
      )}
    </div>
  );
}

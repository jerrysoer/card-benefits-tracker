"use client";

import type { MonthlyWrappedData } from "@/lib/wrapped/queries";
import { useCountUp } from "../useCountUp";

interface BiggestMissSlideProps {
  data: MonthlyWrappedData;
  accentColor: string;
  animate: boolean;
}

export default function BiggestMissSlide({
  data,
  accentColor,
  animate,
}: BiggestMissSlideProps) {
  const monthWasted = useCountUp(data.totalWastedMonth, animate);
  const yearWasted = useCountUp(data.totalWastedYear, animate);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
      <h2
        className="font-display text-sm tracking-widest"
        style={{ color: accentColor }}
      >
        YOU LEFT MONEY ON THE TABLE
      </h2>

      <div
        className="animate-wrapped-enter w-full max-w-sm"
        style={{ animationDelay: "100ms" }}
      >
        {data.biggestMisses.slice(0, 4).map((miss, i) => (
          <div
            key={i}
            className="flex items-center justify-between border-b border-border py-3"
          >
            <div className="text-left">
              <p className="text-sm font-medium text-text-primary">
                {miss.benefit}
              </p>
              <p className="text-xs text-text-muted">{miss.card}</p>
            </div>
            <span className="font-mono-data text-sm font-bold text-red">
              -${miss.value}
            </span>
          </div>
        ))}
      </div>

      <div
        className="animate-wrapped-enter space-y-1"
        style={{ animationDelay: "300ms" }}
      >
        <p className="font-mono-data text-lg text-red">
          Total wasted this month:{" "}
          <span className="font-bold">${monthWasted}</span>
        </p>
        <p className="font-mono-data text-sm text-text-muted">
          Total wasted this year:{" "}
          <span className="font-bold text-text-secondary">${yearWasted}</span>
        </p>
      </div>
    </div>
  );
}

"use client";

import type { MonthlyWrappedData } from "@/lib/wrapped/queries";
import { useCountUp } from "../useCountUp";

interface BestCardSlideProps {
  data: MonthlyWrappedData;
  accentColor: string;
  animate: boolean;
}

export default function BestCardSlide({
  data,
  accentColor,
  animate,
}: BestCardSlideProps) {
  const captured = useCountUp(data.bestCard.captured, animate);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
      <h2
        className="font-display text-sm tracking-widest"
        style={{ color: accentColor }}
      >
        YOUR BEST CARD
      </h2>

      <div
        className="animate-wrapped-enter"
        style={{ animationDelay: "100ms" }}
      >
        <p className="text-xs uppercase text-text-muted">MVP</p>
        <p className="mt-1 font-display text-2xl text-text-primary">
          {data.bestCard.name}
        </p>
      </div>

      <div
        className="animate-wrapped-enter"
        style={{ animationDelay: "200ms" }}
      >
        <div
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl border-2"
          style={{ borderColor: "#34D399" }}
        >
          <span className="font-mono-data text-2xl font-bold text-green">
            {data.bestCard.grade}
          </span>
        </div>
        {data.bestCard.gradeChange && (
          <p className="mt-2 text-sm text-green">
            ▲ {data.bestCard.gradeChange}
          </p>
        )}
      </div>

      <div
        className="animate-wrapped-enter"
        style={{ animationDelay: "300ms" }}
      >
        <p className="font-mono-data text-3xl font-bold text-text-primary">
          ${captured.toLocaleString()}
        </p>
        <p className="text-sm text-text-secondary">captured this month</p>
      </div>

      <div
        className="animate-wrapped-enter"
        style={{ animationDelay: "400ms" }}
      >
        <p className="max-w-xs text-sm italic text-text-secondary">
          &ldquo;{data.bestCard.verdict}&rdquo;
        </p>
      </div>
    </div>
  );
}

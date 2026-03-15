"use client";

import type { MonthlyWrappedData } from "@/lib/wrapped/queries";

interface WorstCardSlideProps {
  data: MonthlyWrappedData;
  accentColor: string;
  animate: boolean;
}

export default function WorstCardSlide({
  data,
  accentColor,
  animate,
}: WorstCardSlideProps) {
  void animate;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
      <h2
        className="font-display text-sm tracking-widest"
        style={{ color: accentColor }}
      >
        NEEDS WORK
      </h2>

      <div
        className="animate-wrapped-enter"
        style={{ animationDelay: "100ms" }}
      >
        <p className="font-display text-2xl text-text-primary">
          {data.worstCard.name}
        </p>
      </div>

      <div
        className="animate-wrapped-enter"
        style={{ animationDelay: "200ms" }}
      >
        <div
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl border-2"
          style={{ borderColor: "#C4717A" }}
        >
          <span className="font-mono-data text-2xl font-bold text-red">
            {data.worstCard.grade}
          </span>
        </div>
        {data.worstCard.gradeChange && (
          <p className="mt-2 text-sm text-text-muted">
            {data.worstCard.gradeChange}
          </p>
        )}
      </div>

      <div
        className="animate-wrapped-enter"
        style={{ animationDelay: "300ms" }}
      >
        <p className="font-mono-data text-xl font-bold text-text-secondary">
          ${data.worstCard.captured.toLocaleString()} captured
        </p>
        {data.worstCard.wasted > 0 && (
          <p className="mt-1 font-mono-data text-lg text-red">
            ${data.worstCard.wasted.toLocaleString()} wasted
          </p>
        )}
      </div>

      <div
        className="animate-wrapped-enter"
        style={{ animationDelay: "400ms" }}
      >
        <p className="max-w-xs text-sm italic text-text-secondary">
          &ldquo;{data.worstCard.verdict}&rdquo;
        </p>
      </div>
    </div>
  );
}

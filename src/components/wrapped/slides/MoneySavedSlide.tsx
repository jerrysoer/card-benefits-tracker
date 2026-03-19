"use client";

import type { YearInReviewData } from "@/lib/wrapped/queries";
import { useCountUp } from "../useCountUp";

interface MoneySavedSlideProps {
  data: YearInReviewData;
  accentColor: string;
  animate: boolean;
}

export default function MoneySavedSlide({
  data,
  accentColor,
  animate,
}: MoneySavedSlideProps) {
  const totalSaved = useCountUp(data.totalSaved, animate);
  const netValue = useCountUp(Math.abs(data.netValue), animate);

  const netPositive = data.netValue >= 0;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
      <h2
        className="font-display text-sm tracking-widest"
        style={{ color: accentColor }}
      >
        THE MONEY YOU SAVED (AND WASTED)
      </h2>

      <div
        className="animate-wrapped-enter w-full max-w-xs space-y-3"
        style={{ animationDelay: "100ms" }}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-muted">Benefits captured</span>
          <span className="font-mono-data text-sm font-bold text-green">
            +${data.totalCaptured.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-muted">Points redeemed</span>
          <span className="font-mono-data text-sm font-bold text-green">
            +${data.totalPointsRedeemedValue.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-2">
          <span className="text-sm font-medium text-text-primary">
            TOTAL SAVED
          </span>
          <span className="font-mono-data text-lg font-bold text-green">
            ${totalSaved.toLocaleString()}
          </span>
        </div>
      </div>

      <div
        className="animate-wrapped-enter w-full max-w-xs space-y-3"
        style={{ animationDelay: "200ms" }}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-muted">Expired benefits</span>
          <span className="font-mono-data text-sm font-bold text-red">
            -${data.totalWastedBenefits.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-muted">Annual fees</span>
          <span className="font-mono-data text-sm font-bold text-text-secondary">
            -${data.totalFeePaid.toLocaleString()}
          </span>
        </div>
      </div>

      <div
        className="animate-wrapped-enter"
        style={{ animationDelay: "300ms" }}
      >
        <p className="text-xs uppercase text-text-muted">NET</p>
        <p
          className="mt-1 font-mono-data text-4xl font-bold"
          style={{ color: netPositive ? "#6B8F71" : "#C4717A" }}
        >
          {netPositive ? "+" : "-"}${netValue.toLocaleString()}
        </p>
      </div>

      <div
        className="animate-wrapped-enter"
        style={{ animationDelay: "400ms" }}
      >
        <p className="max-w-sm text-sm italic text-text-secondary">
          &ldquo;{data.heroVerdict}&rdquo;
        </p>
      </div>

      {data.isMidYear && data.projectedCaptured && (
        <div
          className="animate-wrapped-enter w-full max-w-xs rounded-lg border border-border p-4"
          style={{ animationDelay: "500ms" }}
        >
          <p className="text-xs uppercase" style={{ color: accentColor }}>
            AT YOUR CURRENT PACE
          </p>
          <p className="mt-2 font-mono-data text-sm text-text-primary">
            ${data.totalCaptured.toLocaleString()} captured → projected{" "}
            <span className="font-bold">
              ${data.projectedCaptured.toLocaleString()}
            </span>{" "}
            by Dec
          </p>
        </div>
      )}
    </div>
  );
}

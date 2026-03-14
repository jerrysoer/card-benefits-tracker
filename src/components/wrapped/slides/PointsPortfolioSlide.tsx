"use client";

import type { YearInReviewData } from "@/lib/wrapped/queries";
import { useCountUp } from "../useCountUp";

interface PointsPortfolioSlideProps {
  data: YearInReviewData;
  accentColor: string;
  animate: boolean;
}

export default function PointsPortfolioSlide({
  data,
  accentColor,
  animate,
}: PointsPortfolioSlideProps) {
  const earned = useCountUp(data.totalPointsEarned, animate);
  const redeemed = useCountUp(data.totalPointsRedeemed, animate);
  const balance = useCountUp(data.currentPointsBalance, animate);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
      <h2
        className="font-display text-sm tracking-widest"
        style={{ color: accentColor }}
      >
        POINTS PORTFOLIO
      </h2>

      <div className="flex gap-6">
        <div
          className="animate-wrapped-enter"
          style={{ animationDelay: "100ms" }}
        >
          <p className="font-mono-data text-2xl font-bold text-text-primary">
            {earned.toLocaleString()}
          </p>
          <p className="text-xs text-text-muted">POINTS EARNED</p>
        </div>
        <div
          className="animate-wrapped-enter"
          style={{ animationDelay: "200ms" }}
        >
          <p className="font-mono-data text-2xl font-bold text-green">
            {redeemed.toLocaleString()}
          </p>
          <p className="text-xs text-text-muted">
            REDEEMED (${data.totalPointsRedeemedValue.toLocaleString()})
          </p>
        </div>
      </div>

      <div
        className="animate-wrapped-enter"
        style={{ animationDelay: "300ms" }}
      >
        <p className="text-xs uppercase text-text-muted">Points Balance</p>
        <p className="mt-1 font-mono-data text-3xl font-bold text-text-primary">
          {balance.toLocaleString()}
        </p>
        <p className="text-sm" style={{ color: accentColor }}>
          ${data.currentPointsValue.toLocaleString()} value
        </p>
      </div>

      {data.bestRedemption && (
        <div
          className="animate-wrapped-enter w-full max-w-xs rounded-lg border border-border p-4"
          style={{ animationDelay: "400ms" }}
        >
          <p className="text-xs uppercase text-text-muted">Best Redemption</p>
          <p className="mt-1 font-mono-data text-sm text-text-primary">
            {data.bestRedemption.amount.toLocaleString()}{" "}
            {data.bestRedemption.program} pts
          </p>
          <p className="font-mono-data text-lg font-bold text-green">
            ${data.bestRedemption.value.toLocaleString()} value
          </p>
          <p className="text-xs text-text-secondary">
            {data.bestRedemption.cppAchieved.toFixed(1)}\u00A2/pt
          </p>
        </div>
      )}
    </div>
  );
}

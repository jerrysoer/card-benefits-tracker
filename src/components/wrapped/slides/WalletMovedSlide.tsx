"use client";

import type { MonthlyWrappedData } from "@/lib/wrapped/queries";
import { useCountUp } from "../useCountUp";

interface WalletMovedSlideProps {
  data: MonthlyWrappedData;
  accentColor: string;
  animate: boolean;
}

export default function WalletMovedSlide({
  data,
  accentColor,
  animate,
}: WalletMovedSlideProps) {
  const endValue = useCountUp(data.walletValueEnd, animate);
  const deltaColor = data.walletDelta >= 0 ? "#6B8F71" : "#C4717A";

  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 text-center">
      <h2
        className="font-display text-sm tracking-widest"
        style={{ color: accentColor }}
      >
        YOUR WALLET MOVED
      </h2>

      <div
        className="animate-wrapped-enter"
        style={{ animationDelay: "100ms" }}
      >
        <p className="text-sm uppercase text-text-muted">Wallet Value</p>
        <div className="mt-2 flex items-center justify-center gap-3">
          <span className="font-mono-data text-xl text-text-secondary">
            ${data.walletValueStart.toLocaleString()}
          </span>
          <span className="text-text-muted">→</span>
          <span className="font-mono-data text-3xl font-bold text-text-primary">
            ${endValue.toLocaleString()}
          </span>
        </div>
        {!data.isFirstMonth && (
          <p
            className="mt-2 font-mono-data text-lg font-bold"
            style={{ color: deltaColor }}
          >
            {data.walletDelta >= 0 ? "▲" : "▼"}{" "}
            {data.walletDelta >= 0 ? "+" : ""}${Math.abs(data.walletDelta).toLocaleString()} this month
          </p>
        )}
      </div>

      {data.pointsEarned.length > 0 && (
        <div
          className="animate-wrapped-enter w-full max-w-xs"
          style={{ animationDelay: "200ms" }}
        >
          <p className="mb-2 text-xs uppercase text-text-muted">
            Points Earned
          </p>
          {data.pointsEarned.map((pe, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-1 text-sm"
            >
              <span className="text-text-secondary">{pe.program}</span>
              <span className="font-mono-data text-text-primary">
                +{pe.amount.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}

      {data.pointsRedeemed.length > 0 && (
        <div
          className="animate-wrapped-enter w-full max-w-xs"
          style={{ animationDelay: "300ms" }}
        >
          <p className="mb-2 text-xs uppercase text-text-muted">
            Points Redeemed
          </p>
          {data.pointsRedeemed.map((pr, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-1 text-sm"
            >
              <span className="text-text-secondary">
                {pr.amount.toLocaleString()} {pr.program}
              </span>
              <span className="font-mono-data text-green">
                ${pr.value.toLocaleString()} value
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import type { YearInReviewData } from "@/lib/wrapped/queries";
import Sparkline from "../Sparkline";

interface WalletJourneySlideProps {
  data: YearInReviewData;
  accentColor: string;
  animate: boolean;
}

export default function WalletJourneySlide({
  data,
  accentColor,
  animate,
}: WalletJourneySlideProps) {
  void animate;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
      <h2
        className="font-display text-sm tracking-widest"
        style={{ color: accentColor }}
      >
        YOUR WALLET JOURNEY
      </h2>

      <div
        className="animate-wrapped-enter"
        style={{ animationDelay: "100ms" }}
      >
        <Sparkline
          data={data.walletValueByMonth}
          labels={data.monthLabels}
          highlightMax
          color={accentColor}
          width={360}
          height={200}
        />
      </div>

      <div
        className="animate-wrapped-enter flex gap-8"
        style={{ animationDelay: "300ms" }}
      >
        <div>
          <p className="text-xs uppercase text-text-muted">Peak</p>
          <p className="font-mono-data text-lg font-bold text-text-primary">
            {data.peakMonth.month}
          </p>
          <p className="font-mono-data text-sm" style={{ color: accentColor }}>
            ${data.peakMonth.value.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase text-text-muted">Trough</p>
          <p className="font-mono-data text-lg font-bold text-text-primary">
            {data.troughMonth.month}
          </p>
          <p className="font-mono-data text-sm text-text-secondary">
            ${data.troughMonth.value.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

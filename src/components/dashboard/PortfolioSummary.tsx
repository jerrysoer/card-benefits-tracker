"use client";

import type { PortfolioSummary as PortfolioSummaryType } from "@/lib/supabase/types";
import { formatCurrency } from "@/lib/benefits/roi";

interface PortfolioSummaryProps {
  summary: PortfolioSummaryType;
}

export default function PortfolioSummary({ summary }: PortfolioSummaryProps) {
  const roiColor = summary.netROI >= 0 ? "text-green" : "text-red";

  return (
    <div className="rounded-2xl bg-bg-card p-6 shadow-card">
      <div className="text-center">
        <span className="font-outfit text-6xl font-black tracking-tight text-text-primary md:text-7xl">
          {formatCurrency(summary.totalCaptured)}
        </span>
        <p className="mt-1 text-sm text-text-muted">saved this period</p>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <span className="rounded-full bg-bg-elevated px-3 py-1 text-xs font-medium text-text-secondary">
          {summary.totalCards} Cards
        </span>
        <span className="rounded-full bg-bg-elevated px-3 py-1 text-xs font-medium text-text-secondary">
          {formatCurrency(summary.totalAnnualFees)} Fees
        </span>
        <span className={`rounded-full bg-bg-elevated px-3 py-1 text-xs font-medium ${roiColor}`}>
          {(summary.netROI >= 0 ? "+" : "") + formatCurrency(summary.netROI)} ROI
        </span>
      </div>
    </div>
  );
}

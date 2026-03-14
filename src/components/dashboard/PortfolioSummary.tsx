"use client";

import type { PortfolioSummary as PortfolioSummaryType } from "@/lib/supabase/types";
import { formatCurrency } from "@/lib/benefits/roi";

interface PortfolioSummaryProps {
  summary: PortfolioSummaryType;
}

export default function PortfolioSummary({ summary }: PortfolioSummaryProps) {
  const roiColor = summary.netROI >= 0 ? "text-[#10B981]" : "text-[#EF4444]";

  return (
    <div className="rounded-2xl bg-white p-6 shadow-card">
      <div className="text-center">
        <span className="font-outfit text-6xl font-black tracking-tight text-[#111] md:text-7xl">
          {formatCurrency(summary.totalCaptured)}
        </span>
        <p className="mt-1 text-sm text-[#9CA3AF]">saved this period</p>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <span className="rounded-full bg-[#F3F4F6] px-3 py-1 text-xs font-medium text-[#6B7280]">
          {summary.totalCards} Cards
        </span>
        <span className="rounded-full bg-[#F3F4F6] px-3 py-1 text-xs font-medium text-[#6B7280]">
          {formatCurrency(summary.totalAnnualFees)} Fees
        </span>
        <span className={`rounded-full bg-[#F3F4F6] px-3 py-1 text-xs font-medium ${roiColor}`}>
          {(summary.netROI >= 0 ? "+" : "") + formatCurrency(summary.netROI)} ROI
        </span>
      </div>
    </div>
  );
}

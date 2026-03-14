"use client";

import type { PortfolioSummary as PortfolioSummaryType } from "@/lib/supabase/types";
import { formatCurrency } from "@/lib/benefits/roi";
import { cn } from "@/lib/utils";

interface PortfolioSummaryProps {
  summary: PortfolioSummaryType;
}

interface StatCardProps {
  label: string;
  value: string;
  colorClass?: string;
}

function StatCard({ label, value, colorClass }: StatCardProps) {
  return (
    <div className="flex flex-col gap-1 px-4 py-3">
      <span className="text-xs uppercase tracking-wide text-text-secondary">
        {label}
      </span>
      <span
        className={cn("font-mono-data text-lg font-semibold sm:text-xl", colorClass ?? "text-text-primary")}
      >
        {value}
      </span>
    </div>
  );
}

export default function PortfolioSummary({ summary }: PortfolioSummaryProps) {
  const roiColor = summary.netROI >= 0 ? "text-[#34D399]" : "text-[#F87171]";

  return (
    <div className="grid grid-cols-2 gap-px rounded-lg border border-border bg-border sm:grid-cols-5 sm:gap-0 sm:bg-bg-card sm:divide-x sm:divide-border">
      <div className="bg-bg-card rounded-tl-lg sm:rounded-none">
        <StatCard label="Total Cards" value={String(summary.totalCards)} />
      </div>
      <div className="bg-bg-card rounded-tr-lg sm:rounded-none">
        <StatCard label="Annual Fees" value={formatCurrency(summary.totalAnnualFees)} />
      </div>
      <div className="bg-bg-card">
        <StatCard label="Benefits Available" value={formatCurrency(summary.totalBenefitValue)} />
      </div>
      <div className="bg-bg-card">
        <StatCard label="Value Captured" value={formatCurrency(summary.totalCaptured)} />
      </div>
      <div className="bg-bg-card col-span-2 rounded-b-lg sm:col-span-1 sm:rounded-none">
        <StatCard
          label="Net ROI"
          value={(summary.netROI >= 0 ? "+" : "") + formatCurrency(summary.netROI)}
          colorClass={roiColor}
        />
      </div>
    </div>
  );
}

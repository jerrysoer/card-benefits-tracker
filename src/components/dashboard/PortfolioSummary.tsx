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
        className={cn("font-mono-data text-xl font-semibold", colorClass ?? "text-text-primary")}
      >
        {value}
      </span>
    </div>
  );
}

export default function PortfolioSummary({ summary }: PortfolioSummaryProps) {
  const roiColor = summary.netROI >= 0 ? "text-[#34D399]" : "text-[#F87171]";

  return (
    <div className="flex flex-wrap items-stretch divide-x divide-border rounded-lg border border-border bg-bg-card">
      <StatCard label="Total Cards" value={String(summary.totalCards)} />
      <StatCard
        label="Annual Fees"
        value={formatCurrency(summary.totalAnnualFees)}
      />
      <StatCard
        label="Benefits Available"
        value={formatCurrency(summary.totalBenefitValue)}
      />
      <StatCard
        label="Value Captured"
        value={formatCurrency(summary.totalCaptured)}
      />
      <StatCard
        label="Net ROI"
        value={(summary.netROI >= 0 ? "+" : "") + formatCurrency(summary.netROI)}
        colorClass={roiColor}
      />
    </div>
  );
}

"use client";

import { useCountUp } from "@/components/wrapped/useCountUp";

interface NetWorthHeroProps {
  netWorth: number;
  delta: number | null;
  lastUpdateDate: string | null;
}

function formatDelta(val: number): string {
  const prefix = val >= 0 ? "+" : "";
  return `${prefix}$${Math.abs(val).toLocaleString()}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function NetWorthHero({
  netWorth,
  delta,
  lastUpdateDate,
}: NetWorthHeroProps) {
  const displayValue = useCountUp(Math.abs(netWorth), true, 800);
  const isNegative = netWorth < 0;
  const color = isNegative ? "#C4717A" : "#6B8F71";

  return (
    <div className="text-center">
      <div className="mb-1 font-display text-xs tracking-widest text-text-muted">
        YOUR NET WORTH
      </div>
      <div
        className="font-mono-data text-5xl font-bold"
        style={{ color }}
      >
        {isNegative ? "-" : ""}${displayValue.toLocaleString()}
      </div>
      {delta !== null && lastUpdateDate && (
        <div className="mt-1 text-sm text-text-secondary">
          <span style={{ color: delta >= 0 ? "#6B8F71" : "#C4717A" }}>
            {delta >= 0 ? "▲" : "▼"} {formatDelta(delta)}
          </span>{" "}
          <span className="text-text-muted">
            since last update ({formatDate(lastUpdateDate)})
          </span>
        </div>
      )}
    </div>
  );
}

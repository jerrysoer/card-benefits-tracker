"use client";

import { useState } from "react";
import { useCountUp } from "@/components/wrapped/useCountUp";
import type { FinancialScoreResult } from "@/lib/fullwallet/types";
import { getFinancialScoreVerdict } from "@/lib/fullwallet/verdicts";

interface FinancialScoreProps {
  score: FinancialScoreResult;
}

export default function FinancialScore({ score }: FinancialScoreProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const displayScore = useCountUp(score.total, true, 800);

  // SVG gauge params
  const size = 120;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score.total / 100) * circumference;

  return (
    <div className="space-y-3 rounded-lg border border-border bg-bg-card p-4">
      <div className="font-display text-xs tracking-wide text-text-muted">
        FINANCIAL SCORE
      </div>

      {/* Gauge */}
      <div className="flex flex-col items-center gap-2">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            {/* Background ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#E5E7EB"
              strokeWidth={strokeWidth}
            />
            {/* Progress ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={score.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
              className="transition-all duration-700 ease-out"
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="font-mono-data text-3xl font-bold"
              style={{ color: score.color }}
            >
              {displayScore}
            </span>
          </div>
        </div>
        <div
          className="font-display text-xs tracking-widest"
          style={{ color: score.color }}
        >
          {score.label}
        </div>
        <p className="text-center text-xs text-text-secondary">
          {getFinancialScoreVerdict(score.total)}
        </p>
      </div>

      {/* Breakdown toggle */}
      <button
        onClick={() => setShowBreakdown(!showBreakdown)}
        className="w-full text-center text-xs text-text-muted hover:text-text-secondary"
      >
        {showBreakdown ? "Hide breakdown ▲" : "Show breakdown ▼"}
      </button>

      {/* Breakdown */}
      {showBreakdown && (
        <div className="space-y-2 border-t border-border pt-3">
          {score.breakdown.map((comp) => (
            <div key={comp.id}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-text-muted">
                  {comp.name}{" "}
                  <span className="text-text-muted">
                    ({Math.round(comp.weight * 100)}%)
                  </span>
                </span>
                <span className="font-mono-data text-text-primary">
                  {Math.round(comp.raw)}/100
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${comp.raw}%`,
                    backgroundColor: score.color,
                  }}
                />
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-border pt-2 text-xs">
            <span className="font-medium text-text-muted">WEIGHTED TOTAL</span>
            <span className="font-mono-data font-bold text-text-primary">
              {score.total}/100
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

import type { CardROI } from "@/lib/supabase/types";
import { formatCurrency } from "@/lib/benefits/roi";

interface ROIGaugeProps {
  roi: CardROI;
}

export default function ROIGauge({ roi }: ROIGaugeProps) {
  const size = 120;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const progress =
    roi.annualFee > 0
      ? Math.min(1, roi.totalCaptured / roi.annualFee)
      : roi.totalCaptured > 0
        ? 1
        : 0;
  const strokeDashoffset = circumference * (1 - progress);
  const center = size / 2;

  const isProfitable = roi.totalCaptured >= roi.annualFee;
  const color = isProfitable ? "#C8963E" : "#2A7C6F";

  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-label={`${formatCurrency(roi.totalCaptured)} captured of ${formatCurrency(roi.annualFee)} annual fee`}
      >
        {/* Background ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={strokeWidth}
        />
        {/* Progress ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
          className="transition-all duration-700 ease-out"
        />
        {/* Center dollar amount */}
        <text
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--color-text-primary)"
          fontSize={20}
          fontFamily="JetBrains Mono, monospace"
          fontWeight={700}
        >
          {formatCurrency(roi.totalCaptured)}
        </text>
      </svg>
      <span className="text-xs text-text-secondary">
        of {formatCurrency(roi.annualFee)} annual fee
      </span>
    </div>
  );
}

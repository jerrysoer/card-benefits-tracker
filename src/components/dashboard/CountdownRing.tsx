import type { UrgencyState } from "@/lib/supabase/types";
import { getUrgencyColor } from "@/lib/benefits/urgency";

interface CountdownRingProps {
  daysRemaining: number;
  totalDays: number;
  urgency: UrgencyState | "used";
  size?: number;
}

export default function CountdownRing({
  daysRemaining,
  totalDays,
  urgency,
  size = 24,
}: CountdownRingProps) {
  const strokeWidth = 2.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = totalDays > 0 ? Math.max(0, Math.min(1, daysRemaining / totalDays)) : 0;
  const strokeDashoffset = circumference * (1 - progress);
  const center = size / 2;
  const color = getUrgencyColor(urgency);
  const showNumber = size >= 40;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="shrink-0"
      aria-label={`${daysRemaining} of ${totalDays} days remaining`}
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
        className="transition-all duration-500 ease-out"
      />
      {/* Center number */}
      {showNumber && (
        <text
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="central"
          fill={color}
          fontSize={size * 0.3}
          fontFamily="JetBrains Mono, monospace"
          fontWeight={600}
        >
          {daysRemaining}
        </text>
      )}
    </svg>
  );
}

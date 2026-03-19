"use client";

interface SparklineProps {
  data: number[];
  labels?: string[];
  highlightMax?: boolean;
  color: string;
  width: number;
  height: number;
}

export default function Sparkline({
  data,
  labels,
  highlightMax = false,
  color,
  width,
  height,
}: SparklineProps) {
  if (data.length === 0) return null;

  const padding = { top: 16, right: 16, bottom: labels ? 28 : 8, left: 16 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // Map data to SVG coordinates
  const points = data.map((value, i) => {
    const x = padding.left + (i / Math.max(data.length - 1, 1)) * chartWidth;
    const y = padding.top + chartHeight - ((value - min) / range) * chartHeight;
    return { x, y, value };
  });

  const maxIndex = data.indexOf(max);
  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  // Gradient fill area
  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;

  const gradientId = `sparkline-gradient-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* Fill area */}
      <path d={areaD} fill={`url(#${gradientId})`} />

      {/* Line */}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Data points */}
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={highlightMax && i === maxIndex ? 5 : 3}
          fill={highlightMax && i === maxIndex ? color : "#F5EDE0"}
          stroke={color}
          strokeWidth={highlightMax && i === maxIndex ? 2 : 1.5}
        />
      ))}

      {/* Labels */}
      {labels &&
        points.map((p, i) => (
          <text
            key={`label-${i}`}
            x={p.x}
            y={height - 4}
            textAnchor="middle"
            fill="#A89C8E"
            fontSize={10}
            fontFamily="'JetBrains Mono', monospace"
          >
            {labels[i] || ""}
          </text>
        ))}

      {/* Peak annotation */}
      {highlightMax && (
        <text
          x={points[maxIndex].x}
          y={points[maxIndex].y - 12}
          textAnchor="middle"
          fill={color}
          fontSize={11}
          fontWeight={700}
          fontFamily="'JetBrains Mono', monospace"
        >
          ${(max / 1000).toFixed(1)}K
        </text>
      )}
    </svg>
  );
}

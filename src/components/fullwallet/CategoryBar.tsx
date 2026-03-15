"use client";

const CATEGORY_COLORS: Record<string, string> = {
  streaming: "#7A3B42",
  fitness: "#C4717A",
  food: "#C8963E",
  software: "#2A7C6F",
  news: "#6B8F71",
  shopping: "#D4983B",
  finance: "#2A7C6F",
  other: "#A89C8E",
};

interface CategoryBarProps {
  breakdown: Record<string, number>;
}

export default function CategoryBar({ breakdown }: CategoryBarProps) {
  const entries = Object.entries(breakdown).sort(([, a], [, b]) => b - a);
  const total = entries.reduce((sum, [, val]) => sum + val, 0);

  if (total === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex h-4 w-full overflow-hidden rounded-full">
        {entries.map(([category, value]) => {
          const pct = (value / total) * 100;
          return (
            <div
              key={category}
              style={{
                width: `${pct}%`,
                backgroundColor: CATEGORY_COLORS[category] || CATEGORY_COLORS.other,
                minWidth: pct > 0 ? "4px" : "0",
              }}
              title={`${category}: $${value.toFixed(0)}/mo`}
            />
          );
        })}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {entries.map(([category, value]) => (
          <div key={category} className="flex items-center gap-1.5 text-xs">
            <div
              className="h-2 w-2 rounded-full"
              style={{
                backgroundColor: CATEGORY_COLORS[category] || CATEGORY_COLORS.other,
              }}
            />
            <span className="text-text-muted">
              {category.charAt(0).toUpperCase() + category.slice(1)}:
            </span>
            <span className="font-mono-data text-text-secondary">
              ${value.toFixed(0)}/mo
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

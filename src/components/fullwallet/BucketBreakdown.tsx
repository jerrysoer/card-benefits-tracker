"use client";

interface BucketBreakdownProps {
  cash: number;
  investments: number;
  pointsValue: number;
  debt: number;
}

const BUCKETS = [
  { key: "cash", label: "Cash & Savings", color: "#34D399" },
  { key: "investments", label: "Investments", color: "#60A5FA" },
  { key: "pointsValue", label: "Points Portfolio", color: "#22D3EE" },
  { key: "debt", label: "Debt", color: "#F87171" },
] as const;

export default function BucketBreakdown({
  cash,
  investments,
  pointsValue,
  debt,
}: BucketBreakdownProps) {
  const values: Record<string, number> = {
    cash,
    investments,
    pointsValue,
    debt,
  };
  const maxValue = Math.max(cash, investments, pointsValue, debt, 1);

  return (
    <div className="space-y-3">
      {BUCKETS.map((bucket) => {
        const val = values[bucket.key];
        const pct = (val / maxValue) * 100;
        const isDebt = bucket.key === "debt";

        return (
          <div key={bucket.key}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-text-muted">
                {bucket.label}
                {bucket.key === "pointsValue" && (
                  <span className="ml-1 text-[10px] text-text-muted">
                    (auto)
                  </span>
                )}
              </span>
              <span
                className="font-mono-data font-medium"
                style={{ color: bucket.color }}
              >
                {isDebt && val > 0 ? "-" : ""}$
                {val.toLocaleString()}
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-[#252525]">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${Math.max(pct, val > 0 ? 2 : 0)}%`,
                  backgroundColor: bucket.color,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

"use client";

import type { Subscription } from "@/lib/fullwallet/types";

interface SubscriptionRowProps {
  subscription: Subscription;
  onToggleUsed: (id: string) => void;
  onEdit: (sub: Subscription) => void;
  onDelete: (id: string) => void;
  index: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  streaming: "#BF5AF2",
  fitness: "#FF6B6B",
  food: "#FBBF24",
  software: "#60A5FA",
  news: "#34D399",
  shopping: "#FF9F43",
  finance: "#39FF14",
  other: "#8B95A8",
};

export default function SubscriptionRow({
  subscription,
  onToggleUsed,
  onEdit,
  onDelete,
  index,
}: SubscriptionRowProps) {
  const { id, name, monthlyCost, annualCost, category, usedThisMonth } =
    subscription;
  const catColor = CATEGORY_COLORS[category] || CATEGORY_COLORS.other;

  return (
    <div
      className="animate-slide-up flex items-center gap-4 rounded-lg border bg-bg-card px-4 py-3 transition-colors"
      style={{
        borderColor: usedThisMonth ? "var(--color-border)" : "#F87171",
        borderLeftWidth: usedThisMonth ? "1px" : "3px",
        animationDelay: `${index * 50}ms`,
      }}
    >
      {/* Used toggle */}
      <button
        onClick={() => onToggleUsed(id)}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
        style={{
          borderColor: usedThisMonth ? "#34D399" : "#F87171",
          backgroundColor: usedThisMonth ? "#34D399/15" : "transparent",
        }}
        title={usedThisMonth ? "Used this month" : "Not used this month"}
      >
        {usedThisMonth ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        )}
      </button>

      {/* Name + Category */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-text-primary">
            {name}
          </span>
          <span
            className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider"
            style={{
              backgroundColor: `${catColor}15`,
              color: catColor,
            }}
          >
            {category}
          </span>
        </div>
      </div>

      {/* Cost */}
      <div className="shrink-0 text-right">
        <div className="font-mono-data text-sm font-bold text-text-primary">
          ${monthlyCost.toFixed(2)}
          <span className="text-text-muted">/mo</span>
        </div>
        <div className="font-mono-data text-xs text-text-muted">
          ${annualCost.toFixed(0)}/yr
        </div>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1">
        <button
          onClick={() => onEdit(subscription)}
          className="rounded p-1 text-text-muted transition-colors hover:text-text-secondary"
          title="Edit"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(id)}
          className="rounded p-1 text-text-muted transition-colors hover:text-[#F87171]"
          title="Delete"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  BADGE_DEFINITIONS,
  TIER_COLORS,
  type BadgeState,
  type BadgeDefinition,
} from "@/lib/badges";

interface BadgeShelfProps {
  badgeState: BadgeState;
  newlyUnlocked: BadgeDefinition[];
}

export default function BadgeShelf({ badgeState, newlyUnlocked }: BadgeShelfProps) {
  const [tooltip, setTooltip] = useState<string | null>(null);
  const unlockedCount = Object.keys(badgeState).length;
  const newIds = new Set(newlyUnlocked.map((b) => b.id));

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-sm text-text-secondary">BADGES</h2>
        <span className="font-mono-data text-xs font-bold text-text-muted">
          {unlockedCount}/{BADGE_DEFINITIONS.length}
        </span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {BADGE_DEFINITIONS.map((badge) => {
          const isUnlocked = !!badgeState[badge.id];
          const isNew = newIds.has(badge.id);
          const tierColor = TIER_COLORS[badge.tier];
          const unlockDate = isUnlocked
            ? new Date(badgeState[badge.id].unlockedAt).toLocaleDateString()
            : null;

          return (
            <div
              key={badge.id}
              className="relative flex-shrink-0"
              onMouseEnter={() => setTooltip(badge.id)}
              onMouseLeave={() => setTooltip(null)}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-lg transition-all ${
                  isUnlocked
                    ? isNew
                      ? "animate-badge-unlock"
                      : ""
                    : "grayscale opacity-40"
                }`}
                style={{
                  borderColor: isUnlocked ? tierColor.border : "#525C6E",
                  borderStyle: isUnlocked ? "solid" : "dashed",
                  backgroundColor: isUnlocked ? tierColor.bg : "transparent",
                  boxShadow: isUnlocked
                    ? `0 0 8px ${tierColor.border}40`
                    : "none",
                }}
              >
                {isUnlocked ? badge.icon : "?"}
              </div>

              {/* Tooltip */}
              {tooltip === badge.id && (
                <div className="absolute -top-20 left-1/2 z-50 w-48 -translate-x-1/2 rounded-lg border border-[#E5E7EB] bg-white p-3 shadow-lg">
                  <div className="text-xs font-bold text-text-primary">
                    {badge.icon} {badge.name}
                  </div>
                  <p className="mt-1 text-xs text-text-secondary">
                    {isUnlocked ? badge.description : badge.hint}
                  </p>
                  {unlockDate && (
                    <p className="mt-1 text-xs text-text-muted">
                      Unlocked {unlockDate}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

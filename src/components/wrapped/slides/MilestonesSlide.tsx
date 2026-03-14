"use client";

import type { MonthlyWrappedData } from "@/lib/wrapped/queries";

interface MilestonesSlideProps {
  data: MonthlyWrappedData;
  accentColor: string;
  animate: boolean;
}

export default function MilestonesSlide({
  data,
  accentColor,
  animate,
}: MilestonesSlideProps) {
  void animate;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 text-center">
      <h2
        className="font-display text-sm tracking-widest"
        style={{ color: accentColor }}
      >
        MILESTONES
      </h2>

      {data.streakCount > 0 && (
        <div
          className="animate-wrapped-enter"
          style={{ animationDelay: "100ms" }}
        >
          <p className="text-4xl">
            {"🔥".repeat(Math.min(data.streakCount, 5))}
          </p>
          <p className="mt-2 font-mono-data text-xl font-bold text-text-primary">
            {data.streakCount} month{data.streakCount !== 1 ? "s" : ""} and counting
          </p>
          <p className="text-sm text-text-muted">streak</p>
        </div>
      )}

      {data.badgesUnlocked.length > 0 && (
        <div
          className="animate-wrapped-enter"
          style={{ animationDelay: "200ms" }}
        >
          <p className="mb-2 text-xs uppercase text-text-muted">
            Badges Unlocked: {data.badgesUnlocked.length}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {data.badgesUnlocked.map((badge) => (
              <div key={badge.id} className="text-center">
                <span className="text-2xl">{badge.icon}</span>
                <p className="mt-1 text-xs text-text-secondary">{badge.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.challengesCompleted > 0 && (
        <div
          className="animate-wrapped-enter"
          style={{ animationDelay: "300ms" }}
        >
          <p className="font-mono-data text-lg text-text-primary">
            Challenges:{" "}
            <span className="font-bold text-green">
              {data.challengesCompleted}/{data.challengesTotal}
            </span>{" "}
            completed
          </p>
        </div>
      )}
    </div>
  );
}

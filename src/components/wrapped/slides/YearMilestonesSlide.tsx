"use client";

import type { YearInReviewData } from "@/lib/wrapped/queries";

interface YearMilestonesSlideProps {
  data: YearInReviewData;
  accentColor: string;
  animate: boolean;
}

export default function YearMilestonesSlide({
  data,
  accentColor,
  animate,
}: YearMilestonesSlideProps) {
  void animate;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
      <h2
        className="font-display text-sm tracking-widest"
        style={{ color: accentColor }}
      >
        MILESTONES &amp; STREAKS
      </h2>

      {data.badgesUnlocked.length > 0 && (
        <div
          className="animate-wrapped-enter"
          style={{ animationDelay: "100ms" }}
        >
          <p className="text-xs uppercase text-text-muted">
            Badges Unlocked: {data.badgesUnlocked.length}
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            {data.badgesUnlocked.map((badge) => (
              <span key={badge.id} className="text-2xl" title={badge.name}>
                {badge.icon}
              </span>
            ))}
          </div>
        </div>
      )}

      {data.longestStreak > 0 && (
        <div
          className="animate-wrapped-enter"
          style={{ animationDelay: "200ms" }}
        >
          <p className="text-xs uppercase text-text-muted">Longest Streak</p>
          <p className="mt-1 font-mono-data text-3xl font-bold text-text-primary">
            {"🔥"} {data.longestStreak} month{data.longestStreak !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      {data.totalChallengesCompleted > 0 && (
        <div
          className="animate-wrapped-enter"
          style={{ animationDelay: "300ms" }}
        >
          <p className="text-xs uppercase text-text-muted">
            Challenges Completed
          </p>
          <p className="mt-1 font-mono-data text-2xl font-bold text-green">
            {data.totalChallengesCompleted}/{data.totalChallengesAvailable}
          </p>
        </div>
      )}

      {data.totalRoasts > 0 && (
        <div
          className="animate-wrapped-enter"
          style={{ animationDelay: "400ms" }}
        >
          <p className="font-mono-data text-lg text-text-secondary">
            {"🔥"} Roasts Survived: {data.totalRoasts}
          </p>
        </div>
      )}
    </div>
  );
}

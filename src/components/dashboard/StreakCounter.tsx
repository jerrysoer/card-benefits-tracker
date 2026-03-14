"use client";

import { useState, useEffect } from "react";
import type { BenefitWithCard, BenefitUsage } from "@/lib/supabase/types";
import { getStreak, setStreak } from "@/lib/local-storage";
import { formatCurrency } from "@/lib/benefits/roi";

interface StreakCounterProps {
  benefits: BenefitWithCard[];
  usage: BenefitUsage[];
}

function getFireEmojis(streak: number): string {
  if (streak >= 6) return "\uD83D\uDD25\uD83D\uDD25\uD83D\uDD25";
  if (streak >= 3) return "\uD83D\uDD25\uD83D\uDD25";
  if (streak >= 1) return "\uD83D\uDD25";
  return "";
}

function getMilestoneMessage(streak: number, savedAmount?: number): string | null {
  if (streak === 1) return "you used your monthly perks. nice start.";
  if (streak === 3) return "3 months straight. you're building a habit. \uD83D\uDD25";
  if (streak === 6) return "half a year of not wasting money. that's rare.";
  if (streak === 12) {
    const saved = savedAmount ? ` you've saved ${formatCurrency(savedAmount)} by not being lazy.` : "";
    return `a full year.${saved} \uD83D\uDC51`;
  }
  return null;
}

export default function StreakCounter({ benefits, usage }: StreakCounterProps) {
  const [streakCount, setStreakCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const streak = getStreak();

    if (streak.last_checked === currentMonth) {
      setStreakCount(streak.current);
      setMounted(true);
      return;
    }

    // Check previous month
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;
    const prevMonthStart = prevDate.toISOString().split("T")[0];
    const prevMonthEnd = new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 0)
      .toISOString()
      .split("T")[0];

    const monthlyBenefits = benefits.filter(
      (b) => b.cc_benefit_period === "monthly"
    );

    if (monthlyBenefits.length === 0) {
      setStreak({ current: streak.current, last_checked: currentMonth });
      setStreakCount(streak.current);
      setMounted(true);
      return;
    }

    const usedCount = monthlyBenefits.filter((b) =>
      usage.some(
        (u) =>
          u.cc_benefit_id === b.id &&
          u.cc_is_fully_used &&
          u.cc_period_start >= prevMonthStart &&
          u.cc_period_start <= prevMonthEnd
      )
    ).length;

    const ratio = usedCount / monthlyBenefits.length;
    const newStreak = ratio >= 0.8 ? streak.current + 1 : 0;

    setStreak({ current: newStreak, last_checked: currentMonth });
    setStreakCount(newStreak);
    setMounted(true);
  }, [benefits, usage]);

  if (!mounted) return null;

  const milestone = getMilestoneMessage(streakCount);
  const fires = getFireEmojis(streakCount);

  if (streakCount === 0) {
    return (
      <div className="rounded-lg border-2 border-[#2A3040] bg-bg-card-neo px-5 py-4">
        <span className="text-sm text-text-muted">
          No streak yet. Use your monthly benefits to start one.
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 rounded-lg border-2 border-[#2A3040] bg-bg-card-neo px-5 py-4">
      <span className="text-2xl">{fires}</span>
      <div>
        <span className="animate-streak-pulse inline-block font-mono-data text-2xl font-bold text-neon-green">
          {streakCount}
        </span>
        <span className="ml-2 text-sm text-text-secondary">
          month{streakCount !== 1 ? "s" : ""} streak
        </span>
        {milestone && (
          <p className="mt-1 text-sm text-text-secondary">{milestone}</p>
        )}
      </div>
    </div>
  );
}

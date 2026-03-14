"use client";

import { useState, useEffect } from "react";
import { Flame, Crown } from "lucide-react";
import type { BenefitWithCard, BenefitUsage } from "@/lib/supabase/types";
import { getStreak, setStreak } from "@/lib/storage";
import { formatCurrency } from "@/lib/benefits/roi";

interface StreakCounterProps {
  benefits: BenefitWithCard[];
  usage: BenefitUsage[];
}

function getFlameCount(streak: number): number {
  if (streak >= 6) return 3;
  if (streak >= 3) return 2;
  if (streak >= 1) return 1;
  return 0;
}

function getMilestoneMessage(streak: number, savedAmount?: number): string | null {
  if (streak === 1) return "you used your monthly perks. nice start.";
  if (streak === 3) return "3 months straight. you're building a habit.";
  if (streak === 6) return "half a year of not wasting money. that's rare.";
  if (streak === 12) {
    const saved = savedAmount ? ` you've saved ${formatCurrency(savedAmount)} by not being lazy.` : "";
    return `a full year.${saved}`;
  }
  return null;
}

export default function StreakCounter({ benefits, usage }: StreakCounterProps) {
  const [streakCount, setStreakCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    getStreak().then((streak) => {
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

      if (streak.last_checked === currentMonth) {
        setStreakCount(streak.current);
        setMounted(true);
        return;
      }

      // Check previous month
      const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
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
    });
  }, [benefits, usage]);

  if (!mounted) return null;

  const milestone = getMilestoneMessage(streakCount);
  const flameCount = getFlameCount(streakCount);

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
      <span className="flex gap-0.5 text-neon-red">
        {Array.from({ length: flameCount }).map((_, i) => (
          <Flame key={i} className="h-6 w-6" />
        ))}
      </span>
      <div>
        <span className="animate-streak-pulse inline-block font-mono-data text-2xl font-bold text-neon-green">
          {streakCount}
        </span>
        <span className="ml-2 text-sm text-text-secondary">
          month{streakCount !== 1 ? "s" : ""} streak
        </span>
        {milestone && (
          <p className="mt-1 flex items-center gap-1 text-sm text-text-secondary">
            {milestone}
            {streakCount >= 12 && <Crown className="inline h-4 w-4 text-neon-gold" />}
          </p>
        )}
      </div>
    </div>
  );
}

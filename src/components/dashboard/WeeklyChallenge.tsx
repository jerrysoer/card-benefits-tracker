"use client";

import { useState, useEffect } from "react";
import type { BenefitWithCard } from "@/lib/supabase/types";
import {
  generateChallenge,
  completeChallenge,
  getChallengeState,
  type Challenge,
} from "@/lib/challenges";
import { formatCurrency } from "@/lib/benefits/roi";

interface WeeklyChallengeProps {
  benefits: BenefitWithCard[];
  onBenefitUsed: (benefitId: string) => void;
}

export default function WeeklyChallenge({
  benefits,
  onBenefitUsed,
}: WeeklyChallengeProps) {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [completedThisMonth, setCompletedThisMonth] = useState(0);
  const [totalThisMonth, setTotalThisMonth] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  useEffect(() => {
    async function init() {
      const ch = await generateChallenge(benefits);
      const state = await getChallengeState();
      setChallenge(ch);
      setCompletedThisMonth(state.completedThisMonth);
      setTotalThisMonth(state.totalThisMonth);
      setMounted(true);
    }
    if (benefits.length > 0) init();
  }, [benefits]);

  if (!mounted) return null;

  const handleComplete = async () => {
    if (!challenge || challenge.completedAt) return;
    const success = await completeChallenge();
    if (success) {
      onBenefitUsed(challenge.benefitId);
      setJustCompleted(true);
      const state = await getChallengeState();
      setChallenge(state.current);
      setCompletedThisMonth(state.completedThisMonth);
      setTimeout(() => setJustCompleted(false), 2000);
    }
  };

  const isActive = challenge && !challenge.completedAt;
  const isCompleted = challenge?.completedAt !== null && challenge?.completedAt !== undefined;

  return (
    <div
      className="rounded-lg p-4 shadow-card"
      style={{
        border: isActive
          ? "2px solid #6B8F71"
          : isCompleted
            ? "2px solid #6B8F71"
            : "1px solid var(--border)",
        backgroundColor: "var(--bg-card)",
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-xs text-text-secondary">
            WEEKLY CHALLENGE
          </h3>
          {isActive && (
            <div className="animate-challenge-pulse h-2 w-2 rounded-full bg-green" />
          )}
        </div>
        {totalThisMonth > 0 && (
          <span className="font-mono-data text-xs text-text-muted">
            {completedThisMonth}/{totalThisMonth} this month
          </span>
        )}
      </div>

      {challenge ? (
        <div className="mt-3">
          <p className="text-sm text-text-primary">{challenge.description}</p>
          <div className="mt-2 flex items-center gap-2 text-xs text-text-muted">
            <span>{challenge.cardName}</span>
            <span>&middot;</span>
            <span className="font-mono-data font-bold text-text-primary">
              {formatCurrency(challenge.benefitValue)}
            </span>
          </div>

          {isActive && (
            <button
              onClick={handleComplete}
              className="mt-3 rounded-full bg-accent px-4 py-2 text-xs font-bold text-white transition-opacity hover:opacity-80"
            >
              MARK COMPLETE
            </button>
          )}

          {justCompleted && (
            <div className="mt-2 text-xs font-bold text-green">
              ✅ challenge complete! +2 wallet score boost
            </div>
          )}

          {isCompleted && !justCompleted && (
            <div className="mt-2 text-xs text-green">
              ✅ completed
            </div>
          )}
        </div>
      ) : (
        <p className="mt-3 text-sm text-text-muted">
          no urgent challenges. you&apos;re on top of it. 💪
        </p>
      )}
    </div>
  );
}

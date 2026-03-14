"use client";

import { useState, useEffect, useCallback } from "react";
import { isDemoMode, DEMO_USER_CARDS, DEMO_CARDS, DEMO_BENEFITS, DEMO_USAGE } from "@/lib/demo/data";
import type { BenefitWithCard, BenefitUsage, CardROI, UserCard, Card, Benefit } from "@/lib/supabase/types";
import { getCurrentPeriod } from "@/lib/benefits/deadline";
import { getUrgencyState } from "@/lib/benefits/urgency";
import { calculateCardROI } from "@/lib/benefits/roi";
import { calculateWalletScore, calculateDiversityScore } from "@/lib/scoring";
import { calculatePointsValue, calculateWalletValue, loadPointsPrograms } from "@/lib/points";
import { getPointsBalances, getCustomValuations, getPersistedUsage, getStreak } from "@/lib/storage";
import FlexCardModal from "@/components/dashboard/FlexCardModal";
import {
  getSubscriptions,
  getLatestNetWorth,
  getSavingsEntries,
} from "@/lib/fullwallet/storage";
import {
  calculateSubscriptionStats,
  calculateAverageMonthlySavings,
} from "@/lib/fullwallet/calculations";
import { computeFinancialScore } from "@/lib/fullwallet/score";
import type { FinancialScoreResult } from "@/lib/fullwallet/types";
import FullWalletFlexCard from "@/components/fullwallet/FullWalletFlexCard";

export default function FlexPage() {
  const [cardROIs, setCardROIs] = useState<CardROI[]>([]);
  const [benefits, setBenefits] = useState<BenefitWithCard[]>([]);
  const [walletScore, setWalletScore] = useState(0);
  const [walletValue, setWalletValue] = useState(0);
  const [streak, setStreakCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [variant, setVariant] = useState<"wallet" | "fullwallet">("wallet");
  const [financialScore, setFinancialScore] = useState<FinancialScoreResult | null>(null);
  const [netWorth, setNetWorth] = useState<number | null>(null);
  const [subBurn, setSubBurn] = useState(0);
  const [avgSavings, setAvgSavings] = useState(0);

  useEffect(() => {
    if (!isDemoMode()) return;

    async function loadData() {
      const persistedUsage = await getPersistedUsage();
      const currentUsage = persistedUsage ?? [...DEMO_USAGE];
      const now = new Date();
      const userCards = DEMO_USER_CARDS;
      const cards = DEMO_CARDS;
      const allBenefits = DEMO_BENEFITS;
      const cardMap = new Map(cards.map((c: Card) => [c.id, c]));

      const enriched: BenefitWithCard[] = [];
      const rois: CardROI[] = [];

      for (const uc of userCards) {
        const card = cardMap.get(uc.cc_card_id);
        if (!card) continue;
        const cardBenefits = allBenefits.filter((b: Benefit) => b.cc_card_id === card.id);
        const cardUsage = currentUsage.filter((u: BenefitUsage) => u.cc_user_card_id === uc.id);
        const openDate = uc.cc_card_open_date ? new Date(uc.cc_card_open_date) : null;

        for (const benefit of cardBenefits) {
          const period = getCurrentPeriod(benefit, openDate, now);
          const usage = currentUsage.find(
            (u: BenefitUsage) => u.cc_benefit_id === benefit.id && u.cc_period_start === period.start.toISOString().split("T")[0]
          );
          enriched.push({
            ...benefit, card, userCard: uc, usage: usage ?? null,
            period: { start: period.start, end: period.end, daysRemaining: period.daysRemaining },
            urgency: getUrgencyState(period.daysRemaining),
          });
        }
        rois.push(calculateCardROI(card, uc, cardBenefits, cardUsage));
      }

      setCardROIs(rois);
      setBenefits(enriched);

      // Calculate wallet value
      const programs = loadPointsPrograms();
      const balances = await getPointsBalances();
      const valuations = await getCustomValuations();
      const pointsVal = calculatePointsValue(balances, valuations, programs);
      const unusedBenefits = enriched.filter((b) => !b.usage?.cc_is_fully_used).reduce((sum, b) => sum + b.cc_annual_total, 0);
      const totalFees = rois.reduce((sum, r) => sum + r.annualFee, 0);
      const wv = calculateWalletValue(pointsVal, unusedBenefits, totalFees);
      setWalletValue(wv);

      // Wallet score
      const totalCaptured = rois.reduce((sum, r) => sum + r.totalCaptured, 0);
      const totalBenefitValue = rois.reduce((sum, r) => sum + r.totalBenefitValue, 0);
      const captureRate = totalBenefitValue > 0 ? (totalCaptured / totalBenefitValue) * 100 : 0;
      const feeROI = totalFees > 0 ? (totalCaptured / totalFees) * 100 : 0;
      const diversity = calculateDiversityScore(rois.map((r) => r.card));
      const streakData = await getStreak();
      setStreakCount(streakData.current);

      const score = calculateWalletScore(captureRate, feeROI, diversity, streakData.current);
      setWalletScore(score);

      // Load Full Wallet data
      const [subs, nwSnapshot, savingsEntries] = await Promise.all([
        getSubscriptions(),
        getLatestNetWorth(),
        getSavingsEntries(),
      ]);
      const subStats = calculateSubscriptionStats(subs);
      const avgMonthlySavings = calculateAverageMonthlySavings(savingsEntries);
      setSubBurn(subStats.monthlyTotal);
      setAvgSavings(avgMonthlySavings);
      setNetWorth(nwSnapshot?.netWorth ?? null);

      const fs = computeFinancialScore(score, {
        usedSubCount: subStats.usedCount,
        totalSubCount: subStats.count,
        netWorthSnapshots: undefined, // Skip for flex card simplicity
      });
      setFinancialScore(fs);

      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-text-secondary">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Variant Toggle */}
      <div className="mb-4 flex items-center justify-center gap-2">
        <button
          onClick={() => setVariant("wallet")}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            variant === "wallet"
              ? "bg-bg-elevated text-neon-purple"
              : "text-text-muted hover:text-text-secondary"
          }`}
        >
          Wallet
        </button>
        <button
          onClick={() => setVariant("fullwallet")}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            variant === "fullwallet"
              ? "bg-bg-elevated"
              : "text-text-muted hover:text-text-secondary"
          }`}
          style={variant === "fullwallet" ? { color: "#39FF14" } : undefined}
        >
          Full Wallet
        </button>
      </div>

      {variant === "wallet" ? (
        <FlexCardModal
          isOpen={true}
          onClose={() => window.history.back()}
          walletScore={walletScore}
          cardROIs={cardROIs}
          streak={streak}
          walletValue={walletValue}
        />
      ) : financialScore ? (
        <div className="flex justify-center">
          <FullWalletFlexCard
            walletScore={walletScore}
            financialScore={financialScore}
            netWorth={netWorth}
            subscriptionBurn={subBurn}
            savingsRate={avgSavings}
            aspectRatio="portrait"
          />
        </div>
      ) : null}
    </div>
  );
}

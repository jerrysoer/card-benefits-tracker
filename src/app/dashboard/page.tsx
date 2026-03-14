"use client";

import { useState, useEffect, useCallback } from "react";
import { isDemoMode, DEMO_USER_CARDS, DEMO_CARDS, DEMO_BENEFITS, DEMO_USAGE } from "@/lib/demo/data";
import type { BenefitWithCard, BenefitUsage, PortfolioSummary as PortfolioSummaryType, CardROI, Card, Benefit } from "@/lib/supabase/types";
import { getCurrentPeriod } from "@/lib/benefits/deadline";
import { getUrgencyState, getUrgencySortPriority } from "@/lib/benefits/urgency";
import { calculateCardROI, calculatePortfolioSummary } from "@/lib/benefits/roi";
import { getPersistedUsage, setPersistedUsage, getStreak } from "@/lib/local-storage";
import { calculateWalletScore, calculateDiversityScore } from "@/lib/scoring";
import { calculatePointsValue, calculateWalletValue, loadPointsPrograms } from "@/lib/points";
import { getPointsBalances, getCustomValuations } from "@/lib/local-storage";
import BenefitTimeline from "@/components/dashboard/BenefitTimeline";
import PortfolioSummaryBar from "@/components/dashboard/PortfolioSummary";
import PointsPortfolio from "@/components/dashboard/PointsPortfolio";
import StreakCounter from "@/components/dashboard/StreakCounter";
import AnnualFeeScorecard from "@/components/dashboard/AnnualFeeScorecard";
import DowngradeCalendar from "@/components/dashboard/DowngradeCalendar";
import FlexCardModal from "@/components/dashboard/FlexCardModal";

export default function DashboardPage() {
  const [benefits, setBenefits] = useState<BenefitWithCard[]>([]);
  const [summary, setSummary] = useState<PortfolioSummaryType | null>(null);
  const [cardROIs, setCardROIs] = useState<CardROI[]>([]);
  const [usage, setUsage] = useState<BenefitUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFlexModal, setShowFlexModal] = useState(false);

  const buildPortfolio = useCallback((currentUsage: BenefitUsage[]) => {
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
        const benefitUsage = currentUsage.find(
          (u: BenefitUsage) =>
            u.cc_benefit_id === benefit.id &&
            u.cc_period_start === period.start.toISOString().split("T")[0]
        );

        const urgency = getUrgencyState(period.daysRemaining);

        enriched.push({
          ...benefit,
          card,
          userCard: uc,
          usage: benefitUsage || null,
          period: {
            start: period.start,
            end: period.end,
            daysRemaining: period.daysRemaining,
          },
          urgency,
        });
      }

      rois.push(calculateCardROI(card, uc, cardBenefits, cardUsage));
    }

    enriched.sort((a, b) => {
      const aUsed = a.usage?.cc_is_fully_used ? 1 : 0;
      const bUsed = b.usage?.cc_is_fully_used ? 1 : 0;
      if (aUsed !== bUsed) return aUsed - bUsed;

      const aUrgency = getUrgencySortPriority(a.usage?.cc_is_fully_used ? "used" : a.urgency);
      const bUrgency = getUrgencySortPriority(b.usage?.cc_is_fully_used ? "used" : b.urgency);
      if (aUrgency !== bUrgency) return aUrgency - bUrgency;

      return a.period.daysRemaining - b.period.daysRemaining;
    });

    setBenefits(enriched);
    setCardROIs(rois);
    setSummary(calculatePortfolioSummary(rois));
  }, []);

  useEffect(() => {
    if (isDemoMode()) {
      const persisted = getPersistedUsage();
      const initialUsage = persisted ?? [...DEMO_USAGE];
      setUsage(initialUsage);
      buildPortfolio(initialUsage);
      setLoading(false);
    }
  }, [buildPortfolio]);

  const handleMarkUsed = useCallback(
    (benefitId: string, amount?: number) => {
      const benefit = benefits.find((b) => b.id === benefitId);
      if (!benefit) return;

      const periodStart = benefit.period.start.toISOString().split("T")[0];
      const existingIndex = usage.findIndex(
        (u) => u.cc_benefit_id === benefitId && u.cc_period_start === periodStart
      );

      let newUsage: BenefitUsage[];

      if (existingIndex >= 0) {
        if (usage[existingIndex].cc_is_fully_used && amount === undefined) {
          newUsage = usage.filter((_, i) => i !== existingIndex);
        } else {
          newUsage = [...usage];
          newUsage[existingIndex] = {
            ...newUsage[existingIndex],
            cc_amount_used: amount ?? benefit.cc_benefit_value,
            cc_is_fully_used: amount === undefined || amount >= benefit.cc_benefit_value,
            cc_used_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        }
      } else {
        const newEntry: BenefitUsage = {
          id: `usage-${Date.now()}`,
          user_id: "demo-user",
          cc_benefit_id: benefitId,
          cc_user_card_id: benefit.userCard.id,
          cc_period_start: periodStart,
          cc_period_end: benefit.period.end.toISOString().split("T")[0],
          cc_amount_used: amount ?? benefit.cc_benefit_value,
          cc_is_fully_used: amount === undefined || amount >= benefit.cc_benefit_value,
          cc_used_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        newUsage = [...usage, newEntry];
      }

      setUsage(newUsage);
      setPersistedUsage(newUsage);
      buildPortfolio(newUsage);
    },
    [benefits, usage, buildPortfolio]
  );

  // Compute wallet score for flex card
  const computeFlexData = () => {
    const programs = loadPointsPrograms();
    const balances = getPointsBalances();
    const valuations = getCustomValuations();
    const pointsVal = calculatePointsValue(balances, valuations, programs);
    const unusedBenefits = benefits
      .filter((b) => !b.usage?.cc_is_fully_used)
      .reduce((sum, b) => sum + b.cc_annual_total, 0);
    const totalFees = cardROIs.reduce((sum, r) => sum + r.annualFee, 0);
    const walletValue = calculateWalletValue(pointsVal, unusedBenefits, totalFees);

    const totalCaptured = cardROIs.reduce((sum, r) => sum + r.totalCaptured, 0);
    const totalBenefitValue = cardROIs.reduce((sum, r) => sum + r.totalBenefitValue, 0);
    const captureRate = totalBenefitValue > 0 ? (totalCaptured / totalBenefitValue) * 100 : 0;
    const feeROI = totalFees > 0 ? (totalCaptured / totalFees) * 100 : 0;
    const diversity = calculateDiversityScore(cardROIs.map((r) => r.card));
    const streakData = getStreak();
    const score = calculateWalletScore(captureRate, feeROI, diversity, streakData.current);

    return { walletScore: score, walletValue, streak: streakData.current };
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-text-secondary">Loading your benefits...</div>
      </div>
    );
  }

  const flexData = computeFlexData();

  return (
    <div className="space-y-8">
      {/* Hero: Points Portfolio */}
      <PointsPortfolio cardROIs={cardROIs} benefits={benefits} />

      {/* Streak */}
      <StreakCounter benefits={benefits} usage={usage} />

      {/* Existing summary */}
      {summary && <PortfolioSummaryBar summary={summary} />}

      {/* Annual Fee Scorecard */}
      <AnnualFeeScorecard cardROIs={cardROIs} benefits={benefits} />

      {/* Downgrade Calendar */}
      <DowngradeCalendar cardROIs={cardROIs} benefits={benefits} />

      {/* Benefit Timeline */}
      <BenefitTimeline benefits={benefits} onMarkUsed={handleMarkUsed} />

      {/* Share button */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowFlexModal(true)}
          className="rounded-lg border-3 border-neon-purple px-8 py-3 font-display text-sm text-neon-purple transition-opacity hover:opacity-80"
        >
          SHARE YOUR WALLET
        </button>
      </div>

      {/* Flex Card Modal */}
      <FlexCardModal
        isOpen={showFlexModal}
        onClose={() => setShowFlexModal(false)}
        walletScore={flexData.walletScore}
        cardROIs={cardROIs}
        streak={flexData.streak}
        walletValue={flexData.walletValue}
      />
    </div>
  );
}

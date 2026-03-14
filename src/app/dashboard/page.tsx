"use client";

import { useState, useEffect, useCallback } from "react";
import { isDemoMode, DEMO_USER_CARDS, DEMO_CARDS, DEMO_BENEFITS, DEMO_USAGE } from "@/lib/demo/data";
import type { BenefitWithCard, BenefitUsage, PortfolioSummary as PortfolioSummaryType, CardROI, Card, Benefit } from "@/lib/supabase/types";
import { getCurrentPeriod } from "@/lib/benefits/deadline";
import { getUrgencyState, getUrgencySortPriority } from "@/lib/benefits/urgency";
import { calculateCardROI, calculatePortfolioSummary } from "@/lib/benefits/roi";
import { getPersistedUsage, setPersistedUsage, getStreak, getPointsBalances, getCustomValuations } from "@/lib/storage";
import { calculateWalletScore, calculateDiversityScore, calculateGrade } from "@/lib/scoring";
import { calculatePointsValue, calculateWalletValue, loadPointsPrograms } from "@/lib/points";
import { logEvent } from "@/lib/storage/event-log";
import { captureMonthlySnapshot, getCurrentMonthKey } from "@/lib/storage/snapshots";
import { checkAllBadges, getBadgeState, type BadgeState, type BadgeDefinition } from "@/lib/badges";
import { getChallengeState } from "@/lib/challenges";
import { getLastRoast, hasEverRoasted } from "@/lib/roast";
import {
  getSubscriptions,
  getLatestNetWorth,
  getSavingsEntries,
  getIncomeData,
} from "@/lib/fullwallet/storage";
import { calculateSubscriptionStats, calculateAverageMonthlySavings } from "@/lib/fullwallet/calculations";
import BenefitTimeline from "@/components/dashboard/BenefitTimeline";
import PortfolioSummaryBar from "@/components/dashboard/PortfolioSummary";
import PointsPortfolio from "@/components/dashboard/PointsPortfolio";
import StreakCounter from "@/components/dashboard/StreakCounter";
import AnnualFeeScorecard from "@/components/dashboard/AnnualFeeScorecard";
import DowngradeCalendar from "@/components/dashboard/DowngradeCalendar";
import FlexCardModal from "@/components/dashboard/FlexCardModal";
import BadgeShelf from "@/components/dashboard/BadgeShelf";
import CardCollection from "@/components/dashboard/CardCollection";
import BurnRate from "@/components/dashboard/BurnRate";
import RecommendationList from "@/components/dashboard/RecommendationList";
import WeeklyChallenge from "@/components/dashboard/WeeklyChallenge";
import RoastModal from "@/components/dashboard/RoastModal";
import WrappedBanner from "@/components/wrapped/WrappedBanner";

export default function DashboardPage() {
  const [benefits, setBenefits] = useState<BenefitWithCard[]>([]);
  const [summary, setSummary] = useState<PortfolioSummaryType | null>(null);
  const [cardROIs, setCardROIs] = useState<CardROI[]>([]);
  const [usage, setUsage] = useState<BenefitUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFlexModal, setShowFlexModal] = useState(false);
  const [showRoastModal, setShowRoastModal] = useState(false);

  // Phase 3 state
  const [badgeState, setBadgeState] = useState<BadgeState>({});
  const [newlyUnlocked, setNewlyUnlocked] = useState<BadgeDefinition[]>([]);
  const [flexData, setFlexData] = useState({ walletScore: 0, walletValue: 0, streak: 0 });
  const [challengeStats, setChallengeStats] = useState({ completed: 0, total: 0 });
  const [roastExcerpt, setRoastExcerpt] = useState<string | null>(null);
  const [hasRoasted, setHasRoasted] = useState(false);
  const [hasCompletedChallenge, setHasCompletedChallenge] = useState(false);

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
      getPersistedUsage().then((persisted) => {
        const initialUsage = persisted ?? [...DEMO_USAGE];
        setUsage(initialUsage);
        buildPortfolio(initialUsage);
        setLoading(false);
      });
    }
  }, [buildPortfolio]);

  // Phase 3: Compute flex data, badges, challenge stats, roast excerpt
  useEffect(() => {
    if (loading || cardROIs.length === 0) return;

    async function computePhase3() {
      const programs = loadPointsPrograms();
      const balances = await getPointsBalances();
      const valuations = await getCustomValuations();
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
      const streakData = await getStreak();
      const score = calculateWalletScore(captureRate, feeROI, diversity, streakData.current);

      setFlexData({ walletScore: score, walletValue, streak: streakData.current });

      // Monthly snapshot
      const monthKey = getCurrentMonthKey();
      const totalPoints = Object.values(balances).reduce((s, v) => s + v, 0);
      const cardGrades: Record<string, { grade: string; roi: number }> = {};
      for (const r of cardROIs) {
        const g = calculateGrade(r.totalCaptured, r.annualFee);
        cardGrades[r.card.cc_card_slug] = { grade: g.grade, roi: r.annualFee > 0 ? Math.round((r.totalCaptured / r.annualFee) * 100) : 0 };
      }

      const existingBadges = await getBadgeState();
      const challengeState = await getChallengeState();
      const everRoasted = await hasEverRoasted();

      // Gather Phase 5 data for snapshot
      const [fwSubs, fwNW, fwSavings, fwIncome] = await Promise.all([
        getSubscriptions(),
        getLatestNetWorth(),
        getSavingsEntries(),
        getIncomeData(),
      ]);
      const fwSubStats = calculateSubscriptionStats(fwSubs);
      const fwAvgSavings = calculateAverageMonthlySavings(fwSavings);

      captureMonthlySnapshot({
        month: monthKey,
        capturedAt: new Date().toISOString(),
        walletValue,
        walletScore: score,
        totalCards: cardROIs.length,
        totalAnnualFees: totalFees,
        totalBenefitsCaptured: totalCaptured,
        totalBenefitsAvailable: totalBenefitValue,
        captureRate,
        totalPointsValue: pointsVal,
        pointsBalances: balances,
        cardGrades,
        streakCount: streakData.current,
        badgesUnlocked: Object.keys(existingBadges).length,
        challengesCompleted: challengeState.completedThisMonth,
        // Phase 5 fields
        subscriptionMonthlyBurn: fwSubs.length > 0 ? fwSubStats.monthlyTotal : undefined,
        netWorth: fwNW?.netWorth,
        savingsBalance: fwSavings.length > 0 ? fwAvgSavings : undefined,
        monthlyIncome: fwIncome ? fwIncome.annualIncome / 12 : undefined,
      });

      // Check badges
      const hasChallenge = challengeState.completedThisMonth > 0;
      setHasRoasted(everRoasted);
      setHasCompletedChallenge(hasChallenge);

      const badgeResult = await checkAllBadges({
        cardROIs,
        benefits,
        totalPoints,
        streakMonths: streakData.current,
        walletScore: score,
        hasRoasted: everRoasted,
        hasCompletedChallenge: hasChallenge,
      });
      setBadgeState(badgeResult.allBadges);
      setNewlyUnlocked(badgeResult.newlyUnlocked);

      // Challenge stats
      setChallengeStats({
        completed: challengeState.completedThisMonth,
        total: challengeState.totalThisMonth,
      });

      // Roast excerpt
      const lastRoast = await getLastRoast();
      setRoastExcerpt(lastRoast);
    }

    computePhase3();
  }, [loading, cardROIs, benefits]);

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
          logEvent("benefit_unmarked", {
            benefit_id: benefitId,
            benefit_name: benefit.cc_benefit_name,
            card_slug: benefit.card.cc_card_slug,
          });
        } else {
          newUsage = [...usage];
          newUsage[existingIndex] = {
            ...newUsage[existingIndex],
            cc_amount_used: amount ?? benefit.cc_benefit_value,
            cc_is_fully_used: amount === undefined || amount >= benefit.cc_benefit_value,
            cc_used_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          logEvent("benefit_marked_used", {
            benefit_id: benefitId,
            benefit_name: benefit.cc_benefit_name,
            card_slug: benefit.card.cc_card_slug,
            amount: amount ?? benefit.cc_benefit_value,
          });
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
        logEvent("benefit_marked_used", {
          benefit_id: benefitId,
          benefit_name: benefit.cc_benefit_name,
          card_slug: benefit.card.cc_card_slug,
          amount: amount ?? benefit.cc_benefit_value,
        });
      }

      setUsage(newUsage);
      setPersistedUsage(newUsage);
      buildPortfolio(newUsage);
    },
    [benefits, usage, buildPortfolio]
  );

  const handleRoastGenerated = useCallback(() => {
    setHasRoasted(true);
    getLastRoast().then(setRoastExcerpt);
    // Re-check badges for "roasted" badge
    if (cardROIs.length > 0) {
      getPointsBalances().then((balances) => {
        const totalPoints = Object.values(balances).reduce((s, v) => s + v, 0);
        checkAllBadges({
          cardROIs,
          benefits,
          totalPoints,
          streakMonths: flexData.streak,
          walletScore: flexData.walletScore,
          hasRoasted: true,
          hasCompletedChallenge,
        }).then((result) => {
          setBadgeState(result.allBadges);
          if (result.newlyUnlocked.length > 0) {
            setNewlyUnlocked(result.newlyUnlocked);
          }
        });
      });
    }
  }, [cardROIs, benefits, flexData, hasCompletedChallenge]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-text-secondary">Loading your benefits...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Wrapped Banner */}
      <WrappedBanner />

      {/* Hero: Points Portfolio */}
      <PointsPortfolio cardROIs={cardROIs} benefits={benefits} />

      {/* Streak */}
      <StreakCounter benefits={benefits} usage={usage} />

      {/* Weekly Challenge */}
      <WeeklyChallenge benefits={benefits} onBenefitUsed={(id) => handleMarkUsed(id)} />

      {/* Badge Shelf */}
      <BadgeShelf badgeState={badgeState} newlyUnlocked={newlyUnlocked} />

      {/* Existing summary */}
      {summary && <PortfolioSummaryBar summary={summary} />}

      {/* Card Collection */}
      <CardCollection cardROIs={cardROIs} />

      {/* Annual Fee Scorecard */}
      <AnnualFeeScorecard cardROIs={cardROIs} benefits={benefits} />

      {/* Points Burn Rate / Runway */}
      <BurnRate />

      {/* Card Recommendations */}
      <RecommendationList cardROIs={cardROIs} />

      {/* Downgrade Calendar */}
      <DowngradeCalendar cardROIs={cardROIs} benefits={benefits} />

      {/* Benefit Timeline */}
      <BenefitTimeline benefits={benefits} onMarkUsed={handleMarkUsed} />

      {/* Roast button */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowRoastModal(true)}
          className="rounded-lg border-3 border-neon-red px-8 py-3 font-display text-sm text-neon-red transition-opacity hover:opacity-80"
        >
          🔥 ROAST MY WALLET
        </button>
      </div>

      {/* Share button */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowFlexModal(true)}
          className="rounded-lg border-3 border-neon-purple px-8 py-3 font-display text-sm text-neon-purple transition-opacity hover:opacity-80"
        >
          SHARE YOUR WALLET
        </button>
      </div>

      {/* Roast Modal */}
      <RoastModal
        isOpen={showRoastModal}
        onClose={() => setShowRoastModal(false)}
        walletScore={flexData.walletScore}
        onRoastGenerated={handleRoastGenerated}
      />

      {/* Flex Card Modal */}
      <FlexCardModal
        isOpen={showFlexModal}
        onClose={() => setShowFlexModal(false)}
        walletScore={flexData.walletScore}
        cardROIs={cardROIs}
        streak={flexData.streak}
        walletValue={flexData.walletValue}
        badgeState={badgeState}
        challengeStats={challengeStats}
        roastExcerpt={roastExcerpt}
      />
    </div>
  );
}

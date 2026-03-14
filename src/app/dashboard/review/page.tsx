"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import SlideShow, { type SlideConfig } from "@/components/wrapped/SlideShow";
import YearAtGlanceSlide from "@/components/wrapped/slides/YearAtGlanceSlide";
import WalletJourneySlide from "@/components/wrapped/slides/WalletJourneySlide";
import CardsRankedSlide from "@/components/wrapped/slides/CardsRankedSlide";
import BestMonthSlide from "@/components/wrapped/slides/BestMonthSlide";
import WorstMonthSlide from "@/components/wrapped/slides/WorstMonthSlide";
import GradeStorySlide from "@/components/wrapped/slides/GradeStorySlide";
import PointsPortfolioSlide from "@/components/wrapped/slides/PointsPortfolioSlide";
import YearMilestonesSlide from "@/components/wrapped/slides/YearMilestonesSlide";
import MoneySavedSlide from "@/components/wrapped/slides/MoneySavedSlide";
import YearSummaryCardSlide from "@/components/wrapped/slides/YearSummaryCardSlide";
import YearSubscriptionsSlide from "@/components/wrapped/slides/YearSubscriptionsSlide";
import YearNetWorthSlide from "@/components/wrapped/slides/YearNetWorthSlide";
import {
  buildYearInReview,
  getAvailableYears,
  markWrappedYearViewed,
  type YearInReviewData,
} from "@/lib/wrapped/queries";

const ACCENT_COLOR = "#FFD700";

export default function YearInReviewPage() {
  const [data, setData] = useState<YearInReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      const years = await getAvailableYears();
      setAvailableYears(years);

      if (years.length === 0) {
        setError(
          "Not enough data yet. You need at least 3 months of data for a Year in Review."
        );
        setLoading(false);
        return;
      }

      // Determine default year
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      let defaultYear: number;
      if (currentMonth === 1 && years.includes(currentYear - 1)) {
        // January: show previous year
        defaultYear = currentYear - 1;
      } else if (currentMonth >= 12 && years.includes(currentYear)) {
        // December: show current year
        defaultYear = currentYear;
      } else if (currentMonth >= 6 && years.includes(currentYear)) {
        // Mid-year review available after June
        defaultYear = currentYear;
      } else {
        // Most recent available year
        defaultYear = years[0];
      }

      setSelectedYear(defaultYear);
    }
    load();
  }, []);

  useEffect(() => {
    if (selectedYear === null) return;
    const yearToLoad = selectedYear;

    async function loadYear() {
      setLoading(true);
      setError(null);

      // Check availability
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      if (yearToLoad === currentYear && currentMonth < 6) {
        setError(
          "Mid-Year Review is available starting June 1. Check back then!"
        );
        setLoading(false);
        return;
      }

      const result = await buildYearInReview(yearToLoad);
      if (!result) {
        setError(
          `Not enough data for ${yearToLoad}. You need at least 3 months of activity.`
        );
        setLoading(false);
        return;
      }

      setData(result);
      setLoading(false);
    }
    loadYear();
  }, [selectedYear]);

  function handleComplete() {
    if (selectedYear !== null) {
      markWrappedYearViewed(selectedYear);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p
          className="font-display text-sm tracking-widest"
          style={{ color: ACCENT_COLOR }}
        >
          PREPARING YOUR YEAR IN REVIEW...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-text-secondary">{error}</p>
        <Link
          href="/dashboard"
          className="text-sm text-text-secondary hover:underline"
        >
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!data) return null;

  const hasMilestones =
    data.badgesUnlocked.length > 0 ||
    data.longestStreak > 0 ||
    data.totalChallengesCompleted > 0;

  const hasGradeStories = data.gradeStories.length > 0;
  const hasPoints = data.totalPointsEarned > 0 || data.currentPointsBalance > 0;

  const slides: SlideConfig[] = [
    {
      id: "at-a-glance",
      component: (
        <YearAtGlanceSlide
          data={data}
          accentColor={ACCENT_COLOR}
          animate={true}
        />
      ),
      shouldShow: true,
    },
    {
      id: "wallet-journey",
      component: (
        <WalletJourneySlide
          data={data}
          accentColor={ACCENT_COLOR}
          animate={true}
        />
      ),
      shouldShow: data.walletValueByMonth.length >= 2,
    },
    {
      id: "cards-ranked",
      component: (
        <CardsRankedSlide
          data={data}
          accentColor={ACCENT_COLOR}
          animate={true}
        />
      ),
      shouldShow: data.cardRankings.length > 0,
    },
    {
      id: "best-month",
      component: (
        <BestMonthSlide
          data={data}
          accentColor={ACCENT_COLOR}
          animate={true}
        />
      ),
      shouldShow: true,
    },
    {
      id: "worst-month",
      component: (
        <WorstMonthSlide
          data={data}
          accentColor={ACCENT_COLOR}
          animate={true}
        />
      ),
      shouldShow: true,
    },
    {
      id: "grade-story",
      component: (
        <GradeStorySlide
          data={data}
          accentColor={ACCENT_COLOR}
          animate={true}
        />
      ),
      shouldShow: hasGradeStories,
    },
    {
      id: "points-portfolio",
      component: (
        <PointsPortfolioSlide
          data={data}
          accentColor={ACCENT_COLOR}
          animate={true}
        />
      ),
      shouldShow: hasPoints,
    },
    {
      id: "milestones",
      component: (
        <YearMilestonesSlide
          data={data}
          accentColor={ACCENT_COLOR}
          animate={true}
        />
      ),
      shouldShow: hasMilestones,
    },
    {
      id: "year-subscriptions",
      component: (
        <YearSubscriptionsSlide
          data={data}
          accentColor={ACCENT_COLOR}
          animate={true}
        />
      ),
      shouldShow: data.averageSubscriptionBurn !== undefined && data.averageSubscriptionBurn > 0,
    },
    {
      id: "year-net-worth",
      component: (
        <YearNetWorthSlide
          data={data}
          accentColor={ACCENT_COLOR}
          animate={true}
        />
      ),
      shouldShow: data.netWorthStart !== undefined && data.netWorthEnd !== undefined,
    },
    {
      id: "money-saved",
      component: (
        <MoneySavedSlide
          data={data}
          accentColor={ACCENT_COLOR}
          animate={true}
        />
      ),
      shouldShow: true,
    },
    {
      id: "summary",
      component: (
        <YearSummaryCardSlide
          data={data}
          accentColor={ACCENT_COLOR}
          animate={true}
        />
      ),
      shouldShow: true,
    },
  ];

  const title = data.isPartialYear
    ? `${data.year} SO FAR`
    : `${data.year} YEAR IN REVIEW`;

  return (
    <div>
      {/* Year selector */}
      {availableYears.length > 1 && (
        <div className="mb-4 flex items-center gap-2">
          {availableYears.map((y) => (
            <button
              key={y}
              onClick={() => setSelectedYear(y)}
              className={`rounded-lg px-3 py-1.5 font-mono-data text-sm font-bold transition-colors ${
                y === selectedYear
                  ? "bg-bg-elevated text-text-secondary"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      )}
      <SlideShow
        slides={slides}
        accentColor={ACCENT_COLOR}
        title={title}
        onComplete={handleComplete}
      />
    </div>
  );
}

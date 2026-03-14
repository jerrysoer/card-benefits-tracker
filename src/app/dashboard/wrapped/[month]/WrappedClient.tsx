"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import SlideShow, { type SlideConfig } from "@/components/wrapped/SlideShow";
import NumbersSlide from "@/components/wrapped/slides/NumbersSlide";
import WalletMovedSlide from "@/components/wrapped/slides/WalletMovedSlide";
import BestCardSlide from "@/components/wrapped/slides/BestCardSlide";
import WorstCardSlide from "@/components/wrapped/slides/WorstCardSlide";
import MilestonesSlide from "@/components/wrapped/slides/MilestonesSlide";
import BiggestMissSlide from "@/components/wrapped/slides/BiggestMissSlide";
import SummaryCardSlide from "@/components/wrapped/slides/SummaryCardSlide";
import {
  buildMonthlyWrapped,
  markWrappedMonthViewed,
  type MonthlyWrappedData,
} from "@/lib/wrapped/queries";

const ACCENT_COLOR = "#BF5AF2";

interface WrappedClientProps {
  month: string;
}

export default function WrappedClient({ month }: WrappedClientProps) {
  const [data, setData] = useState<MonthlyWrappedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const parts = month.split("-");
      if (parts.length !== 2) {
        setError("Invalid month format. Use YYYY-MM.");
        setLoading(false);
        return;
      }
      const year = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      if (isNaN(year) || isNaN(m) || m < 1 || m > 12) {
        setError("Invalid month format.");
        setLoading(false);
        return;
      }

      // Check if this is the current month
      const now = new Date();
      if (year === now.getFullYear() && m === now.getMonth() + 1) {
        setError(
          `${month} isn't over yet. Check back on the 1st for your Wrapped.`
        );
        setLoading(false);
        return;
      }

      const result = await buildMonthlyWrapped(year, m);
      if (!result) {
        setError(
          "No data available for this month. You may not have been active on CardClock."
        );
        setLoading(false);
        return;
      }

      setData(result);
      setLoading(false);
    }
    load();
  }, [month]);

  function handleComplete() {
    markWrappedMonthViewed(month);
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p
            className="font-display text-sm tracking-widest"
            style={{ color: ACCENT_COLOR }}
          >
            PREPARING YOUR WRAPPED...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-text-secondary">{error}</p>
        <Link
          href="/dashboard/wrapped"
          className="text-sm text-neon-purple hover:underline"
        >
          ← Back to Wrapped history
        </Link>
      </div>
    );
  }

  if (!data) return null;

  const hasMilestones =
    data.streakCount > 0 ||
    data.badgesUnlocked.length > 0 ||
    data.challengesCompleted > 0;

  const hasBiggestMiss = data.biggestMisses.length > 0;

  const slides: SlideConfig[] = [
    {
      id: "numbers",
      component: (
        <NumbersSlide data={data} accentColor={ACCENT_COLOR} animate={true} />
      ),
      shouldShow: true,
    },
    {
      id: "wallet-moved",
      component: (
        <WalletMovedSlide
          data={data}
          accentColor={ACCENT_COLOR}
          animate={true}
        />
      ),
      shouldShow: true,
    },
    {
      id: "best-card",
      component: (
        <BestCardSlide data={data} accentColor={ACCENT_COLOR} animate={true} />
      ),
      shouldShow: true,
    },
    {
      id: "worst-card",
      component: (
        <WorstCardSlide data={data} accentColor={ACCENT_COLOR} animate={true} />
      ),
      shouldShow: true,
    },
    {
      id: "milestones",
      component: (
        <MilestonesSlide
          data={data}
          accentColor={ACCENT_COLOR}
          animate={true}
        />
      ),
      shouldShow: hasMilestones,
    },
    {
      id: "biggest-miss",
      component: (
        <BiggestMissSlide
          data={data}
          accentColor={ACCENT_COLOR}
          animate={true}
        />
      ),
      shouldShow: hasBiggestMiss,
    },
    {
      id: "summary",
      component: (
        <SummaryCardSlide
          data={data}
          accentColor={ACCENT_COLOR}
          animate={true}
        />
      ),
      shouldShow: true,
    },
  ];

  return (
    <div>
      <div className="mb-2">
        <Link
          href="/dashboard/wrapped"
          className="text-xs text-text-muted hover:text-text-secondary"
        >
          ← All Months
        </Link>
      </div>
      <SlideShow
        slides={slides}
        accentColor={ACCENT_COLOR}
        title={`${data.monthLabel} WRAPPED`}
        onComplete={handleComplete}
      />
    </div>
  );
}

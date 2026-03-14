import { storage } from "@/lib/storage/adapter";
import { STORAGE_KEYS } from "@/lib/storage/keys";
import {
  getEventsForMonth,
  getEventsForYear,
  type AppEvent,
} from "@/lib/storage/event-log";
import {
  getAllMonthlySnapshots,
  getMonthlySnapshot,
  type MonthlySnapshot,
} from "@/lib/storage/snapshots";
import { getScoreLabel } from "@/lib/scoring";
import {
  getWorstCardVerdict,
  getBestCardVerdict,
  getWorstMonthVerdict,
  getBestMonthVerdict,
  getHeroVerdict,
  getGradeStoryVerdict,
} from "./verdicts";

// --- Interfaces ---

export interface WrappedCardInfo {
  slug: string;
  name: string;
  grade: string;
  captured: number;
  wasted: number;
  gradeChange?: string;
  verdict: string;
}

export interface MonthlyWrappedData {
  month: string; // "2026-03"
  monthLabel: string; // "MARCH 2026"
  isFirstMonth: boolean;

  // Slide 1: Numbers
  benefitsCapturedValue: number;
  benefitsWastedValue: number;
  captureRate: number;
  captureRateDelta: number;

  // Slide 2: Wallet movement
  walletValueStart: number;
  walletValueEnd: number;
  walletDelta: number;
  pointsEarned: { program: string; amount: number }[];
  pointsRedeemed: { program: string; amount: number; value: number }[];

  // Slide 3: Best card
  bestCard: WrappedCardInfo;

  // Slide 4: Worst card
  worstCard: WrappedCardInfo;

  // Slide 5: Milestones
  streakCount: number;
  badgesUnlocked: { id: string; name: string; icon: string }[];
  challengesCompleted: number;
  challengesTotal: number;

  // Slide 6: Biggest miss
  biggestMisses: { benefit: string; card: string; value: number }[];
  totalWastedMonth: number;
  totalWastedYear: number;

  // Wallet Score
  walletScore: number;
  walletScoreLabel: string;

  // Phase 5: Full Wallet (optional)
  subscriptionMonthlyBurn?: number;
  subscriptionCount?: number;
  unusedSubscriptionCount?: number;
  topUnusedSub?: { name: string; cost: number };
  netWorth?: number;
  netWorthDelta?: number;
  savingsThisMonth?: number;
  monthlyIncome?: number;
  financialScore?: number;
  financialScoreLabel?: string;
  financialScoreColor?: string;
  moneyRatios?: {
    feesOverIncome: number;
    capturedOverIncome: number;
    subsOverIncome: number;
    savingsOverIncome: number;
  };
}

export interface YearInReviewData {
  year: number;
  isPartialYear: boolean;
  isMidYear: boolean;

  // Slide 1: At a glance
  totalCaptured: number;
  totalWasted: number;
  averageCaptureRate: number;
  totalFees: number;
  netRoi: number;
  netRoiPercent: number;

  // Slide 2: Wallet journey
  walletValueByMonth: number[];
  monthLabels: string[];
  peakMonth: { month: string; value: number };
  troughMonth: { month: string; value: number };

  // Slide 3: Cards ranked
  cardRankings: {
    slug: string;
    name: string;
    grade: string;
    captured: number;
    fee: number;
  }[];
  portfolioAverageGrade: string;

  // Slide 4: Best month
  bestMonth: {
    month: string;
    monthLabel: string;
    captureRate: number;
    captured: number;
    walletScore: number;
    highlight?: string;
  };

  // Slide 5: Worst month
  worstMonth: {
    month: string;
    monthLabel: string;
    captureRate: number;
    captured: number;
    wasted: number;
    verdict: string;
  };

  // Slide 6: Grade story (top 2 cards)
  gradeStories: {
    slug: string;
    name: string;
    grades: string[];
    startGrade: string;
    endGrade: string;
    verdict: string;
  }[];

  // Slide 7: Points portfolio
  totalPointsEarned: number;
  totalPointsRedeemed: number;
  totalPointsRedeemedValue: number;
  currentPointsBalance: number;
  currentPointsValue: number;
  bestRedemption?: {
    program: string;
    amount: number;
    value: number;
    cppAchieved: number;
  };

  // Slide 8: Milestones
  badgesUnlocked: { id: string; name: string; icon: string }[];
  longestStreak: number;
  totalChallengesCompleted: number;
  totalChallengesAvailable: number;
  totalRoasts: number;

  // Slide 9: Money saved and wasted
  totalSaved: number;
  totalWastedBenefits: number;
  totalFeePaid: number;
  netValue: number;
  netReturnPercent: number;
  heroVerdict: string;

  // Projections (mid-year only)
  projectedCaptured?: number;
  projectedCaptureRate?: number;

  // Phase 5: Full Wallet (optional)
  averageSubscriptionBurn?: number;
  netWorthStart?: number;
  netWorthEnd?: number;
  netWorthDelta?: number;
  totalSavings?: number;
  averageFinancialScore?: number;
}

// --- Wrapped Viewed Tracking ---

interface WrappedViewedState {
  months: string[];
  years: number[];
}

export async function getWrappedViewedState(): Promise<WrappedViewedState> {
  return storage.get<WrappedViewedState>(STORAGE_KEYS.wrappedViewed, {
    months: [],
    years: [],
  });
}

export async function markWrappedMonthViewed(month: string): Promise<void> {
  const state = await getWrappedViewedState();
  if (!state.months.includes(month)) {
    state.months.push(month);
    await storage.set(STORAGE_KEYS.wrappedViewed, state);
  }
}

export async function markWrappedYearViewed(year: number): Promise<void> {
  const state = await getWrappedViewedState();
  if (!state.years.includes(year)) {
    state.years.push(year);
    await storage.set(STORAGE_KEYS.wrappedViewed, state);
  }
}

// --- Helpers ---

const MONTH_NAMES = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
];

const MONTH_LABELS_SHORT = [
  "J",
  "F",
  "M",
  "A",
  "M",
  "J",
  "J",
  "A",
  "S",
  "O",
  "N",
  "D",
];

function getMonthLabel(monthKey: string): string {
  const [year, monthStr] = monthKey.split("-");
  const monthIndex = parseInt(monthStr, 10) - 1;
  return `${MONTH_NAMES[monthIndex]} ${year}`;
}

function getPreviousMonthKey(monthKey: string): string {
  const [year, monthStr] = monthKey.split("-");
  let y = parseInt(year, 10);
  let m = parseInt(monthStr, 10) - 1; // 0-indexed
  if (m === 0) {
    m = 12;
    y -= 1;
  }
  return `${y}-${String(m).padStart(2, "0")}`;
}

function sumEventValues(
  events: AppEvent[],
  type: string,
  valueField = "value"
): number {
  return events
    .filter((e) => e.type === type)
    .reduce((sum, e) => sum + ((e.data[valueField] as number) || 0), 0);
}

function countEvents(events: AppEvent[], type: string): number {
  return events.filter((e) => e.type === type).length;
}

function computeAverageGrade(
  cardGrades: Record<string, { grade: string; roi: number }>
): string {
  const gradeValues: Record<string, number> = {
    F: 0,
    D: 1,
    C: 2,
    "C+": 3,
    B: 4,
    "B+": 5,
    A: 6,
    "A+": 7,
  };
  const reverseValues: Record<number, string> = {
    0: "F",
    1: "D",
    2: "C",
    3: "C+",
    4: "B",
    5: "B+",
    6: "A",
    7: "A+",
  };

  const grades = Object.values(cardGrades)
    .map((g) => gradeValues[g.grade])
    .filter((v) => v !== undefined);

  if (grades.length === 0) return "N/A";

  const avg = Math.round(grades.reduce((a, b) => a + b, 0) / grades.length);
  return reverseValues[avg] || "C";
}

// --- Build Monthly Wrapped ---

export async function buildMonthlyWrapped(
  year: number,
  month: number // 1-indexed (calendar month)
): Promise<MonthlyWrappedData | null> {
  const monthKey = `${year}-${String(month).padStart(2, "0")}`;
  const prevMonthKey = getPreviousMonthKey(monthKey);

  const snapshot = await getMonthlySnapshot(monthKey);
  if (!snapshot) return null;

  // Events use 0-indexed months
  const events = await getEventsForMonth(year, month - 1);
  if (events.length === 0) return null;

  const prevSnapshot = await getMonthlySnapshot(prevMonthKey);
  const isFirstMonth = !prevSnapshot;

  // Slide 1: Numbers
  const benefitsCapturedValue = sumEventValues(
    events,
    "benefit_marked_used",
    "value"
  );
  const benefitsWastedValue = sumEventValues(
    events,
    "benefit_expired_unused",
    "value"
  );
  const captureRate = snapshot.captureRate;
  const captureRateDelta = isFirstMonth
    ? 0
    : captureRate - (prevSnapshot?.captureRate ?? 0);

  // Slide 2: Wallet movement
  const walletValueStart = prevSnapshot?.walletValue ?? 0;
  const walletValueEnd = snapshot.walletValue;
  const walletDelta = walletValueEnd - walletValueStart;

  const pointsEarned: { program: string; amount: number }[] = [];
  const pointsRedeemed: { program: string; amount: number; value: number }[] =
    [];

  events
    .filter((e) => e.type === "points_balance_updated")
    .forEach((e) => {
      const delta = (e.data.delta as number) || 0;
      if (delta > 0) {
        pointsEarned.push({
          program: (e.data.program as string) || "Unknown",
          amount: delta,
        });
      }
    });

  events
    .filter((e) => e.type === "points_redeemed")
    .forEach((e) => {
      pointsRedeemed.push({
        program: (e.data.program as string) || "Unknown",
        amount: (e.data.amount as number) || 0,
        value: (e.data.value as number) || 0,
      });
    });

  // Slides 3 & 4: Best/Worst card
  const cardGrades = snapshot.cardGrades;
  const prevCardGrades = prevSnapshot?.cardGrades ?? {};

  // Aggregate captured/wasted per card slug from events
  const cardCaptured: Record<string, number> = {};
  const cardWasted: Record<string, number> = {};
  const cardWastedBenefits: Record<
    string,
    { benefit: string; value: number }[]
  > = {};

  events
    .filter((e) => e.type === "benefit_marked_used")
    .forEach((e) => {
      const slug = (e.data.cardSlug as string) || "";
      cardCaptured[slug] = (cardCaptured[slug] || 0) + ((e.data.value as number) || 0);
    });

  events
    .filter((e) => e.type === "benefit_expired_unused")
    .forEach((e) => {
      const slug = (e.data.cardSlug as string) || "";
      const value = (e.data.value as number) || 0;
      cardWasted[slug] = (cardWasted[slug] || 0) + value;
      if (!cardWastedBenefits[slug]) cardWastedBenefits[slug] = [];
      cardWastedBenefits[slug].push({
        benefit: (e.data.benefitName as string) || "Unknown benefit",
        value,
      });
    });

  const cardSlugs = Object.keys(cardGrades);

  // Build card entries for best/worst selection
  const cardEntries = cardSlugs.map((slug) => {
    const gradeInfo = cardGrades[slug];
    const prevGrade = prevCardGrades[slug]?.grade;
    const gradeChange =
      prevGrade && prevGrade !== gradeInfo.grade
        ? `was ${prevGrade}`
        : undefined;

    return {
      slug,
      name: slug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
      grade: gradeInfo.grade,
      captured: cardCaptured[slug] || 0,
      wasted: cardWasted[slug] || 0,
      gradeChange,
      wastedBenefits: cardWastedBenefits[slug] || [],
    };
  });

  // Best: highest captured (exclude FREE cards from worst comparison)
  const sortedBest = [...cardEntries].sort(
    (a, b) => b.captured - a.captured
  );
  const bestEntry = sortedBest[0] || cardEntries[0];
  const bestCard: WrappedCardInfo = {
    slug: bestEntry?.slug ?? "",
    name: bestEntry?.name ?? "N/A",
    grade: bestEntry?.grade ?? "N/A",
    captured: bestEntry?.captured ?? 0,
    wasted: bestEntry?.wasted ?? 0,
    gradeChange: bestEntry?.gradeChange,
    verdict: bestEntry
      ? getBestCardVerdict(
          bestEntry.name,
          bestEntry.grade,
          bestEntry.gradeChange
        )
      : "",
  };

  // Worst: highest wasted or lowest captured (non-FREE)
  const nonFreeEntries = cardEntries.filter((c) => c.grade !== "FREE");
  const sortedWorst = [...nonFreeEntries].sort(
    (a, b) => b.wasted - a.wasted || a.captured - b.captured
  );
  const worstEntry = sortedWorst[0] || cardEntries[cardEntries.length - 1];
  const worstCard: WrappedCardInfo = {
    slug: worstEntry?.slug ?? "",
    name: worstEntry?.name ?? "N/A",
    grade: worstEntry?.grade ?? "N/A",
    captured: worstEntry?.captured ?? 0,
    wasted: worstEntry?.wasted ?? 0,
    gradeChange: worstEntry?.gradeChange,
    verdict: worstEntry
      ? getWorstCardVerdict(
          worstEntry.name,
          worstEntry.wastedBenefits
        )
      : "",
  };

  // Slide 5: Milestones
  const badgesUnlocked = events
    .filter((e) => e.type === "badge_unlocked")
    .map((e) => ({
      id: (e.data.badgeId as string) || "",
      name: (e.data.badgeName as string) || "",
      icon: (e.data.badgeIcon as string) || "",
    }));

  const challengesCompleted = countEvents(events, "challenge_completed");
  const challengesTotal = countEvents(events, "challenge_generated");

  // Slide 6: Biggest miss
  const biggestMisses = events
    .filter((e) => e.type === "benefit_expired_unused")
    .map((e) => ({
      benefit: (e.data.benefitName as string) || "Unknown",
      card: (e.data.cardName as string) || "Unknown",
      value: (e.data.value as number) || 0,
    }))
    .sort((a, b) => b.value - a.value);

  // Year-to-date wasted
  const yearEvents = await getEventsForYear(year);
  const totalWastedYear = sumEventValues(
    yearEvents,
    "benefit_expired_unused",
    "value"
  );

  // Wallet Score
  const scoreLabel = getScoreLabel(snapshot.walletScore);

  // Phase 5 fields (read from snapshot if available)
  const phase5: Partial<MonthlyWrappedData> = {};
  if (snapshot.subscriptionMonthlyBurn !== undefined) {
    phase5.subscriptionMonthlyBurn = snapshot.subscriptionMonthlyBurn;
    // Read subscription details from storage for richer slide data
    try {
      const { getSubscriptions } = await import("@/lib/fullwallet/storage");
      const { calculateSubscriptionStats } = await import("@/lib/fullwallet/calculations");
      const subs = await getSubscriptions();
      const subStats = calculateSubscriptionStats(subs);
      phase5.subscriptionCount = subStats.count;
      phase5.unusedSubscriptionCount = subStats.unusedSubs.length;
      if (subStats.unusedSubs.length > 0) {
        const topUnused = subStats.unusedSubs.sort((a, b) => b.monthlyCost - a.monthlyCost)[0];
        phase5.topUnusedSub = { name: topUnused.name, cost: topUnused.monthlyCost };
      }
    } catch {
      phase5.subscriptionCount = 0;
      phase5.unusedSubscriptionCount = 0;
    }
  }
  if (snapshot.netWorth !== undefined) {
    phase5.netWorth = snapshot.netWorth;
    if (prevSnapshot?.netWorth !== undefined) {
      phase5.netWorthDelta = snapshot.netWorth - prevSnapshot.netWorth;
    }
  }
  if (snapshot.savingsBalance !== undefined) {
    phase5.savingsThisMonth = snapshot.savingsBalance;
  }
  if (snapshot.monthlyIncome !== undefined && snapshot.monthlyIncome > 0) {
    phase5.monthlyIncome = snapshot.monthlyIncome;
    try {
      const { computeFinancialScore } = await import("@/lib/fullwallet/score");
      const fs = computeFinancialScore(snapshot.walletScore, {});
      phase5.financialScore = fs.total;
      phase5.financialScoreLabel = fs.label;
      phase5.financialScoreColor = fs.color;

      const annualIncome = snapshot.monthlyIncome * 12;
      const annualFees = snapshot.totalAnnualFees;
      const annualCaptured = snapshot.totalBenefitsCaptured;
      const annualSubBurn = (snapshot.subscriptionMonthlyBurn ?? 0) * 12;
      const annualSavings = (snapshot.savingsBalance ?? 0) * 12;
      if (annualIncome > 0) {
        phase5.moneyRatios = {
          feesOverIncome: (annualFees / annualIncome) * 100,
          capturedOverIncome: (annualCaptured / annualIncome) * 100,
          subsOverIncome: (annualSubBurn / annualIncome) * 100,
          savingsOverIncome: (annualSavings / annualIncome) * 100,
        };
      }
    } catch {
      // Financial score not available
    }
  }

  return {
    month: monthKey,
    monthLabel: getMonthLabel(monthKey),
    isFirstMonth,
    benefitsCapturedValue,
    benefitsWastedValue,
    captureRate,
    captureRateDelta,
    walletValueStart,
    walletValueEnd,
    walletDelta,
    pointsEarned,
    pointsRedeemed,
    bestCard,
    worstCard,
    streakCount: snapshot.streakCount,
    badgesUnlocked,
    challengesCompleted,
    challengesTotal,
    biggestMisses,
    totalWastedMonth: benefitsWastedValue,
    totalWastedYear,
    walletScore: snapshot.walletScore,
    walletScoreLabel: scoreLabel.label,
    ...phase5,
  };
}

// --- Build Year in Review ---

export async function buildYearInReview(
  year: number
): Promise<YearInReviewData | null> {
  const allSnapshots = await getAllMonthlySnapshots();

  // Filter snapshots for this year
  const yearSnapshots: MonthlySnapshot[] = [];
  for (let m = 1; m <= 12; m++) {
    const key = `${year}-${String(m).padStart(2, "0")}`;
    if (allSnapshots[key]) {
      yearSnapshots.push(allSnapshots[key]);
    }
  }

  if (yearSnapshots.length < 3) return null;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const isPartialYear = year === currentYear && currentMonth < 12;
  const isMidYear = year === currentYear && currentMonth >= 6 && currentMonth < 12;

  const events = await getEventsForYear(year);

  // Slide 1: At a glance
  const totalCaptured = sumEventValues(events, "benefit_marked_used", "value");
  const totalWasted = sumEventValues(events, "benefit_expired_unused", "value");
  const lastSnapshot = yearSnapshots[yearSnapshots.length - 1];
  const totalFees = lastSnapshot.totalAnnualFees;
  const averageCaptureRate =
    yearSnapshots.reduce((sum, s) => sum + s.captureRate, 0) /
    yearSnapshots.length;
  const totalPointsValue = lastSnapshot.totalPointsValue;
  const netRoi = totalCaptured + totalPointsValue - totalFees;
  const netRoiPercent = totalFees > 0 ? (netRoi / totalFees) * 100 : 0;

  // Slide 2: Wallet journey
  const walletValueByMonth: number[] = [];
  const monthLabels: string[] = [];
  let peakMonth = { month: "", value: 0 };
  let troughMonth = { month: "", value: Infinity };

  for (let m = 1; m <= 12; m++) {
    const key = `${year}-${String(m).padStart(2, "0")}`;
    const snap = allSnapshots[key];
    if (snap) {
      walletValueByMonth.push(snap.walletValue);
      monthLabels.push(MONTH_LABELS_SHORT[m - 1]);
      const label = MONTH_NAMES[m - 1];
      if (snap.walletValue > peakMonth.value) {
        peakMonth = { month: label, value: snap.walletValue };
      }
      if (snap.walletValue < troughMonth.value) {
        troughMonth = { month: label, value: snap.walletValue };
      }
    }
  }
  if (troughMonth.value === Infinity) {
    troughMonth = { month: "", value: 0 };
  }

  // Slide 3: Cards ranked
  const cardGrades = lastSnapshot.cardGrades;
  const cardCapturedYear: Record<string, number> = {};
  events
    .filter((e) => e.type === "benefit_marked_used")
    .forEach((e) => {
      const slug = (e.data.cardSlug as string) || "";
      cardCapturedYear[slug] =
        (cardCapturedYear[slug] || 0) + ((e.data.value as number) || 0);
    });

  const cardRankings = Object.entries(cardGrades)
    .map(([slug, info]) => ({
      slug,
      name: slug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
      grade: info.grade,
      captured: cardCapturedYear[slug] || 0,
      fee: 0, // We don't have per-card fee in snapshot, use 0 as placeholder
    }))
    .sort((a, b) => b.captured - a.captured);

  const portfolioAverageGrade = computeAverageGrade(cardGrades);

  // Slides 4 & 5: Best/Worst month
  const monthStats = yearSnapshots.map((snap) => {
    const [, mStr] = snap.month.split("-");
    const mIndex = parseInt(mStr, 10) - 1;
    return {
      month: snap.month,
      monthLabel: MONTH_NAMES[mIndex],
      captureRate: snap.captureRate,
      captured: snap.totalBenefitsCaptured,
      walletScore: snap.walletScore,
      wasted: 0, // We'll compute below
    };
  });

  // Compute wasted per month from events
  for (const stat of monthStats) {
    const [y, mStr] = stat.month.split("-");
    const monthEvents = await getEventsForMonth(
      parseInt(y, 10),
      parseInt(mStr, 10) - 1
    );
    stat.wasted = sumEventValues(monthEvents, "benefit_expired_unused", "value");
  }

  const sortedByCapture = [...monthStats].sort(
    (a, b) => b.captureRate - a.captureRate
  );
  const bestMonthStat = sortedByCapture[0];
  const worstMonthStat = sortedByCapture[sortedByCapture.length - 1];

  const bestMonth = {
    month: bestMonthStat.month,
    monthLabel: bestMonthStat.monthLabel,
    captureRate: bestMonthStat.captureRate,
    captured: bestMonthStat.captured,
    walletScore: bestMonthStat.walletScore,
    highlight: getBestMonthVerdict(bestMonthStat.captureRate, bestMonthStat.captured),
  };

  const worstMonth = {
    month: worstMonthStat.month,
    monthLabel: worstMonthStat.monthLabel,
    captureRate: worstMonthStat.captureRate,
    captured: worstMonthStat.captured,
    wasted: worstMonthStat.wasted,
    verdict: getWorstMonthVerdict(
      worstMonthStat.captureRate,
      worstMonthStat.wasted,
      worstMonthStat.monthLabel
    ),
  };

  // Slide 6: Grade story (top 2 cards by activity)
  const topCards = cardRankings.slice(0, 2);
  const gradeStories = topCards.map((card) => {
    const grades: string[] = [];
    for (let m = 1; m <= 12; m++) {
      const key = `${year}-${String(m).padStart(2, "0")}`;
      const snap = allSnapshots[key];
      if (snap && snap.cardGrades[card.slug]) {
        grades.push(snap.cardGrades[card.slug].grade);
      }
    }
    const startGrade = grades[0] || "N/A";
    const endGrade = grades[grades.length - 1] || "N/A";
    return {
      slug: card.slug,
      name: card.name,
      grades,
      startGrade,
      endGrade,
      verdict: getGradeStoryVerdict(card.name, startGrade, endGrade),
    };
  });

  // Slide 7: Points portfolio
  const totalPointsEarned = events
    .filter(
      (e) =>
        e.type === "points_balance_updated" && ((e.data.delta as number) || 0) > 0
    )
    .reduce((sum, e) => sum + ((e.data.delta as number) || 0), 0);

  const totalPointsRedeemed = events
    .filter((e) => e.type === "points_redeemed")
    .reduce((sum, e) => sum + ((e.data.amount as number) || 0), 0);

  const totalPointsRedeemedValue = events
    .filter((e) => e.type === "points_redeemed")
    .reduce((sum, e) => sum + ((e.data.value as number) || 0), 0);

  const currentPointsBalance = Object.values(
    lastSnapshot.pointsBalances
  ).reduce((a, b) => a + b, 0);
  const currentPointsValue = lastSnapshot.totalPointsValue;

  // Best redemption
  const redemptions = events
    .filter((e) => e.type === "points_redeemed")
    .map((e) => ({
      program: (e.data.program as string) || "Unknown",
      amount: (e.data.amount as number) || 0,
      value: (e.data.value as number) || 0,
      cppAchieved:
        (e.data.amount as number) > 0
          ? ((e.data.value as number) / (e.data.amount as number)) * 100
          : 0,
    }))
    .sort((a, b) => b.value - a.value);

  const bestRedemption = redemptions[0] || undefined;

  // Slide 8: Milestones
  const badgesUnlocked = events
    .filter((e) => e.type === "badge_unlocked")
    .map((e) => ({
      id: (e.data.badgeId as string) || "",
      name: (e.data.badgeName as string) || "",
      icon: (e.data.badgeIcon as string) || "",
    }));

  const longestStreak = Math.max(
    ...yearSnapshots.map((s) => s.streakCount),
    0
  );
  const totalChallengesCompleted = countEvents(events, "challenge_completed");
  const totalChallengesAvailable = countEvents(events, "challenge_generated");
  const totalRoasts = countEvents(events, "roast_generated");

  // Slide 9: Money saved
  const totalSaved = totalCaptured + totalPointsRedeemedValue;
  const totalWastedBenefits = totalWasted;
  const totalFeePaid = totalFees;
  const netValue = totalSaved - totalFeePaid;
  const netReturnPercent =
    totalFeePaid > 0 ? (totalSaved / totalFeePaid) * 100 : 0;
  const heroVerdict = getHeroVerdict(totalFeePaid, totalSaved, netReturnPercent);

  // Projections (mid-year)
  const monthsElapsed = yearSnapshots.length;
  const projectedCaptured = isMidYear
    ? Math.round((totalCaptured / monthsElapsed) * 12)
    : undefined;
  const projectedCaptureRate = isMidYear
    ? Math.round(averageCaptureRate)
    : undefined;

  // Phase 5 year-level aggregations
  const yearPhase5: Partial<YearInReviewData> = {};
  const snapsWithSubs = yearSnapshots.filter((s) => s.subscriptionMonthlyBurn !== undefined);
  if (snapsWithSubs.length > 0) {
    yearPhase5.averageSubscriptionBurn =
      snapsWithSubs.reduce((sum, s) => sum + (s.subscriptionMonthlyBurn ?? 0), 0) / snapsWithSubs.length;
  }
  const snapsWithNW = yearSnapshots.filter((s) => s.netWorth !== undefined);
  if (snapsWithNW.length >= 2) {
    yearPhase5.netWorthStart = snapsWithNW[0].netWorth;
    yearPhase5.netWorthEnd = snapsWithNW[snapsWithNW.length - 1].netWorth;
    yearPhase5.netWorthDelta = (yearPhase5.netWorthEnd ?? 0) - (yearPhase5.netWorthStart ?? 0);
  }
  const snapsWithSavings = yearSnapshots.filter((s) => s.savingsBalance !== undefined);
  if (snapsWithSavings.length > 0) {
    yearPhase5.totalSavings = snapsWithSavings.reduce(
      (sum, s) => sum + (s.savingsBalance ?? 0), 0
    );
  }

  return {
    year,
    isPartialYear,
    isMidYear,
    totalCaptured,
    totalWasted,
    averageCaptureRate: Math.round(averageCaptureRate),
    totalFees,
    netRoi: Math.round(netRoi),
    netRoiPercent: Math.round(netRoiPercent),
    walletValueByMonth,
    monthLabels,
    peakMonth,
    troughMonth,
    cardRankings,
    portfolioAverageGrade,
    bestMonth,
    worstMonth,
    gradeStories,
    totalPointsEarned,
    totalPointsRedeemed,
    totalPointsRedeemedValue,
    currentPointsBalance,
    currentPointsValue,
    bestRedemption,
    badgesUnlocked,
    longestStreak,
    totalChallengesCompleted,
    totalChallengesAvailable,
    totalRoasts,
    totalSaved,
    totalWastedBenefits,
    totalFeePaid,
    netValue,
    netReturnPercent: Math.round(netReturnPercent),
    heroVerdict,
    projectedCaptured,
    projectedCaptureRate,
    ...yearPhase5,
  };
}

// --- Available Wrapped Months ---

export async function getAvailableWrappedMonths(): Promise<string[]> {
  const snapshots = await getAllMonthlySnapshots();
  const now = new Date();
  const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  return Object.keys(snapshots)
    .filter((key) => key < currentKey) // Only past months
    .sort()
    .reverse();
}

export async function getAvailableYears(): Promise<number[]> {
  const snapshots = await getAllMonthlySnapshots();
  const years = new Set<number>();
  Object.keys(snapshots).forEach((key) => {
    years.add(parseInt(key.split("-")[0], 10));
  });
  return Array.from(years).sort().reverse();
}

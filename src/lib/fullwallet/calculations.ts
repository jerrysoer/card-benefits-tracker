import type {
  Subscription,
  SubscriptionStats,
  NetWorthSnapshot,
  SavingsEntry,
  MoneyRatios,
  MilestoneProjections,
} from "./types";

export function calculateSubscriptionStats(
  subs: Subscription[]
): SubscriptionStats {
  const monthlyTotal = subs.reduce((sum, s) => sum + s.monthlyCost, 0);
  const unusedSubs = subs.filter((s) => !s.usedThisMonth);
  const categoryBreakdown: Record<string, number> = {};
  for (const sub of subs) {
    categoryBreakdown[sub.category] =
      (categoryBreakdown[sub.category] || 0) + sub.monthlyCost;
  }

  return {
    count: subs.length,
    monthlyTotal,
    annualTotal: monthlyTotal * 12,
    usedCount: subs.length - unusedSubs.length,
    unusedSubs,
    categoryBreakdown,
  };
}

export function calculateNetWorth(
  cash: number,
  investments: number,
  pointsValue: number,
  debt: number
): number {
  return cash + investments + pointsValue - debt;
}

export function calculateLinearProjection(
  snapshots: NetWorthSnapshot[],
  targetValue?: number
): { monthsToTarget: number | null; projectedMonthlyGrowth: number } {
  if (snapshots.length < 2) {
    return { monthsToTarget: null, projectedMonthlyGrowth: 0 };
  }

  // Calculate average monthly growth from all snapshots
  const first = snapshots[0];
  const last = snapshots[snapshots.length - 1];
  const firstDate = new Date(first.date);
  const lastDate = new Date(last.date);
  const monthsBetween = Math.max(
    1,
    (lastDate.getFullYear() - firstDate.getFullYear()) * 12 +
      (lastDate.getMonth() - firstDate.getMonth())
  );
  const projectedMonthlyGrowth =
    (last.netWorth - first.netWorth) / monthsBetween;

  if (!targetValue || projectedMonthlyGrowth <= 0) {
    return { monthsToTarget: null, projectedMonthlyGrowth };
  }

  const remaining = targetValue - last.netWorth;
  if (remaining <= 0) {
    return { monthsToTarget: 0, projectedMonthlyGrowth };
  }

  const monthsToTarget = Math.ceil(remaining / projectedMonthlyGrowth);
  return { monthsToTarget, projectedMonthlyGrowth };
}

export function estimateSavingsFromNetWorth(
  snapshots: NetWorthSnapshot[]
): number | null {
  if (snapshots.length < 2) return null;
  const prev = snapshots[snapshots.length - 2];
  const curr = snapshots[snapshots.length - 1];
  // Savings estimate: change in cash + debt payments (debt decreased)
  const cashDelta = curr.cash - prev.cash;
  const debtPayment = Math.max(0, prev.debt - curr.debt);
  return cashDelta + debtPayment;
}

export function calculateAverageMonthlySavings(
  entries: SavingsEntry[]
): number {
  if (entries.length === 0) return 0;
  const total = entries.reduce((sum, e) => sum + e.amount, 0);
  return total / entries.length;
}

export function calculateMilestoneProjections(
  avgMonthlySavings: number,
  currentSavings: number,
  monthlyExpenses?: number
): MilestoneProjections {
  if (avgMonthlySavings <= 0) {
    return { emergencyFund: null, fiftyK: null, hundredK: null };
  }

  // Emergency fund: 3 months of expenses (use monthlyExpenses or $10K fallback)
  const emergencyTarget = monthlyExpenses ? monthlyExpenses * 3 : 10000;
  const emergencyRemaining = emergencyTarget - currentSavings;
  const emergencyFund =
    emergencyRemaining <= 0
      ? 0
      : Math.ceil(emergencyRemaining / avgMonthlySavings);

  const fiftyKRemaining = 50000 - currentSavings;
  const fiftyK =
    fiftyKRemaining <= 0
      ? 0
      : Math.ceil(fiftyKRemaining / avgMonthlySavings);

  const hundredKRemaining = 100000 - currentSavings;
  const hundredK =
    hundredKRemaining <= 0
      ? 0
      : Math.ceil(hundredKRemaining / avgMonthlySavings);

  return { emergencyFund, fiftyK, hundredK };
}

export function calculateMoneyRatios(
  annualIncome: number,
  annualFees: number,
  annualCaptured: number,
  annualSubBurn: number,
  annualSavings: number
): MoneyRatios {
  if (annualIncome <= 0) {
    return {
      feesOverIncome: 0,
      capturedOverIncome: 0,
      subsOverIncome: 0,
      savingsOverIncome: 0,
    };
  }

  return {
    feesOverIncome: (annualFees / annualIncome) * 100,
    capturedOverIncome: (annualCaptured / annualIncome) * 100,
    subsOverIncome: (annualSubBurn / annualIncome) * 100,
    savingsOverIncome: (annualSavings / annualIncome) * 100,
  };
}

import { storage } from "./adapter";
import { STORAGE_KEYS } from "./keys";

export interface MonthlySnapshot {
  month: string;
  capturedAt: string;
  walletValue: number;
  walletScore: number;
  totalCards: number;
  totalAnnualFees: number;
  totalBenefitsCaptured: number;
  totalBenefitsAvailable: number;
  captureRate: number;
  totalPointsValue: number;
  pointsBalances: Record<string, number>;
  cardGrades: Record<string, { grade: string; roi: number }>;
  streakCount: number;
  badgesUnlocked: number;
  challengesCompleted: number;
  // Phase 5 (nullable)
  subscriptionMonthlyBurn?: number;
  netWorth?: number;
  savingsBalance?: number;
  monthlyIncome?: number;
}

export function getCurrentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export async function captureMonthlySnapshot(
  snapshot: MonthlySnapshot
): Promise<void> {
  const snapshots = await storage.get<Record<string, MonthlySnapshot>>(
    STORAGE_KEYS.monthlySnapshots,
    {}
  );

  // Only capture once per month
  if (snapshots[snapshot.month]) return;

  snapshots[snapshot.month] = snapshot;
  await storage.set(STORAGE_KEYS.monthlySnapshots, snapshots);
}

export async function getMonthlySnapshot(
  monthKey: string
): Promise<MonthlySnapshot | null> {
  const snapshots = await storage.get<Record<string, MonthlySnapshot>>(
    STORAGE_KEYS.monthlySnapshots,
    {}
  );
  return snapshots[monthKey] ?? null;
}

export async function getAllMonthlySnapshots(): Promise<
  Record<string, MonthlySnapshot>
> {
  return storage.get<Record<string, MonthlySnapshot>>(
    STORAGE_KEYS.monthlySnapshots,
    {}
  );
}

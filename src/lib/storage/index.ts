import { storage } from "./adapter";
import { STORAGE_KEYS } from "./keys";
import type { BenefitUsage, StreakData } from "@/lib/supabase/types";

export { storage } from "./adapter";
export { STORAGE_KEYS } from "./keys";
export type { StorageAdapter } from "./adapter";

// --- Points balances ---
export async function getPointsBalances(): Promise<Record<string, number>> {
  return storage.get(STORAGE_KEYS.pointsBalances, {});
}

export async function setPointsBalances(balances: Record<string, number>): Promise<void> {
  await storage.set(STORAGE_KEYS.pointsBalances, balances);
}

// --- Custom valuations (cpp overrides) ---
export async function getCustomValuations(): Promise<Record<string, number>> {
  return storage.get(STORAGE_KEYS.customValuations, {});
}

export async function setCustomValuations(valuations: Record<string, number>): Promise<void> {
  await storage.set(STORAGE_KEYS.customValuations, valuations);
}

// --- Wallet snapshots ---
export async function getWalletSnapshots(): Promise<Record<string, number>> {
  return storage.get(STORAGE_KEYS.walletSnapshots, {});
}

export async function setWalletSnapshot(monthKey: string, value: number): Promise<void> {
  const snapshots = await getWalletSnapshots();
  snapshots[monthKey] = value;
  await storage.set(STORAGE_KEYS.walletSnapshots, snapshots);
}

// --- Streak ---
export async function getStreak(): Promise<StreakData> {
  return storage.get(STORAGE_KEYS.streak, { current: 0, last_checked: "" });
}

export async function setStreak(streak: StreakData): Promise<void> {
  await storage.set(STORAGE_KEYS.streak, streak);
}

// --- Card open dates ---
export async function getCardOpenDates(): Promise<Record<string, string>> {
  return storage.get(STORAGE_KEYS.cardOpenDates, {});
}

export async function setCardOpenDate(slug: string, date: string): Promise<void> {
  const dates = await getCardOpenDates();
  dates[slug] = date;
  await storage.set(STORAGE_KEYS.cardOpenDates, dates);
}

// --- Benefit usage ---
export async function getPersistedUsage(): Promise<BenefitUsage[] | null> {
  return storage.get<BenefitUsage[] | null>(STORAGE_KEYS.benefitUsage, null);
}

export async function setPersistedUsage(usage: BenefitUsage[]): Promise<void> {
  await storage.set(STORAGE_KEYS.benefitUsage, usage);
}

import type { BenefitUsage, StreakData } from "@/lib/supabase/types";

const KEYS = {
  pointsBalances: "cardclock_points_balances",
  customValuations: "cardclock_custom_valuations",
  walletSnapshots: "cardclock_wallet_snapshots",
  streak: "cardclock_streak",
  cardOpenDates: "cardclock_card_open_dates",
  benefitUsage: "cardclock_benefit_usage",
} as const;

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

// Points balances: { [program_code]: number }
export function getPointsBalances(): Record<string, number> {
  return getItem(KEYS.pointsBalances, {});
}

export function setPointsBalances(balances: Record<string, number>): void {
  setItem(KEYS.pointsBalances, balances);
}

// Custom valuations (cpp overrides): { [program_code]: number }
export function getCustomValuations(): Record<string, number> {
  return getItem(KEYS.customValuations, {});
}

export function setCustomValuations(valuations: Record<string, number>): void {
  setItem(KEYS.customValuations, valuations);
}

// Wallet snapshots: { [YYYY_MM]: number }
export function getWalletSnapshots(): Record<string, number> {
  return getItem(KEYS.walletSnapshots, {});
}

export function setWalletSnapshot(monthKey: string, value: number): void {
  const snapshots = getWalletSnapshots();
  snapshots[monthKey] = value;
  setItem(KEYS.walletSnapshots, snapshots);
}

// Streak: { current: number, last_checked: string }
export function getStreak(): StreakData {
  return getItem(KEYS.streak, { current: 0, last_checked: "" });
}

export function setStreak(streak: StreakData): void {
  setItem(KEYS.streak, streak);
}

// Card open dates: { [card_slug]: string (ISO date) }
export function getCardOpenDates(): Record<string, string> {
  return getItem(KEYS.cardOpenDates, {});
}

export function setCardOpenDate(slug: string, date: string): void {
  const dates = getCardOpenDates();
  dates[slug] = date;
  setItem(KEYS.cardOpenDates, dates);
}

// Benefit usage persistence
export function getPersistedUsage(): BenefitUsage[] | null {
  return getItem<BenefitUsage[] | null>(KEYS.benefitUsage, null);
}

export function setPersistedUsage(usage: BenefitUsage[]): void {
  setItem(KEYS.benefitUsage, usage);
}

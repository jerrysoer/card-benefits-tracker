import { storage } from "@/lib/storage/adapter";
import { STORAGE_KEYS } from "@/lib/storage/keys";
import { logEvent } from "@/lib/storage/event-log";
import type { BenefitWithCard } from "@/lib/supabase/types";

export interface Challenge {
  id: string;
  description: string;
  benefitId: string;
  benefitName: string;
  cardSlug: string;
  cardName: string;
  benefitValue: number;
  generatedAt: string;
  weekStart: string;
  completedAt: string | null;
}

export interface ChallengeState {
  current: Challenge | null;
  completedThisMonth: number;
  totalThisMonth: number;
  history: Array<{
    id: string;
    completedAt: string | null;
    wasCompleted: boolean;
  }>;
}

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
  const monday = new Date(now.getFullYear(), now.getMonth(), diff);
  return monday.toISOString().split("T")[0];
}

function getMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export async function getChallengeState(): Promise<ChallengeState> {
  return storage.get<ChallengeState>(STORAGE_KEYS.challenges, {
    current: null,
    completedThisMonth: 0,
    totalThisMonth: 0,
    history: [],
  });
}

export async function generateChallenge(
  benefits: BenefitWithCard[]
): Promise<Challenge | null> {
  const state = await getChallengeState();
  const weekStart = getWeekStart();

  // Already have a challenge for this week
  if (state.current && state.current.weekStart === weekStart) {
    return state.current;
  }

  // If current challenge exists from previous week, archive it
  if (state.current && state.current.weekStart !== weekStart) {
    state.history.push({
      id: state.current.id,
      completedAt: state.current.completedAt,
      wasCompleted: state.current.completedAt !== null,
    });
    // Keep last 50
    if (state.history.length > 50) {
      state.history.splice(0, state.history.length - 50);
    }
  }

  // Find most urgent unused benefit
  const unusedBenefits = benefits
    .filter((b) => !b.usage?.cc_is_fully_used)
    .sort((a, b) => a.period.daysRemaining - b.period.daysRemaining);

  if (unusedBenefits.length === 0) {
    state.current = null;
    await storage.set(STORAGE_KEYS.challenges, state);
    return null;
  }

  const target = unusedBenefits[0];
  const challenge: Challenge = {
    id: `challenge-${Date.now()}`,
    description: generateChallengeText(target),
    benefitId: target.id,
    benefitName: target.cc_benefit_name,
    cardSlug: target.card.cc_card_slug,
    cardName: target.card.cc_card_name,
    benefitValue: target.cc_benefit_value,
    generatedAt: new Date().toISOString(),
    weekStart,
    completedAt: null,
  };

  // Update month counters
  const monthKey = getMonthKey();
  const currentMonthKey = state.current ? getMonthFromDate(state.current.generatedAt) : null;
  if (currentMonthKey !== monthKey) {
    state.completedThisMonth = 0;
    state.totalThisMonth = 0;
  }
  state.totalThisMonth++;

  state.current = challenge;
  await storage.set(STORAGE_KEYS.challenges, state);
  logEvent("challenge_generated", {
    benefit_id: target.id,
    benefit_name: target.cc_benefit_name,
    card_slug: target.card.cc_card_slug,
    days_remaining: target.period.daysRemaining,
  });

  return challenge;
}

function getMonthFromDate(isoDate: string): string {
  const d = new Date(isoDate);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function generateChallengeText(benefit: BenefitWithCard): string {
  const value = `$${benefit.cc_benefit_value}`;
  const name = benefit.cc_benefit_name;
  const card = benefit.card.cc_card_name;
  const days = benefit.period.daysRemaining;

  if (days <= 7) {
    return `use your ${value} ${name} on ${card} before it expires in ${days} day${days !== 1 ? "s" : ""}.`;
  }
  if (days <= 14) {
    return `your ${value} ${name} on ${card} expires soon. use it this week.`;
  }
  return `use your ${value} ${name} on ${card}. don't let it go to waste.`;
}

export async function completeChallenge(): Promise<boolean> {
  const state = await getChallengeState();
  if (!state.current || state.current.completedAt) return false;

  state.current.completedAt = new Date().toISOString();
  state.completedThisMonth++;

  await storage.set(STORAGE_KEYS.challenges, state);
  logEvent("challenge_completed", {
    challenge_id: state.current.id,
    benefit_name: state.current.benefitName,
    card_slug: state.current.cardSlug,
  });

  return true;
}

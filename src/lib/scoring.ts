import type { Card, BenefitWithCard, BenefitUsage, GradeResult } from "@/lib/supabase/types";
import { formatCurrency } from "@/lib/benefits/roi";

const NEON_GREEN = "#6B8F71";
const NEON_YELLOW = "#C8963E";
const NEON_RED = "#C4717A";
const NEON_BLUE = "#2A7C6F";

export function calculateGrade(totalCaptured: number, annualFee: number): GradeResult {
  if (annualFee === 0) {
    return { grade: "FREE", percentage: 0, color: NEON_BLUE };
  }

  const percentage = (totalCaptured / annualFee) * 100;

  if (percentage >= 200) return { grade: "A+", percentage, color: NEON_GREEN };
  if (percentage >= 150) return { grade: "A", percentage, color: NEON_GREEN };
  if (percentage >= 100) return { grade: "B", percentage, color: NEON_YELLOW };
  if (percentage >= 75) return { grade: "C", percentage, color: NEON_YELLOW };
  if (percentage >= 50) return { grade: "D", percentage, color: NEON_RED };
  return { grade: "F", percentage, color: NEON_RED };
}

// Grade sort priority (worst first for summary view)
export function getGradeSortPriority(grade: string): number {
  const order: Record<string, number> = {
    F: 0, D: 1, C: 2, B: 3, A: 4, "A+": 5, FREE: 6,
  };
  return order[grade] ?? 6;
}

function getLargestUnusedBenefit(benefits: BenefitWithCard[]): BenefitWithCard | null {
  const unused = benefits
    .filter((b) => !b.usage?.cc_is_fully_used)
    .sort((a, b) => b.cc_benefit_value - a.cc_benefit_value);
  return unused[0] ?? null;
}

const VERDICT_POOLS: Record<string, ((card: Card, largestUnused: BenefitWithCard | null) => string)[]> = {
  "A+": [
    () => "this card is printing money for you \u{1F911}",
    () => "your annual fee paid for itself twice. legend.",
    () => "you're in the top tier of card optimizers. respect.",
  ],
  A: [
    () => "solid. this card is more than earning its keep.",
    () => "you're getting every dollar's worth. keep going.",
  ],
  B: [
    (_card, unused) =>
      unused
        ? `you broke even. use your ${unused.cc_benefit_name} and you'll hit A.`
        : "you broke even. a few more credits and you're golden.",
    (_card, unused) =>
      unused
        ? `close to great. don't let ${unused.cc_benefit_name} go to waste.`
        : "close to great. keep using those credits.",
  ],
  C: [
    (_card, unused) =>
      unused
        ? `you're underwater. use your ${unused.cc_benefit_name} this month.`
        : "you're paying more than you're getting. check your unused credits.",
    (_card, unused) =>
      unused
        ? `underwater, but recoverable. ${unused.cc_benefit_name} could turn this around.`
        : "underwater, but recoverable. start using those benefits.",
  ],
  D: [
    () => "this card is costing you real money every month you ignore it.",
    (card) =>
      `you've used ${Math.round((0 / card.cc_annual_fee) * 100)}% of what you're paying for. time to decide.`,
  ],
  F: [
    (card) => `downgrade this. you're paying ${formatCurrency(card.cc_annual_fee)} to look at a metal card.`,
    () => "this card is a subscription you forgot to cancel.",
    (card) => `you've captured almost nothing of ${formatCurrency(card.cc_annual_fee)}. that's an F.`,
  ],
  FREE: [
    () => "no annual fee — this card owes you nothing.",
  ],
};

export function getVerdict(grade: string, card: Card, benefits: BenefitWithCard[]): string {
  const pool = VERDICT_POOLS[grade] ?? VERDICT_POOLS["F"];
  const largestUnused = getLargestUnusedBenefit(benefits);
  const index = Math.floor(Math.random() * pool.length);
  return pool[index](card, largestUnused);
}

// Stable verdict (uses card slug as seed for deterministic selection)
export function getStableVerdict(grade: string, card: Card, benefits: BenefitWithCard[]): string {
  const pool = VERDICT_POOLS[grade] ?? VERDICT_POOLS["F"];
  const largestUnused = getLargestUnusedBenefit(benefits);
  let hash = 0;
  for (let i = 0; i < card.cc_card_slug.length; i++) {
    hash = ((hash << 5) - hash + card.cc_card_slug.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % pool.length;
  return pool[index](card, largestUnused);
}

export function calculateWalletScore(
  captureRate: number,
  feeROIPercent: number,
  diversityScore: number,
  streakMonths: number
): number {
  const benefitsComponent = Math.min(captureRate, 100) * 0.4;
  const feeComponent = Math.min(feeROIPercent * 50 / 100, 100) * 0.3;
  const diversityComponent = Math.min(diversityScore, 100) * 0.15;
  const streakComponent = Math.min(streakMonths * 10, 100) * 0.15;

  return Math.round(benefitsComponent + feeComponent + diversityComponent + streakComponent);
}

export function calculateDiversityScore(cards: Card[]): number {
  const issuers = new Set(cards.map((c) => c.cc_issuer));
  // Score: 50 for 2+ issuers, 50 for variety (we approximate card type diversity)
  let score = 0;
  if (issuers.size >= 2) score += 50;
  if (issuers.size >= 3) score += 25;
  if (cards.length >= 3) score += 25;
  return Math.min(score, 100);
}

export function getScoreLabel(score: number): { label: string; color: string } {
  if (score >= 90) return { label: "Elite", color: NEON_GREEN };
  if (score >= 75) return { label: "Optimized", color: NEON_GREEN };
  if (score >= 60) return { label: "Room to grow", color: NEON_YELLOW };
  if (score >= 40) return { label: "Leaving money on the table", color: NEON_YELLOW };
  return { label: "Your cards are costing you", color: NEON_RED };
}

export function checkStreak(
  monthlyBenefits: BenefitWithCard[],
  usage: BenefitUsage[],
  month: string // YYYY-MM format
): boolean {
  const [year, monthNum] = month.split("-").map(Number);
  const monthStart = new Date(year, monthNum - 1, 1);
  const monthEnd = new Date(year, monthNum, 0);
  const startStr = monthStart.toISOString().split("T")[0];
  const endStr = monthEnd.toISOString().split("T")[0];

  const relevantBenefits = monthlyBenefits.filter(
    (b) => b.cc_benefit_period === "monthly"
  );

  if (relevantBenefits.length === 0) return false;

  const usedCount = relevantBenefits.filter((b) => {
    return usage.some(
      (u) =>
        u.cc_benefit_id === b.id &&
        u.cc_is_fully_used &&
        u.cc_period_start >= startStr &&
        u.cc_period_start <= endStr
    );
  }).length;

  return usedCount / relevantBenefits.length >= 0.8;
}

export function getVerdictForDowngrade(
  grade: string,
  card: Card,
  downgrade?: { name: string; fee: number } | null,
  totalCaptured?: number
): { verdict: string; emoji: string; action: string } {
  const fee = card.cc_annual_fee;
  const hasValue = totalCaptured != null;
  const diff = hasValue ? totalCaptured - fee : 0;
  const diffLabel = hasValue
    ? `${formatCurrency(Math.abs(diff))} ${diff >= 0 ? "more" : "less"} than the annual fee`
    : "";
  const valuePrefix = hasValue
    ? `you're getting ${formatCurrency(totalCaptured)} value, ${diffLabel}.`
    : "";

  switch (grade) {
    case "A+":
    case "A":
    case "B":
      return {
        verdict: hasValue
          ? `${valuePrefix} keep it.`
          : `you're getting ${formatCurrency(fee)} worth. keep it.`,
        emoji: "\u2705",
        action: "KEEP",
      };
    case "C":
      return {
        verdict: hasValue
          ? downgrade
            ? `${valuePrefix} use more benefits or downgrade to ${downgrade.name}.`
            : `${valuePrefix} use more benefits before renewal.`
          : downgrade
            ? `close call. use more benefits or downgrade to ${downgrade.name}.`
            : "close call. use more benefits before renewal.",
        emoji: "\u{1F914}",
        action: "EVALUATE",
      };
    case "D":
      return {
        verdict: hasValue
          ? downgrade
            ? `${valuePrefix} downgrade to ${downgrade.name} and save ${formatCurrency(fee - downgrade.fee)}/yr.`
            : `${valuePrefix} consider downgrading.`
          : downgrade
            ? `downgrade to ${downgrade.name} and save ${formatCurrency(fee - downgrade.fee)}/yr.`
            : "you're not using enough to justify the fee. consider downgrading.",
        emoji: "\u26A0\uFE0F",
        action: "DOWNGRADE",
      };
    case "F":
      return {
        verdict: hasValue
          ? downgrade
            ? `${valuePrefix} cancel or downgrade to ${downgrade.name} before the fee hits.`
            : `${valuePrefix} cancel before the fee hits.`
          : downgrade
            ? `cancel or downgrade to ${downgrade.name} before the fee hits.`
            : "this card is a net loss. cancel before the fee hits.",
        emoji: "\u274C",
        action: "CANCEL",
      };
    default:
      return { verdict: "no annual fee to worry about.", emoji: "\u2705", action: "FREE" };
  }
}

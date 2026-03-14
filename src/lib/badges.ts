import { storage } from "@/lib/storage/adapter";
import { STORAGE_KEYS } from "@/lib/storage/keys";
import { logEvent } from "@/lib/storage/event-log";
import type { CardROI, BenefitWithCard } from "@/lib/supabase/types";
import { calculateGrade } from "@/lib/scoring";
import badgesData from "../../data/badges.json";

export interface BadgeDefinition {
  id: string;
  name: string;
  icon: string;
  description: string;
  hint: string;
  tier: "bronze" | "silver" | "gold" | "platinum";
}

export interface BadgeState {
  [badgeId: string]: { unlockedAt: string };
}

export interface BadgeContext {
  cardROIs: CardROI[];
  benefits: BenefitWithCard[];
  totalPoints: number;
  streakMonths: number;
  walletScore: number;
  hasRoasted: boolean;
  hasCompletedChallenge: boolean;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = badgesData.badges as BadgeDefinition[];
export const TOTAL_BADGES = BADGE_DEFINITIONS.length;

const TIER_PRIORITY: Record<string, number> = {
  platinum: 4,
  gold: 3,
  silver: 2,
  bronze: 1,
};

export function getBadgesByTier(badges: BadgeDefinition[]): BadgeDefinition[] {
  return [...badges].sort(
    (a, b) => (TIER_PRIORITY[b.tier] ?? 0) - (TIER_PRIORITY[a.tier] ?? 0)
  );
}

export const TIER_COLORS: Record<string, { border: string; bg: string }> = {
  bronze: { border: "#CD7F32", bg: "rgba(205,127,50,0.1)" },
  silver: { border: "#C0C0C0", bg: "rgba(192,192,192,0.1)" },
  gold: { border: "#FFD700", bg: "rgba(255,215,0,0.1)" },
  platinum: { border: "#39FF14", bg: "rgba(57,255,20,0.1)" },
};

function checkCondition(badge: BadgeDefinition, ctx: BadgeContext): boolean {
  switch (badge.id) {
    case "first_blood":
      return ctx.benefits.some((b) => b.usage?.cc_is_fully_used);

    case "break_even":
      return ctx.cardROIs.some((r) => {
        const g = calculateGrade(r.totalCaptured, r.annualFee);
        return g.grade === "B" || g.grade === "A" || g.grade === "A+";
      });

    case "money_printer":
      return ctx.cardROIs.some((r) => {
        const g = calculateGrade(r.totalCaptured, r.annualFee);
        return g.grade === "A+";
      });

    case "diversified": {
      const issuers = new Set(ctx.cardROIs.map((r) => r.card.cc_issuer));
      return issuers.size >= 3;
    }

    case "point_millionaire":
      return ctx.totalPoints >= 100000;

    case "streak_starter":
      return ctx.streakMonths >= 3;

    case "streak_lord":
      return ctx.streakMonths >= 6;

    case "full_send": {
      const monthlyBenefits = ctx.benefits.filter(
        (b) => b.cc_benefit_period === "monthly"
      );
      return (
        monthlyBenefits.length > 0 &&
        monthlyBenefits.every((b) => b.usage?.cc_is_fully_used)
      );
    }

    case "stacked":
      return ctx.cardROIs.length >= 5;

    case "zero_waste": {
      const monthlyBenefits = ctx.benefits.filter(
        (b) => b.cc_benefit_period === "monthly"
      );
      return (
        monthlyBenefits.length > 0 &&
        monthlyBenefits.every(
          (b) => b.usage?.cc_is_fully_used || b.period.daysRemaining > 0
        )
      );
    }

    case "fee_crusher":
      return (
        ctx.cardROIs.length > 0 &&
        ctx.cardROIs.every((r) => {
          const g = calculateGrade(r.totalCaptured, r.annualFee);
          return (
            g.grade === "B" ||
            g.grade === "A" ||
            g.grade === "A+" ||
            g.grade === "FREE"
          );
        })
      );

    case "points_hoarder":
      return ctx.totalPoints >= 500000;

    case "wallet_elite":
      return ctx.walletScore >= 90;

    case "roasted":
      return ctx.hasRoasted;

    case "challenger":
      return ctx.hasCompletedChallenge;

    default:
      return false;
  }
}

export async function checkAllBadges(
  ctx: BadgeContext
): Promise<{ allBadges: BadgeState; newlyUnlocked: BadgeDefinition[] }> {
  const currentState = await storage.get<BadgeState>(STORAGE_KEYS.badges, {});
  const newlyUnlocked: BadgeDefinition[] = [];

  for (const badge of BADGE_DEFINITIONS) {
    if (currentState[badge.id]) continue;

    if (checkCondition(badge, ctx)) {
      currentState[badge.id] = { unlockedAt: new Date().toISOString() };
      newlyUnlocked.push(badge);
      logEvent("badge_unlocked", {
        badge_id: badge.id,
        badge_name: badge.name,
        badge_tier: badge.tier,
      });
    }
  }

  if (newlyUnlocked.length > 0) {
    await storage.set(STORAGE_KEYS.badges, currentState);
  }

  return { allBadges: currentState, newlyUnlocked };
}

export async function getBadgeState(): Promise<BadgeState> {
  return storage.get<BadgeState>(STORAGE_KEYS.badges, {});
}

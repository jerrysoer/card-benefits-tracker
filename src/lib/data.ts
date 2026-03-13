import {
  isDemoMode,
  DEMO_CARDS,
  DEMO_BENEFITS,
  DEMO_USER_CARDS,
  DEMO_USAGE,
  getDemoCardsWithBenefits,
} from "@/lib/demo/data";
import type {
  Card,
  Benefit,
  UserCard,
  BenefitUsage,
  BenefitWithCard,
  CardWithBenefits,
  CardROI,
  PortfolioSummary,
} from "@/lib/supabase/types";
import { getCurrentPeriod } from "@/lib/benefits/deadline";
import { getUrgencyState, getUrgencySortPriority } from "@/lib/benefits/urgency";
import { calculateCardROI, calculatePortfolioSummary } from "@/lib/benefits/roi";

/**
 * Get all available cards with their benefits
 */
export async function getAllCards(): Promise<CardWithBenefits[]> {
  if (isDemoMode()) {
    return getDemoCardsWithBenefits();
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const { data: cards } = await supabase
    .from("cc_cards")
    .select("*")
    .eq("cc_is_active", true)
    .order("cc_issuer");

  if (!cards) return [];

  const { data: benefits } = await supabase
    .from("cc_benefits")
    .select("*")
    .eq("cc_is_active", true);

  return cards.map((card: Card) => ({
    ...card,
    benefits: (benefits || []).filter((b: Benefit) => b.cc_card_id === card.id),
  }));
}

/**
 * Get user's card portfolio with benefits and usage
 */
export async function getUserPortfolio(): Promise<{
  userCards: UserCard[];
  benefits: BenefitWithCard[];
  cardROIs: CardROI[];
  summary: PortfolioSummary;
}> {
  if (isDemoMode()) {
    return getDemoPortfolio();
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return emptyPortfolio();
  }

  const [userCardsRes, cardsRes, benefitsRes, usageRes] = await Promise.all([
    supabase.from("cc_user_cards").select("*").eq("user_id", user.id).eq("cc_is_active", true),
    supabase.from("cc_cards").select("*").eq("cc_is_active", true),
    supabase.from("cc_benefits").select("*").eq("cc_is_active", true),
    supabase.from("cc_benefit_usage").select("*").eq("user_id", user.id),
  ]);

  const userCards = userCardsRes.data || [];
  const cards = cardsRes.data || [];
  const benefits = benefitsRes.data || [];
  const usage = usageRes.data || [];

  return buildPortfolio(userCards, cards, benefits, usage);
}

function getDemoPortfolio() {
  return buildPortfolio(
    DEMO_USER_CARDS,
    DEMO_CARDS,
    DEMO_BENEFITS,
    DEMO_USAGE
  );
}

function buildPortfolio(
  userCards: UserCard[],
  cards: Card[],
  benefits: Benefit[],
  usage: BenefitUsage[]
): {
  userCards: UserCard[];
  benefits: BenefitWithCard[];
  cardROIs: CardROI[];
  summary: PortfolioSummary;
} {
  const now = new Date();
  const cardMap = new Map(cards.map((c) => [c.id, c]));

  const enrichedBenefits: BenefitWithCard[] = [];
  const cardROIs: CardROI[] = [];

  for (const uc of userCards) {
    const card = cardMap.get(uc.cc_card_id);
    if (!card) continue;

    const cardBenefits = benefits.filter((b) => b.cc_card_id === card.id);
    const cardUsage = usage.filter((u) => u.cc_user_card_id === uc.id);
    const openDate = uc.cc_card_open_date
      ? new Date(uc.cc_card_open_date)
      : null;

    for (const benefit of cardBenefits) {
      const period = getCurrentPeriod(benefit, openDate, now);
      const benefitUsage = usage.find(
        (u) =>
          u.cc_benefit_id === benefit.id &&
          u.cc_period_start === period.start.toISOString().split("T")[0]
      );

      const urgency = getUrgencyState(period.daysRemaining);

      enrichedBenefits.push({
        ...benefit,
        card,
        userCard: uc,
        usage: benefitUsage || null,
        period: {
          start: period.start,
          end: period.end,
          daysRemaining: period.daysRemaining,
        },
        urgency,
      });
    }

    cardROIs.push(calculateCardROI(card, uc, cardBenefits, cardUsage));
  }

  // Sort: used last, then by urgency priority, then by days remaining
  enrichedBenefits.sort((a, b) => {
    const aUsed = a.usage?.cc_is_fully_used ? 1 : 0;
    const bUsed = b.usage?.cc_is_fully_used ? 1 : 0;
    if (aUsed !== bUsed) return aUsed - bUsed;

    const aUrgency = getUrgencySortPriority(
      a.usage?.cc_is_fully_used ? "used" : a.urgency
    );
    const bUrgency = getUrgencySortPriority(
      b.usage?.cc_is_fully_used ? "used" : b.urgency
    );
    if (aUrgency !== bUrgency) return aUrgency - bUrgency;

    return a.period.daysRemaining - b.period.daysRemaining;
  });

  const summary = calculatePortfolioSummary(cardROIs);

  return { userCards, benefits: enrichedBenefits, cardROIs, summary };
}

function emptyPortfolio() {
  return {
    userCards: [],
    benefits: [],
    cardROIs: [],
    summary: {
      totalCards: 0,
      totalAnnualFees: 0,
      totalBenefitValue: 0,
      totalCaptured: 0,
      totalWasted: 0,
      netROI: 0,
      captureRate: 0,
    },
  };
}

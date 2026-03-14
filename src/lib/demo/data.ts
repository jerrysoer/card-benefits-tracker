import type {
  Card,
  Benefit,
  UserCard,
  BenefitUsage,
  CardWithBenefits,
  BenefitCategory,
} from "@/lib/supabase/types";
import cardsJson from "../../../data/cards.json";

// Demo mode: provides sample data when Supabase is not configured
// Cards and benefits are loaded from data/cards.json (source of truth)

const DEMO_USER_ID = "demo-user-00000000-0000-0000-0000-000000000000";

const now = new Date().toISOString();

interface RawBenefit {
  name: string;
  value: number;
  period: string;
  period_count: number;
  category: string;
  reset_type: string;
  merchant_notes?: string;
  activation_required: boolean;
  activation_notes?: string;
}

interface RawCard {
  slug: string;
  name: string;
  issuer: string;
  annual_fee: number;
  benefits: RawBenefit[];
}

function buildCardsAndBenefits(): { cards: Card[]; benefits: Benefit[] } {
  const cards: Card[] = [];
  const benefits: Benefit[] = [];

  for (const raw of (cardsJson as { cards: RawCard[] }).cards) {
    const cardId = `card-${raw.slug}`;

    cards.push({
      id: cardId,
      cc_card_name: raw.name,
      cc_issuer: raw.issuer,
      cc_annual_fee: raw.annual_fee,
      cc_card_slug: raw.slug,
      cc_logo_url: null,
      cc_is_active: true,
      created_at: now,
      updated_at: now,
    });

    for (let i = 0; i < raw.benefits.length; i++) {
      const b = raw.benefits[i];
      benefits.push({
        id: `ben-${raw.slug}-${i}`,
        cc_card_id: cardId,
        cc_benefit_name: b.name,
        cc_benefit_value: b.value,
        cc_benefit_period: b.period as Benefit["cc_benefit_period"],
        cc_period_count: b.period_count,
        cc_annual_total: b.value * b.period_count,
        cc_reset_type: b.reset_type as Benefit["cc_reset_type"],
        cc_category: b.category as BenefitCategory,
        cc_merchant_notes: b.merchant_notes ?? null,
        cc_activation_required: b.activation_required,
        cc_activation_notes: b.activation_notes ?? null,
        cc_is_active: true,
        created_at: now,
        updated_at: now,
      });
    }
  }

  return { cards, benefits };
}

const { cards: DEMO_CARDS, benefits: DEMO_BENEFITS } = buildCardsAndBenefits();

export { DEMO_CARDS, DEMO_BENEFITS };

// Demo portfolio uses a subset of cards for a realistic preview
const DEMO_PORTFOLIO_SLUGS = [
  "amex-platinum",
  "amex-gold",
  "chase-sapphire-reserve",
  "capital-one-venture-x",
];

export const DEMO_USER_CARDS: UserCard[] = DEMO_PORTFOLIO_SLUGS.map(
  (slug, i) => ({
    id: `uc-${slug}`,
    user_id: DEMO_USER_ID,
    cc_card_id: `card-${slug}`,
    cc_card_open_date: ["2023-03-15", "2024-01-10", "2022-06-01", "2024-08-20"][i],
    cc_is_active: true,
    created_at: now,
    updated_at: now,
  })
);

// Pre-mark some benefits as used for realistic demo
export const DEMO_USAGE: BenefitUsage[] = [
  {
    id: "usage-1",
    user_id: DEMO_USER_ID,
    cc_benefit_id: findBenefitId("amex-platinum", "Uber Cash"),
    cc_user_card_id: "uc-amex-platinum",
    cc_period_start: getMonthStart().toISOString().split("T")[0],
    cc_period_end: getMonthEnd().toISOString().split("T")[0],
    cc_amount_used: 15,
    cc_is_fully_used: true,
    cc_used_at: now,
    created_at: now,
    updated_at: now,
  },
  {
    id: "usage-2",
    user_id: DEMO_USER_ID,
    cc_benefit_id: findBenefitId("amex-gold", "Uber Cash"),
    cc_user_card_id: "uc-amex-gold",
    cc_period_start: getMonthStart().toISOString().split("T")[0],
    cc_period_end: getMonthEnd().toISOString().split("T")[0],
    cc_amount_used: 10,
    cc_is_fully_used: true,
    cc_used_at: now,
    created_at: now,
    updated_at: now,
  },
];

function findBenefitId(cardSlug: string, benefitName: string): string {
  const benefit = DEMO_BENEFITS.find(
    (b) =>
      b.cc_card_id === `card-${cardSlug}` && b.cc_benefit_name === benefitName
  );
  return benefit?.id ?? `ben-${cardSlug}-unknown`;
}

function getMonthStart(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function getMonthEnd(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

export function getDemoCardsWithBenefits(): CardWithBenefits[] {
  return DEMO_CARDS.map((card) => ({
    ...card,
    benefits: DEMO_BENEFITS.filter((b) => b.cc_card_id === card.id),
  }));
}

export function getDemoUserCards(): UserCard[] {
  return DEMO_USER_CARDS;
}

export function getDemoUsage(): BenefitUsage[] {
  return DEMO_USAGE;
}

export function isDemoMode(): boolean {
  return (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export { DEMO_USER_ID };

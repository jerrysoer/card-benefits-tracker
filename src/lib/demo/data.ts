import type {
  Card,
  Benefit,
  UserCard,
  BenefitUsage,
  CardWithBenefits,
} from "@/lib/supabase/types";

// Demo mode: provides sample data when Supabase is not configured
// This allows the app to be fully functional for local development and review

const DEMO_USER_ID = "demo-user-00000000-0000-0000-0000-000000000000";

const now = new Date().toISOString();

export const DEMO_CARDS: Card[] = [
  {
    id: "card-amex-platinum",
    cc_card_name: "American Express Platinum Card",
    cc_issuer: "amex",
    cc_annual_fee: 895,
    cc_card_slug: "amex-platinum",
    cc_logo_url: null,
    cc_is_active: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: "card-amex-gold",
    cc_card_name: "American Express Gold Card",
    cc_issuer: "amex",
    cc_annual_fee: 325,
    cc_card_slug: "amex-gold",
    cc_logo_url: null,
    cc_is_active: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: "card-chase-sapphire-reserve",
    cc_card_name: "Chase Sapphire Reserve",
    cc_issuer: "chase",
    cc_annual_fee: 550,
    cc_card_slug: "chase-sapphire-reserve",
    cc_logo_url: null,
    cc_is_active: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: "card-venture-x",
    cc_card_name: "Capital One Venture X",
    cc_issuer: "capital_one",
    cc_annual_fee: 395,
    cc_card_slug: "capital-one-venture-x",
    cc_logo_url: null,
    cc_is_active: true,
    created_at: now,
    updated_at: now,
  },
];

export const DEMO_BENEFITS: Benefit[] = [
  // Amex Platinum benefits
  {
    id: "ben-plat-uber",
    cc_card_id: "card-amex-platinum",
    cc_benefit_name: "Uber Cash",
    cc_benefit_value: 15,
    cc_benefit_period: "monthly",
    cc_period_count: 12,
    cc_annual_total: 200,
    cc_reset_type: "calendar",
    cc_category: "rideshare",
    cc_merchant_notes: "Up to $15/mo ($35 in Dec). Add card to Uber account.",
    cc_activation_required: false,
    cc_activation_notes: null,
    cc_is_active: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: "ben-plat-resy",
    cc_card_id: "card-amex-platinum",
    cc_benefit_name: "Resy Restaurant Credit",
    cc_benefit_value: 100,
    cc_benefit_period: "semi_annual",
    cc_period_count: 2,
    cc_annual_total: 200,
    cc_reset_type: "calendar",
    cc_category: "dining",
    cc_merchant_notes: "U.S. Resy restaurants. No reservation required.",
    cc_activation_required: true,
    cc_activation_notes: "Enroll at amex.com/benefits",
    cc_is_active: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: "ben-plat-saks",
    cc_card_id: "card-amex-platinum",
    cc_benefit_name: "Saks Fifth Avenue Credit",
    cc_benefit_value: 50,
    cc_benefit_period: "semi_annual",
    cc_period_count: 2,
    cc_annual_total: 100,
    cc_reset_type: "calendar",
    cc_category: "shopping",
    cc_merchant_notes: "Saks.com or in-store. Jan-Jun and Jul-Dec periods.",
    cc_activation_required: true,
    cc_activation_notes: "Enroll at amex.com/benefits",
    cc_is_active: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: "ben-plat-airline",
    cc_card_id: "card-amex-platinum",
    cc_benefit_name: "Airline Fee Credit",
    cc_benefit_value: 200,
    cc_benefit_period: "annual",
    cc_period_count: 1,
    cc_annual_total: 200,
    cc_reset_type: "calendar",
    cc_category: "airline",
    cc_merchant_notes: "Select one qualifying airline. Incidental fees only.",
    cc_activation_required: true,
    cc_activation_notes: "Select airline at amex.com/benefits",
    cc_is_active: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: "ben-plat-entertainment",
    cc_card_id: "card-amex-platinum",
    cc_benefit_name: "Digital Entertainment Credit",
    cc_benefit_value: 20,
    cc_benefit_period: "monthly",
    cc_period_count: 12,
    cc_annual_total: 240,
    cc_reset_type: "calendar",
    cc_category: "streaming",
    cc_merchant_notes:
      "Disney+, Hulu, ESPN+, The New York Times, and Peacock.",
    cc_activation_required: true,
    cc_activation_notes: "Enroll at amex.com/benefits",
    cc_is_active: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: "ben-plat-walmart",
    cc_card_id: "card-amex-platinum",
    cc_benefit_name: "Walmart+ Membership",
    cc_benefit_value: 12.95,
    cc_benefit_period: "monthly",
    cc_period_count: 12,
    cc_annual_total: 155.4,
    cc_reset_type: "calendar",
    cc_category: "shopping",
    cc_merchant_notes: "Walmart+ membership credit.",
    cc_activation_required: true,
    cc_activation_notes: "Enroll at amex.com/benefits",
    cc_is_active: true,
    created_at: now,
    updated_at: now,
  },
  // Amex Gold benefits
  {
    id: "ben-gold-uber",
    cc_card_id: "card-amex-gold",
    cc_benefit_name: "Uber Cash",
    cc_benefit_value: 10,
    cc_benefit_period: "monthly",
    cc_period_count: 12,
    cc_annual_total: 120,
    cc_reset_type: "calendar",
    cc_category: "rideshare",
    cc_merchant_notes: "Up to $10/mo. Uber Eats or Uber rides.",
    cc_activation_required: false,
    cc_activation_notes: null,
    cc_is_active: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: "ben-gold-resy",
    cc_card_id: "card-amex-gold",
    cc_benefit_name: "Resy Restaurant Credit",
    cc_benefit_value: 100,
    cc_benefit_period: "annual",
    cc_period_count: 1,
    cc_annual_total: 100,
    cc_reset_type: "calendar",
    cc_category: "dining",
    cc_merchant_notes: "Book and dine through Resy.",
    cc_activation_required: true,
    cc_activation_notes: "Enroll at amex.com/benefits",
    cc_is_active: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: "ben-gold-dunkin",
    cc_card_id: "card-amex-gold",
    cc_benefit_name: "Dunkin' Credit",
    cc_benefit_value: 7,
    cc_benefit_period: "monthly",
    cc_period_count: 12,
    cc_annual_total: 84,
    cc_reset_type: "calendar",
    cc_category: "dining",
    cc_merchant_notes: "Dunkin' purchases, statement credit.",
    cc_activation_required: true,
    cc_activation_notes: "Enroll at amex.com/benefits",
    cc_is_active: true,
    created_at: now,
    updated_at: now,
  },
  // Chase Sapphire Reserve benefits
  {
    id: "ben-csr-travel",
    cc_card_id: "card-chase-sapphire-reserve",
    cc_benefit_name: "Travel Credit",
    cc_benefit_value: 300,
    cc_benefit_period: "annual",
    cc_period_count: 1,
    cc_annual_total: 300,
    cc_reset_type: "cardmember_anniversary",
    cc_category: "travel",
    cc_merchant_notes: "Automatic credit for travel purchases.",
    cc_activation_required: false,
    cc_activation_notes: null,
    cc_is_active: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: "ben-csr-doordash",
    cc_card_id: "card-chase-sapphire-reserve",
    cc_benefit_name: "DoorDash Credits",
    cc_benefit_value: 60,
    cc_benefit_period: "annual",
    cc_period_count: 1,
    cc_annual_total: 60,
    cc_reset_type: "calendar",
    cc_category: "dining",
    cc_merchant_notes: "DashPass membership + credits.",
    cc_activation_required: true,
    cc_activation_notes: "Activate via DoorDash app",
    cc_is_active: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: "ben-csr-instacart",
    cc_card_id: "card-chase-sapphire-reserve",
    cc_benefit_name: "Instacart+ Membership",
    cc_benefit_value: 60,
    cc_benefit_period: "annual",
    cc_period_count: 1,
    cc_annual_total: 60,
    cc_reset_type: "calendar",
    cc_category: "shopping",
    cc_merchant_notes: "Instacart+ membership credit.",
    cc_activation_required: true,
    cc_activation_notes: "Link card on Instacart",
    cc_is_active: true,
    created_at: now,
    updated_at: now,
  },
  // Capital One Venture X benefits
  {
    id: "ben-vx-travel",
    cc_card_id: "card-venture-x",
    cc_benefit_name: "Travel Credit",
    cc_benefit_value: 300,
    cc_benefit_period: "annual",
    cc_period_count: 1,
    cc_annual_total: 300,
    cc_reset_type: "cardmember_anniversary",
    cc_category: "travel",
    cc_merchant_notes: "Capital One Travel portal bookings.",
    cc_activation_required: false,
    cc_activation_notes: null,
    cc_is_active: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: "ben-vx-anniversary",
    cc_card_id: "card-venture-x",
    cc_benefit_name: "Anniversary Bonus Miles",
    cc_benefit_value: 100,
    cc_benefit_period: "annual",
    cc_period_count: 1,
    cc_annual_total: 100,
    cc_reset_type: "cardmember_anniversary",
    cc_category: "travel",
    cc_merchant_notes: "10,000 bonus miles (~$100 value) on anniversary.",
    cc_activation_required: false,
    cc_activation_notes: null,
    cc_is_active: true,
    created_at: now,
    updated_at: now,
  },
];

export const DEMO_USER_CARDS: UserCard[] = [
  {
    id: "uc-plat",
    user_id: DEMO_USER_ID,
    cc_card_id: "card-amex-platinum",
    cc_card_open_date: "2023-03-15",
    cc_is_active: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: "uc-gold",
    user_id: DEMO_USER_ID,
    cc_card_id: "card-amex-gold",
    cc_card_open_date: "2024-01-10",
    cc_is_active: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: "uc-csr",
    user_id: DEMO_USER_ID,
    cc_card_id: "card-chase-sapphire-reserve",
    cc_card_open_date: "2022-06-01",
    cc_is_active: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: "uc-vx",
    user_id: DEMO_USER_ID,
    cc_card_id: "card-venture-x",
    cc_card_open_date: "2024-08-20",
    cc_is_active: true,
    created_at: now,
    updated_at: now,
  },
];

// Pre-mark some benefits as used for realistic demo
export const DEMO_USAGE: BenefitUsage[] = [
  {
    id: "usage-1",
    user_id: DEMO_USER_ID,
    cc_benefit_id: "ben-plat-uber",
    cc_user_card_id: "uc-plat",
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
    cc_benefit_id: "ben-gold-uber",
    cc_user_card_id: "uc-gold",
    cc_period_start: getMonthStart().toISOString().split("T")[0],
    cc_period_end: getMonthEnd().toISOString().split("T")[0],
    cc_amount_used: 10,
    cc_is_fully_used: true,
    cc_used_at: now,
    created_at: now,
    updated_at: now,
  },
];

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

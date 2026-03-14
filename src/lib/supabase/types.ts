export interface Card {
  id: string;
  cc_card_name: string;
  cc_issuer: string;
  cc_annual_fee: number;
  cc_card_slug: string;
  cc_logo_url: string | null;
  cc_is_active: boolean;
  cc_downgrade_to?: { name: string; fee: number } | null;
  created_at: string;
  updated_at: string;
}

export interface Benefit {
  id: string;
  cc_card_id: string;
  cc_benefit_name: string;
  cc_benefit_value: number;
  cc_benefit_period: "monthly" | "quarterly" | "semi_annual" | "annual";
  cc_period_count: number;
  cc_annual_total: number;
  cc_reset_type: "calendar" | "cardmember_anniversary";
  cc_category: BenefitCategory;
  cc_merchant_notes: string | null;
  cc_activation_required: boolean;
  cc_activation_notes: string | null;
  cc_is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserCard {
  id: string;
  user_id: string;
  cc_card_id: string;
  cc_card_open_date: string | null;
  cc_is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BenefitUsage {
  id: string;
  user_id: string;
  cc_benefit_id: string;
  cc_user_card_id: string;
  cc_period_start: string;
  cc_period_end: string;
  cc_amount_used: number;
  cc_is_fully_used: boolean;
  cc_used_at: string | null;
  created_at: string;
  updated_at: string;
}

export type BenefitCategory =
  | "dining"
  | "travel"
  | "streaming"
  | "shopping"
  | "rideshare"
  | "wellness"
  | "airline"
  | "hotel"
  | "entertainment"
  | "other";

export type UrgencyState = "green" | "amber" | "red";

export type Issuer =
  | "amex"
  | "chase"
  | "citi"
  | "capital_one"
  | "bilt"
  | "barclays"
  | "us_bank";

export interface BenefitWithCard extends Benefit {
  card: Card;
  userCard: UserCard;
  usage: BenefitUsage | null;
  period: {
    start: Date;
    end: Date;
    daysRemaining: number;
  };
  urgency: UrgencyState;
}

export interface CardWithBenefits extends Card {
  benefits: Benefit[];
}

export interface CardROI {
  card: Card;
  userCard: UserCard;
  annualFee: number;
  totalBenefitValue: number;
  totalCaptured: number;
  totalWasted: number;
  netROI: number;
  captureRate: number;
}

export interface PortfolioSummary {
  totalCards: number;
  totalAnnualFees: number;
  totalBenefitValue: number;
  totalCaptured: number;
  totalWasted: number;
  netROI: number;
  captureRate: number;
}

export interface GradeResult {
  grade: string;
  percentage: number;
  color: string;
}

export interface PointsProgram {
  code: string;
  name: string;
  short_name: string;
  default_cpp: number;
  color: string;
  category: string;
}

export interface StreakData {
  current: number;
  last_checked: string;
}

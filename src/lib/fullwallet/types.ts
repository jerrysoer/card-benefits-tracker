export type SubscriptionCategory =
  | "streaming"
  | "fitness"
  | "food"
  | "software"
  | "news"
  | "shopping"
  | "finance"
  | "other";

export const SUBSCRIPTION_CATEGORIES: SubscriptionCategory[] = [
  "streaming",
  "fitness",
  "food",
  "software",
  "news",
  "shopping",
  "finance",
  "other",
];

export interface Subscription {
  id: string;
  name: string;
  monthlyCost: number;
  billingCycle: "monthly" | "annual";
  annualCost: number;
  category: SubscriptionCategory;
  usedThisMonth: boolean;
  usedLastToggled: string; // ISO date
  createdAt: string;
}

export interface NetWorthSnapshot {
  date: string; // ISO date
  cash: number;
  investments: number;
  pointsValue: number;
  debt: number;
  netWorth: number;
}

export interface SavingsEntry {
  month: string; // "2026-03"
  amount: number;
  source: "manual" | "calculated";
  loggedAt: string; // ISO date
}

export interface IncomeData {
  annualIncome: number;
  updatedAt: string; // ISO date
}

export interface FinancialScoreResult {
  total: number;
  label: string;
  color: string;
  breakdown: Array<{
    id: string;
    name: string;
    weight: number;
    raw: number;
    weighted: number;
  }>;
}

export interface SubscriptionStats {
  count: number;
  monthlyTotal: number;
  annualTotal: number;
  usedCount: number;
  unusedSubs: Subscription[];
  categoryBreakdown: Record<string, number>;
}

export interface MoneyRatios {
  feesOverIncome: number;
  capturedOverIncome: number;
  subsOverIncome: number;
  savingsOverIncome: number;
}

export interface MilestoneProjections {
  emergencyFund: number | null; // months, null if already reached or no data
  fiftyK: number | null;
  hundredK: number | null;
}

export const FINANCIAL_SCORE_TIERS = [
  { min: 90, label: "THRIVING", color: "#39FF14" },
  { min: 75, label: "STRONG", color: "#39FF14" },
  { min: 60, label: "BUILDING", color: "#FFE600" },
  { min: 40, label: "WORK IN PROGRESS", color: "#FFE600" },
  { min: 0, label: "GETTING STARTED", color: "#FF3131" },
] as const;

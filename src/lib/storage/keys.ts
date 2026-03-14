export const STORAGE_KEYS = {
  // Phase 1-2 (existing)
  selectedCards: "cardclock_selected_cards",
  benefitUsage: "cardclock_benefit_usage",
  pointsBalances: "cardclock_points_balances",
  customValuations: "cardclock_custom_valuations",
  walletSnapshots: "cardclock_wallet_snapshots",
  streak: "cardclock_streak",
  cardOpenDates: "cardclock_card_open_dates",

  // Phase 3
  badges: "cardclock_badges",
  collectionOrder: "cardclock_collection_order",
  pointsRedemptions: "cardclock_points_redemptions",
  challenges: "cardclock_challenges",
  roasts: "cardclock_roasts",
  eventLog: "cardclock_event_log",
  previousGrades: "cardclock_previous_grades",
  monthlySnapshots: "cardclock_monthly_snapshots",

  // Phase 4 (reserved)
  monthlyWrapped: "cardclock_monthly_wrapped",
  yearInReview: "cardclock_year_in_review",

  // Phase 5 (reserved)
  subscriptions: "cardclock_subscriptions",
  netWorthSnapshots: "cardclock_net_worth_snapshots",
  savingsEntries: "cardclock_savings_entries",
  incomeData: "cardclock_income_data",
  financialScore: "cardclock_financial_score",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

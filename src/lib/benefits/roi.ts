import type {
  Card,
  Benefit,
  UserCard,
  BenefitUsage,
  CardROI,
  PortfolioSummary,
} from "@/lib/supabase/types";

/**
 * Calculate ROI for a single card
 */
export function calculateCardROI(
  card: Card,
  userCard: UserCard,
  benefits: Benefit[],
  usage: BenefitUsage[]
): CardROI {
  const annualFee = card.cc_annual_fee;
  const totalBenefitValue = benefits.reduce(
    (sum, b) => sum + b.cc_annual_total,
    0
  );

  const totalCaptured = usage.reduce((sum, u) => sum + u.cc_amount_used, 0);

  // Wasted = benefits from expired periods that weren't used
  // For simplicity, we calculate this as total available minus captured
  // A more precise calculation would check each period individually
  const totalWasted = Math.max(0, totalBenefitValue - totalCaptured);

  const netROI = totalCaptured - annualFee;
  const captureRate =
    totalBenefitValue > 0 ? (totalCaptured / totalBenefitValue) * 100 : 0;

  return {
    card,
    userCard,
    annualFee,
    totalBenefitValue,
    totalCaptured,
    totalWasted,
    netROI,
    captureRate,
  };
}

/**
 * Calculate portfolio-wide summary across all cards
 */
export function calculatePortfolioSummary(
  cardROIs: CardROI[]
): PortfolioSummary {
  const totalCards = cardROIs.length;
  const totalAnnualFees = cardROIs.reduce((sum, r) => sum + r.annualFee, 0);
  const totalBenefitValue = cardROIs.reduce(
    (sum, r) => sum + r.totalBenefitValue,
    0
  );
  const totalCaptured = cardROIs.reduce((sum, r) => sum + r.totalCaptured, 0);
  const totalWasted = cardROIs.reduce((sum, r) => sum + r.totalWasted, 0);
  const netROI = totalCaptured - totalAnnualFees;
  const captureRate =
    totalBenefitValue > 0 ? (totalCaptured / totalBenefitValue) * 100 : 0;

  return {
    totalCards,
    totalAnnualFees,
    totalBenefitValue,
    totalCaptured,
    totalWasted,
    netROI,
    captureRate,
  };
}

/**
 * Format currency value
 */
export function formatCurrency(value: number): string {
  const absValue = Math.abs(value);
  const formatted = absValue.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return value < 0 ? `-${formatted}` : formatted;
}

/**
 * Format currency with cents for partial amounts
 */
export function formatCurrencyPrecise(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

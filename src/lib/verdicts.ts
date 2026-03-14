import type { Card, BenefitWithCard } from "@/lib/supabase/types";
import { formatCurrency } from "@/lib/benefits/roi";

interface GradeThreshold {
  grade: string;
  minPercent: number;
  label: string;
}

const THRESHOLDS: GradeThreshold[] = [
  { grade: "A+", minPercent: 200, label: "A+" },
  { grade: "A", minPercent: 150, label: "A" },
  { grade: "B", minPercent: 100, label: "B" },
  { grade: "C", minPercent: 75, label: "C" },
  { grade: "D", minPercent: 50, label: "D" },
  { grade: "F", minPercent: 0, label: "F" },
];

function getNextGradeThreshold(currentPercent: number): { grade: string; threshold: number } | null {
  for (const t of THRESHOLDS) {
    if (currentPercent < t.minPercent) {
      return { grade: t.grade, threshold: t.minPercent };
    }
  }
  return null;
}

function getLargestUnusedBenefit(benefits: BenefitWithCard[]): BenefitWithCard | null {
  return benefits
    .filter((b) => !b.usage?.cc_is_fully_used)
    .sort((a, b) => b.cc_benefit_value - a.cc_benefit_value)[0] ?? null;
}

export function generateVerdict(
  grade: string,
  card: Card,
  benefits: BenefitWithCard[],
  totalCaptured: number,
  daysUntilRenewal: number | null
): string {
  const largestUnused = getLargestUnusedBenefit(benefits);
  const fee = card.cc_annual_fee;
  const currentPercent = fee > 0 ? (totalCaptured / fee) * 100 : 0;
  const nextGrade = getNextGradeThreshold(currentPercent);

  if (fee === 0) {
    return "no annual fee — this card owes you nothing.";
  }

  const gapDollars = nextGrade
    ? Math.ceil((nextGrade.threshold / 100) * fee - totalCaptured)
    : 0;

  let verdict = "";

  switch (grade) {
    case "A+":
      verdict = "this card is printing money for you. you've captured more than 2x the fee.";
      break;
    case "A":
      if (gapDollars > 0) {
        verdict = `you're crushing it. ${formatCurrency(gapDollars)} more and you hit A+.`;
      } else {
        verdict = "you're crushing it. this card more than pays for itself.";
      }
      break;
    case "B":
      if (largestUnused) {
        verdict = `you broke even. use your ${largestUnused.cc_benefit_name} (${formatCurrency(largestUnused.cc_benefit_value)}) and you'll hit A.`;
      } else {
        verdict = "you broke even. a few more credits and you're golden.";
      }
      break;
    case "C":
      if (largestUnused) {
        verdict = `you're underwater. use your ${largestUnused.cc_benefit_name} worth ${formatCurrency(largestUnused.cc_benefit_value)} this month.`;
      } else {
        verdict = "you're paying more than you're getting. check your unused credits.";
      }
      break;
    case "D":
      if (largestUnused) {
        verdict = `this card is costing you money. ${largestUnused.cc_benefit_name} (${formatCurrency(largestUnused.cc_benefit_value)}) is sitting there unused.`;
      } else {
        verdict = "this card is costing you real money every month you ignore it.";
      }
      break;
    case "F":
      verdict = `you're paying ${formatCurrency(fee)} to look at a metal card. downgrade.`;
      break;
    default:
      verdict = "no annual fee — free card.";
  }

  if (daysUntilRenewal !== null && daysUntilRenewal <= 90 && daysUntilRenewal > 0) {
    verdict += ` fee renews in ${daysUntilRenewal} days.`;
  }

  return verdict;
}

"use client";

import type { CardROI, BenefitWithCard } from "@/lib/supabase/types";
import { calculateGrade, getGradeSortPriority } from "@/lib/scoring";
import CardGrade from "@/components/dashboard/CardGrade";

interface AnnualFeeScorecardProps {
  cardROIs: CardROI[];
  benefits: BenefitWithCard[];
}

export default function AnnualFeeScorecard({ cardROIs, benefits }: AnnualFeeScorecardProps) {
  const sortedROIs = [...cardROIs].sort((a, b) => {
    const gradeA = calculateGrade(a.totalCaptured, a.annualFee);
    const gradeB = calculateGrade(b.totalCaptured, b.annualFee);
    return getGradeSortPriority(gradeA.grade) - getGradeSortPriority(gradeB.grade);
  });

  return (
    <div>
      <h2 className="font-display mb-4 text-sm text-text-secondary">
        ANNUAL FEE SCORECARD
      </h2>
      <div className="space-y-3">
        {sortedROIs.map((roi) => {
          const cardBenefits = benefits.filter(
            (b) => b.card.id === roi.card.id
          );
          return (
            <CardGrade
              key={roi.card.id}
              cardROI={roi}
              benefits={cardBenefits}
              compact
            />
          );
        })}
      </div>
    </div>
  );
}

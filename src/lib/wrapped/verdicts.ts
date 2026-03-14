/**
 * Deterministic verdict generation for Wrapped and Year in Review slides.
 * Uses simple hash-based selection for consistency (same data → same verdict).
 */

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function pick(pool: string[], seed: string): string {
  return pool[simpleHash(seed) % pool.length];
}

export function getBestCardVerdict(
  cardName: string,
  grade: string,
  gradeChange?: string
): string {
  if (gradeChange && grade === "A+") {
    return pick(
      [
        "this card is printing money for you",
        `${cardName.toLowerCase()} went beast mode this month`,
        "your annual fee paid for itself. twice.",
      ],
      cardName + grade
    );
  }
  if (grade === "A+" || grade === "A") {
    return pick(
      [
        "this card is earning its keep and then some",
        "you're squeezing every dollar out of this one",
        "peak optimization. respect.",
      ],
      cardName + grade
    );
  }
  return pick(
    [
      "best of the bunch, but there's room to grow",
      "leading the pack. keep pushing.",
    ],
    cardName + grade
  );
}

export function getWorstCardVerdict(
  cardName: string,
  wastedBenefits: { benefit: string; value: number }[]
): string {
  if (wastedBenefits.length === 0) {
    return pick(
      [
        "you didn't use a single benefit. not one.",
        `${cardName.toLowerCase()} is collecting dust`,
        "this card is a subscription you forgot to cancel",
      ],
      cardName
    );
  }

  const totalWasted = wastedBenefits.reduce((sum, b) => sum + b.value, 0);
  const benefitNames = wastedBenefits
    .slice(0, 2)
    .map((b) => b.benefit)
    .join(" and ");

  return `that's $${totalWasted} in ${benefitNames} you threw away`;
}

export function getWorstMonthVerdict(
  captureRate: number,
  wasted: number,
  monthName: string
): string {
  const m = monthName.toLowerCase();
  if (captureRate >= 80) {
    return `even your worst month would make most people jealous`;
  }
  if (captureRate >= 60) {
    return `${m} was mid. you let $${wasted} slip through.`;
  }
  return `${m} was rough. you treated $${wasted} like it was monopoly money.`;
}

export function getBestMonthVerdict(
  captureRate: number,
  captured: number
): string {
  if (captureRate >= 95) {
    return `near-perfect optimization. $${captured} captured.`;
  }
  if (captureRate >= 85) {
    return `peak performance. you were locked in.`;
  }
  return `your strongest month. you showed up.`;
}

export function getHeroVerdict(
  fees: number,
  totalValue: number,
  roiPercent: number
): string {
  if (roiPercent >= 200) {
    return `you turned $${fees.toLocaleString()} in fees into $${totalValue.toLocaleString()} in value. wall street wishes.`;
  }
  if (roiPercent >= 150) {
    return `$${fees.toLocaleString()} in fees → $${totalValue.toLocaleString()} in value. your cards work harder than most people's portfolios.`;
  }
  if (roiPercent >= 100) {
    return `you came out ahead. $${totalValue.toLocaleString()} captured on $${fees.toLocaleString()} in fees. that's profit.`;
  }
  return `$${totalValue.toLocaleString()} captured. not bad, but your cards can do more.`;
}

export function getGradeStoryVerdict(
  cardName: string,
  startGrade: string,
  endGrade: string
): string {
  const improved =
    gradeRank(endGrade) > gradeRank(startGrade);
  const dropped =
    gradeRank(endGrade) < gradeRank(startGrade);

  if (improved && endGrade === "A+") {
    return `you went from ${startGrade} to ${endGrade}. from mid to money printer.`;
  }
  if (improved) {
    return `${startGrade} → ${endGrade}. steady climb. keep going.`;
  }
  if (dropped) {
    return `${startGrade} → ${endGrade}. something slipped. time to refocus.`;
  }
  return `held steady at ${endGrade} all year. consistency counts.`;
}

function gradeRank(grade: string): number {
  const ranks: Record<string, number> = {
    F: 0,
    D: 1,
    C: 2,
    "C+": 3,
    B: 4,
    "B+": 5,
    A: 6,
    "A+": 7,
    FREE: 8,
  };
  return ranks[grade] ?? 0;
}

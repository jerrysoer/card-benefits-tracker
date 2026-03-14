export interface ScoreComponent {
  id: string;
  name: string;
  weight: number;
  calculate: () => number;
  phase: number;
}

export interface ScoreResult {
  total: number;
  components: Record<string, number>;
  breakdown: Array<{
    id: string;
    name: string;
    weight: number;
    raw: number;
    weighted: number;
  }>;
}

export function computeWalletScore(components: ScoreComponent[]): ScoreResult {
  const results: Record<string, number> = {};
  const breakdown: ScoreResult["breakdown"] = [];
  let total = 0;

  for (const component of components) {
    const raw = Math.min(Math.max(component.calculate(), 0), 100);
    const weighted = raw * component.weight;
    results[component.id] = raw;
    breakdown.push({
      id: component.id,
      name: component.name,
      weight: component.weight,
      raw,
      weighted,
    });
    total += weighted;
  }

  return { total: Math.round(total), components: results, breakdown };
}

// Default Phase 2-3 component builders
export function buildBenefitCaptureComponent(captureRate: number): ScoreComponent {
  return {
    id: "benefit_capture",
    name: "Benefits Captured",
    weight: 0.35,
    calculate: () => Math.min(captureRate, 100),
    phase: 2,
  };
}

export function buildFeeRoiComponent(feeROIPercent: number): ScoreComponent {
  return {
    id: "fee_roi",
    name: "Fee ROI",
    weight: 0.25,
    calculate: () => Math.min((feeROIPercent * 50) / 100, 100),
    phase: 2,
  };
}

export function buildDiversityComponent(diversityScore: number): ScoreComponent {
  return {
    id: "diversity",
    name: "Portfolio Diversity",
    weight: 0.12,
    calculate: () => Math.min(diversityScore, 100),
    phase: 2,
  };
}

export function buildStreakComponent(streakMonths: number): ScoreComponent {
  return {
    id: "streak",
    name: "Streak Bonus",
    weight: 0.12,
    calculate: () => Math.min(streakMonths * 10, 100),
    phase: 2,
  };
}

export function buildBadgesComponent(
  unlockedCount: number,
  totalCount: number
): ScoreComponent {
  return {
    id: "badges",
    name: "Badges Earned",
    weight: 0.08,
    calculate: () => (totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0),
    phase: 3,
  };
}

export function buildChallengeComponent(
  completedThisMonth: number,
  totalThisMonth: number
): ScoreComponent {
  return {
    id: "challenge",
    name: "Challenge Completion",
    weight: 0.08,
    calculate: () =>
      totalThisMonth > 0 ? (completedThisMonth / totalThisMonth) * 100 : 0,
    phase: 3,
  };
}

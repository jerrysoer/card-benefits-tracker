import {
  computeWalletScore,
  type ScoreComponent,
} from "@/lib/scoring/engine";
import type { NetWorthSnapshot, FinancialScoreResult } from "./types";
import { FINANCIAL_SCORE_TIERS } from "./types";

export function buildWalletScoreComponent(
  walletScore: number
): ScoreComponent {
  return {
    id: "wallet_score",
    name: "Card Optimization",
    weight: 0.3,
    calculate: () => Math.min(walletScore, 100),
    phase: 5,
  };
}

export function buildSavingsRateComponent(
  annualSavings: number,
  annualIncome: number
): ScoreComponent {
  return {
    id: "savings_rate",
    name: "Savings Rate",
    weight: 0.25,
    calculate: () => {
      if (annualIncome <= 0) return 0;
      // 20%+ savings rate = 100 score
      const rate = (annualSavings / annualIncome) * 100;
      return Math.min((rate / 20) * 100, 100);
    },
    phase: 5,
  };
}

export function buildSubEfficiencyComponent(
  usedCount: number,
  totalCount: number
): ScoreComponent {
  return {
    id: "sub_efficiency",
    name: "Subscription Efficiency",
    weight: 0.2,
    calculate: () => (totalCount > 0 ? (usedCount / totalCount) * 100 : 100),
    phase: 5,
  };
}

export function buildNWTrajectoryComponent(
  snapshots: NetWorthSnapshot[]
): ScoreComponent {
  return {
    id: "nw_trajectory",
    name: "Net Worth Trajectory",
    weight: 0.25,
    calculate: () => {
      if (snapshots.length < 3) return 50; // Neutral if insufficient data
      // Use last 3 snapshots to determine trend
      const recent = snapshots.slice(-3);
      const changes = [];
      for (let i = 1; i < recent.length; i++) {
        changes.push(recent[i].netWorth - recent[i - 1].netWorth);
      }
      const avgChange =
        changes.reduce((a, b) => a + b, 0) / changes.length;
      // Positive trend = high score, negative = low
      // Scale: +$5000/mo avg change = 100, -$5000/mo = 0
      const scaled = ((avgChange / 5000) * 50) + 50;
      return Math.min(Math.max(scaled, 0), 100);
    },
    phase: 5,
  };
}

function getScoreLabel(score: number): { label: string; color: string } {
  for (const tier of FINANCIAL_SCORE_TIERS) {
    if (score >= tier.min) {
      return { label: tier.label, color: tier.color };
    }
  }
  return { label: "GETTING STARTED", color: "#C4717A" };
}

export function computeFinancialScore(
  walletScore: number,
  options: {
    annualSavings?: number;
    annualIncome?: number;
    usedSubCount?: number;
    totalSubCount?: number;
    netWorthSnapshots?: NetWorthSnapshot[];
  }
): FinancialScoreResult {
  const components: ScoreComponent[] = [
    buildWalletScoreComponent(walletScore),
  ];

  const hasIncome =
    options.annualIncome !== undefined && options.annualIncome > 0;
  const hasSavings = options.annualSavings !== undefined && hasIncome;
  const hasSubs =
    options.totalSubCount !== undefined && options.totalSubCount > 0;
  const hasNW =
    options.netWorthSnapshots !== undefined &&
    options.netWorthSnapshots.length >= 3;

  if (hasSavings) {
    components.push(
      buildSavingsRateComponent(options.annualSavings!, options.annualIncome!)
    );
  }
  if (hasSubs) {
    components.push(
      buildSubEfficiencyComponent(
        options.usedSubCount ?? 0,
        options.totalSubCount!
      )
    );
  }
  if (hasNW) {
    components.push(buildNWTrajectoryComponent(options.netWorthSnapshots!));
  }

  // Normalize weights to sum to 1.0
  const totalWeight = components.reduce((sum, c) => sum + c.weight, 0);
  const normalized = components.map((c) => ({
    ...c,
    weight: c.weight / totalWeight,
  }));

  const result = computeWalletScore(normalized);
  const { label, color } = getScoreLabel(result.total);

  return {
    total: result.total,
    label,
    color,
    breakdown: result.breakdown,
  };
}

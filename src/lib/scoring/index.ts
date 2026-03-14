// Re-exports from the original scoring module for backward compatibility
export {
  calculateGrade,
  getGradeSortPriority,
  getVerdict,
  getStableVerdict,
  calculateWalletScore,
  calculateDiversityScore,
  getScoreLabel,
  checkStreak,
  getVerdictForDowngrade,
} from "@/lib/scoring";

// New scoring engine exports
export {
  computeWalletScore,
  buildBenefitCaptureComponent,
  buildFeeRoiComponent,
  buildDiversityComponent,
  buildStreakComponent,
  buildBadgesComponent,
  buildChallengeComponent,
} from "./engine";
export type { ScoreComponent, ScoreResult } from "./engine";

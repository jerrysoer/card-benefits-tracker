import type { PointsProgram } from "@/lib/supabase/types";
import programsJson from "../../data/points-programs.json";

export function loadPointsPrograms(): PointsProgram[] {
  return (programsJson as { programs: PointsProgram[] }).programs;
}

export function calculatePointsValue(
  balances: Record<string, number>,
  customValuations: Record<string, number>,
  programs: PointsProgram[]
): number {
  let total = 0;
  for (const program of programs) {
    const balance = balances[program.code] ?? 0;
    const cpp = customValuations[program.code] ?? program.default_cpp;
    total += (balance * cpp) / 100;
  }
  return total;
}

export function calculateWalletValue(
  pointsValue: number,
  unusedBenefitsRemaining: number,
  annualFees: number
): number {
  return pointsValue + unusedBenefitsRemaining - annualFees;
}

export function calculateMonthlyDelta(
  currentValue: number,
  snapshots: Record<string, number>
): number | null {
  const now = new Date();
  const monthKey = `${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, "0")}`;
  const snapshotValue = snapshots[monthKey];
  if (snapshotValue === undefined) return null;
  return currentValue - snapshotValue;
}

export function getCurrentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, "0")}`;
}

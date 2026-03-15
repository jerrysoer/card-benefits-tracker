import { storage } from "@/lib/storage/adapter";
import { STORAGE_KEYS } from "@/lib/storage/keys";
import { logEvent } from "@/lib/storage/event-log";

export interface Redemption {
  id: string;
  programCode: string;
  pointsRedeemed: number;
  redeemedAt: string;
  description: string;
}

export async function getRedemptions(): Promise<Redemption[]> {
  return storage.get<Redemption[]>(STORAGE_KEYS.pointsRedemptions, []);
}

export async function logRedemption(
  programCode: string,
  pointsRedeemed: number,
  description: string
): Promise<void> {
  const redemptions = await getRedemptions();
  const entry: Redemption = {
    id: `redemption-${Date.now()}`,
    programCode,
    pointsRedeemed,
    redeemedAt: new Date().toISOString(),
    description,
  };
  redemptions.push(entry);
  // Keep last 200
  if (redemptions.length > 200) {
    redemptions.splice(0, redemptions.length - 200);
  }
  await storage.set(STORAGE_KEYS.pointsRedemptions, redemptions);
  logEvent("points_redeemed", {
    program: programCode,
    amount: pointsRedeemed,
    description,
  });
}

export function calculateBurnRate(
  redemptions: Redemption[],
  programCode: string
): number {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const recent = redemptions.filter(
    (r) =>
      r.programCode === programCode &&
      new Date(r.redeemedAt) >= sixMonthsAgo
  );

  if (recent.length === 0) return 0;

  const totalRedeemed = recent.reduce((sum, r) => sum + r.pointsRedeemed, 0);
  return Math.round(totalRedeemed / 6);
}

export function calculateRunway(
  balance: number,
  monthlyBurnRate: number
): number | null {
  if (monthlyBurnRate <= 0) return null; // Infinity — hoarder
  return Math.round(balance / monthlyBurnRate);
}

export function getRunwayColor(months: number | null): string {
  if (months === null) return "#6B8F71"; // Hoarder = sage infinity
  if (months > 12) return "#6B8F71";
  if (months >= 6) return "#C8963E";
  return "#C4717A";
}

export function getHoarderNudge(programName: string, dollarValue: number): string {
  if (dollarValue >= 5000) {
    return `you're sitting on ${formatDollars(dollarValue)} in ${programName}. that's a first-class flight you're not taking.`;
  }
  if (dollarValue >= 1000) {
    return `${formatDollars(dollarValue)} in ${programName} just sitting there. when's the last time you booked something?`;
  }
  return `you have ${formatDollars(dollarValue)} in ${programName}. points don't earn interest — use them.`;
}

function formatDollars(value: number): string {
  return `$${Math.round(value).toLocaleString()}`;
}

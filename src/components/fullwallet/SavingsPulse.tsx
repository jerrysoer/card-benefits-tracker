"use client";

import { useState, useEffect } from "react";
import type { SavingsEntry, NetWorthSnapshot } from "@/lib/fullwallet/types";
import {
  getSavingsEntries,
  addOrUpdateSavingsEntry,
  getNetWorthSnapshots,
  getSubscriptions,
} from "@/lib/fullwallet/storage";
import {
  calculateAverageMonthlySavings,
  calculateMilestoneProjections,
  estimateSavingsFromNetWorth,
  calculateSubscriptionStats,
} from "@/lib/fullwallet/calculations";
import { getSavingsVerdict } from "@/lib/fullwallet/verdicts";
import Sparkline from "@/components/wrapped/Sparkline";

export default function SavingsPulse() {
  const [entries, setEntries] = useState<SavingsEntry[]>([]);
  const [nwSnapshots, setNwSnapshots] = useState<NetWorthSnapshot[]>([]);
  const [amount, setAmount] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  useEffect(() => {
    async function load() {
      const [e, nw, subs] = await Promise.all([
        getSavingsEntries(),
        getNetWorthSnapshots(),
        getSubscriptions(),
      ]);
      setEntries(e);
      setNwSnapshots(nw);
      setMonthlyExpenses(calculateSubscriptionStats(subs).monthlyTotal);
      const existing = e.find((x) => x.month === currentMonth);
      if (existing) setAmount(String(existing.amount));
      setIsLoaded(true);
    }
    load();
  }, [currentMonth]);

  async function handleSave() {
    const val = parseFloat(amount) || 0;
    await addOrUpdateSavingsEntry(currentMonth, val, "manual");
    const updated = await getSavingsEntries();
    setEntries(updated);
  }

  async function handleCalculateFromNW() {
    const estimate = estimateSavingsFromNetWorth(nwSnapshots);
    if (estimate !== null) {
      setAmount(String(Math.round(estimate)));
      await addOrUpdateSavingsEntry(currentMonth, Math.round(estimate), "calculated");
      const updated = await getSavingsEntries();
      setEntries(updated);
    }
  }

  if (!isLoaded) return null;

  const avg = calculateAverageMonthlySavings(entries);
  const latestCash = nwSnapshots.length > 0
    ? nwSnapshots[nwSnapshots.length - 1].cash
    : 0;

  const milestones = calculateMilestoneProjections(
    avg,
    latestCash,
    monthlyExpenses > 0 ? monthlyExpenses : undefined
  );

  const sparkData = entries.map((e) => e.amount);
  const sparkLabels = entries.map((e) => {
    const parts = e.month.split("-");
    const mi = parseInt(parts[1], 10) - 1;
    return ["J","F","M","A","M","J","J","A","S","O","N","D"][mi];
  });
  const yearTotal = entries
    .filter((e) => e.month.startsWith(String(now.getFullYear())))
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-4 rounded-lg border border-border bg-bg-card p-4">
      <div className="font-display text-xs tracking-wide text-text-muted">
        SAVINGS PULSE
      </div>

      {/* Input */}
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className="mb-1 block text-xs text-text-muted">
            Savings this month ({currentMonth})
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-muted">
              $
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full rounded-md border border-border bg-bg-elevated py-2 pl-7 pr-3 font-mono-data text-sm text-text-primary placeholder:text-text-muted focus:border-[#60A5FA] focus:outline-none"
            />
          </div>
        </div>
        <button
          onClick={handleSave}
          className="rounded-md px-4 py-2 text-sm font-medium"
          style={{ backgroundColor: "#39FF14", color: "#0C0F14" }}
        >
          Save
        </button>
      </div>

      {/* Calculate from NW */}
      {nwSnapshots.length >= 2 && (
        <button
          onClick={handleCalculateFromNW}
          className="text-xs text-[#60A5FA] hover:underline"
        >
          Calculate from net worth changes
        </button>
      )}

      {/* Stats */}
      {entries.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-text-muted">Avg Monthly</div>
            <div className="font-mono-data text-lg font-bold text-text-primary">
              ${Math.round(avg).toLocaleString()}/mo
            </div>
          </div>
          <div>
            <div className="text-xs text-text-muted">
              Saved {now.getFullYear()}
            </div>
            <div className="font-mono-data text-lg font-bold text-text-primary">
              ${yearTotal.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Sparkline */}
      {sparkData.length >= 2 && (
        <Sparkline
          data={sparkData}
          labels={sparkLabels}
          color="#34D399"
          width={400}
          height={80}
          highlightMax
        />
      )}

      {/* Milestones */}
      {avg > 0 && (
        <div className="space-y-1.5">
          <div className="text-xs font-medium text-text-muted">
            AT ${Math.round(avg).toLocaleString()}/MO
          </div>
          {milestones.emergencyFund !== null && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-secondary">Emergency fund (3mo)</span>
              <span className="font-mono-data text-text-primary">
                {milestones.emergencyFund === 0
                  ? "done"
                  : `${milestones.emergencyFund} months`}
              </span>
            </div>
          )}
          {milestones.fiftyK !== null && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-secondary">$50K savings</span>
              <span className="font-mono-data text-text-primary">
                {milestones.fiftyK === 0
                  ? "done"
                  : `${milestones.fiftyK} months`}
              </span>
            </div>
          )}
          {milestones.hundredK !== null && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-secondary">$100K savings</span>
              <span className="font-mono-data text-text-primary">
                {milestones.hundredK === 0
                  ? "done"
                  : `${milestones.hundredK} months`}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Verdict */}
      {entries.length > 0 && (
        <p className="text-xs text-text-secondary italic">
          {getSavingsVerdict(avg)}
        </p>
      )}
    </div>
  );
}

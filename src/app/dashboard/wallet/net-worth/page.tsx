"use client";

import { useState, useEffect, useCallback } from "react";
import type { NetWorthSnapshot, FinancialScoreResult } from "@/lib/fullwallet/types";
import {
  getNetWorthSnapshots,
  addNetWorthSnapshot,
  getLatestNetWorth,
  getSubscriptions,
  getSavingsEntries,
} from "@/lib/fullwallet/storage";
import {
  calculateNetWorth,
  calculateLinearProjection,
  calculateSubscriptionStats,
  calculateAverageMonthlySavings,
  calculateMoneyRatios,
} from "@/lib/fullwallet/calculations";
import { getNetWorthVerdict } from "@/lib/fullwallet/verdicts";
import { computeFinancialScore } from "@/lib/fullwallet/score";
import { calculatePointsValue, loadPointsPrograms } from "@/lib/points";
import { getPointsBalances, getCustomValuations } from "@/lib/storage";
import { calculateWalletScore } from "@/lib/scoring";
import { getStreak } from "@/lib/storage";
import NetWorthHero from "@/components/fullwallet/NetWorthHero";
import BucketBreakdown from "@/components/fullwallet/BucketBreakdown";
import SavingsPulse from "@/components/fullwallet/SavingsPulse";
import IncomeInput from "@/components/fullwallet/IncomeInput";
import MoneyRatios from "@/components/fullwallet/MoneyRatios";
import FinancialScoreComponent from "@/components/fullwallet/FinancialScore";
import Sparkline from "@/components/wrapped/Sparkline";

export default function NetWorthPage() {
  const [cash, setCash] = useState("");
  const [investments, setInvestments] = useState("");
  const [debt, setDebt] = useState("");
  const [pointsValue, setPointsValue] = useState(0);
  const [snapshots, setSnapshots] = useState<NetWorthSnapshot[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [annualIncome, setAnnualIncome] = useState<number | null>(null);
  const [walletScore, setWalletScore] = useState(0);
  const [annualFees, setAnnualFees] = useState(0);
  const [annualCaptured, setAnnualCaptured] = useState(0);
  const [financialScore, setFinancialScore] = useState<FinancialScoreResult>(
    () => computeFinancialScore(0, {})
  );
  const [subMonthlyBurn, setSubMonthlyBurn] = useState(0);
  const [avgSavings, setAvgSavings] = useState(0);

  const loadData = useCallback(async () => {
    const [snaps, latest, programs, balances, valuations] = await Promise.all([
      getNetWorthSnapshots(),
      getLatestNetWorth(),
      Promise.resolve(loadPointsPrograms()),
      getPointsBalances(),
      getCustomValuations(),
    ]);

    const pv = calculatePointsValue(balances, valuations, programs);
    setPointsValue(pv);
    setSnapshots(snaps);

    if (latest) {
      setCash(String(latest.cash));
      setInvestments(String(latest.investments));
      setDebt(String(latest.debt));
    }

    const streakData = await getStreak();
    const score = calculateWalletScore(50, 100, 50, streakData.current);
    setWalletScore(score);

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Compute financial score when dependencies change
  useEffect(() => {
    async function computeScore() {
      const [subs, entries] = await Promise.all([
        getSubscriptions(),
        getSavingsEntries(),
      ]);
      const subStats = calculateSubscriptionStats(subs);
      const avg = calculateAverageMonthlySavings(entries);

      setSubMonthlyBurn(subStats.monthlyTotal);
      setAvgSavings(avg);

      const score = computeFinancialScore(walletScore, {
        annualSavings: annualIncome ? avg * 12 : undefined,
        annualIncome: annualIncome ?? undefined,
        usedSubCount: subStats.usedCount,
        totalSubCount: subStats.count,
        netWorthSnapshots: snapshots.length >= 3 ? snapshots : undefined,
      });
      setFinancialScore(score);
    }
    if (isLoaded) computeScore();
  }, [walletScore, annualIncome, snapshots, isLoaded]);

  async function handleUpdate() {
    const cashVal = parseFloat(cash) || 0;
    const invVal = parseFloat(investments) || 0;
    const debtVal = parseFloat(debt) || 0;

    const programs = loadPointsPrograms();
    const balances = await getPointsBalances();
    const valuations = await getCustomValuations();
    const pv = calculatePointsValue(balances, valuations, programs);
    setPointsValue(pv);

    const nw = calculateNetWorth(cashVal, invVal, pv, debtVal);
    const snapshot: NetWorthSnapshot = {
      date: new Date().toISOString(),
      cash: cashVal,
      investments: invVal,
      pointsValue: pv,
      debt: debtVal,
      netWorth: nw,
    };

    await addNetWorthSnapshot(snapshot);
    await loadData();
  }

  if (!isLoaded) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-text-muted">Loading...</p>
      </div>
    );
  }

  const prevSnapshot = snapshots.length >= 2 ? snapshots[snapshots.length - 2] : null;
  const latestSnapshot = snapshots.length >= 1 ? snapshots[snapshots.length - 1] : null;
  const delta = prevSnapshot && latestSnapshot
    ? latestSnapshot.netWorth - prevSnapshot.netWorth
    : null;

  const projection = calculateLinearProjection(snapshots, 100000);
  const sparkData = snapshots.map((s) => s.netWorth);
  const sparkLabels = snapshots.slice(-12).map((s) => {
    const mi = new Date(s.date).getMonth();
    return ["J","F","M","A","M","J","J","A","S","O","N","D"][mi];
  });

  const ratios = annualIncome
    ? calculateMoneyRatios(
        annualIncome,
        annualFees,
        annualCaptured,
        subMonthlyBurn * 12,
        avgSavings * 12
      )
    : null;

  return (
    <div className="space-y-6">
      {/* Income Input */}
      <IncomeInput onUpdate={(val) => setAnnualIncome(val)} />

      {/* Net Worth Input Form */}
      <div className="rounded-lg border border-border bg-bg-card p-4">
        <div className="mb-3 font-display text-xs tracking-wide text-text-muted">
          UPDATE YOUR NUMBERS
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Cash & Savings", value: cash, setter: setCash },
            { label: "Investments", value: investments, setter: setInvestments },
            { label: "Debt", value: debt, setter: setDebt },
          ].map(({ label, value, setter }) => (
            <div key={label}>
              <label className="mb-1 block text-xs text-text-muted">
                {label}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-muted">
                  $
                </span>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-md border border-border bg-bg-elevated py-2 pl-7 pr-3 font-mono-data text-sm text-text-primary placeholder:text-text-muted focus:border-[#60A5FA] focus:outline-none"
                />
              </div>
            </div>
          ))}
          <div>
            <label className="mb-1 block text-xs text-text-muted">
              Points Portfolio{" "}
              <span className="text-[10px] text-text-muted">(auto)</span>
            </label>
            <div className="flex h-[38px] items-center rounded-md border border-border bg-bg-elevated px-3 font-mono-data text-sm text-[#22D3EE]">
              ${pointsValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>
        <button
          onClick={handleUpdate}
          className="mt-3 w-full rounded-md py-2 text-sm font-medium transition-colors"
          style={{ backgroundColor: "#39FF14", color: "#0C0F14" }}
        >
          Update Net Worth
        </button>
      </div>

      {/* Hero */}
      {latestSnapshot && (
        <NetWorthHero
          netWorth={latestSnapshot.netWorth}
          delta={delta}
          lastUpdateDate={prevSnapshot?.date ?? null}
        />
      )}

      {/* Verdict */}
      {latestSnapshot && (
        <p className="text-center text-xs text-text-secondary italic">
          {getNetWorthVerdict(latestSnapshot.netWorth, delta)}
        </p>
      )}

      {/* Bucket Breakdown */}
      {latestSnapshot && (
        <div className="rounded-lg border border-border bg-bg-card p-4">
          <BucketBreakdown
            cash={latestSnapshot.cash}
            investments={latestSnapshot.investments}
            pointsValue={latestSnapshot.pointsValue}
            debt={latestSnapshot.debt}
          />
        </div>
      )}

      {/* Sparkline */}
      {sparkData.length >= 2 && (
        <div className="rounded-lg border border-border bg-bg-card p-4">
          <div className="mb-2 font-display text-xs tracking-wide text-text-muted">
            NET WORTH OVER TIME
          </div>
          <Sparkline
            data={sparkData.slice(-12)}
            labels={sparkLabels}
            color="#34D399"
            width={500}
            height={100}
            highlightMax
          />
          {projection.projectedMonthlyGrowth > 0 && (
            <div className="mt-2 rounded-md bg-bg-elevated px-3 py-2 text-xs text-text-secondary">
              <span className="font-display text-[10px] tracking-wide text-text-muted">
                AT THIS RATE{" "}
              </span>
              {projection.monthsToTarget !== null && projection.monthsToTarget > 0 ? (
                <>
                  $100K by{" "}
                  <span className="font-mono-data text-text-primary">
                    {new Date(
                      Date.now() + projection.monthsToTarget * 30 * 24 * 60 * 60 * 1000
                    ).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </span>{" "}
                  ({projection.monthsToTarget} months)
                </>
              ) : projection.monthsToTarget === 0 ? (
                <span className="text-[#34D399]">Already reached $100K!</span>
              ) : (
                <span className="font-mono-data text-text-primary">
                  +${Math.round(projection.projectedMonthlyGrowth).toLocaleString()}/mo avg growth
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Savings Pulse */}
      <SavingsPulse />

      {/* Money Ratios */}
      {ratios && annualIncome && (
        <MoneyRatios
          ratios={ratios}
          annualIncome={annualIncome}
          annualFees={annualFees}
          annualCaptured={annualCaptured}
          annualSubBurn={subMonthlyBurn * 12}
          annualSavings={avgSavings * 12}
        />
      )}

      {/* Financial Score */}
      <FinancialScoreComponent score={financialScore} />
    </div>
  );
}

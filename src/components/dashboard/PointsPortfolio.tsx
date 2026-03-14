"use client";

import { useState, useEffect, useCallback } from "react";
import type { CardROI, BenefitWithCard, PointsProgram } from "@/lib/supabase/types";
import { loadPointsPrograms, calculatePointsValue, calculateWalletValue, calculateMonthlyDelta, getCurrentMonthKey } from "@/lib/points";
import { getPointsBalances, setPointsBalances, getCustomValuations, setCustomValuations, getWalletSnapshots, setWalletSnapshot } from "@/lib/storage";
import { formatCurrency } from "@/lib/benefits/roi";
import { logEvent } from "@/lib/storage/event-log";
import ProgramBlock, { useCountUp } from "@/components/dashboard/ProgramBlock";

interface PointsPortfolioProps {
  cardROIs: CardROI[];
  benefits: BenefitWithCard[];
}

export default function PointsPortfolio({ cardROIs, benefits }: PointsPortfolioProps) {
  const [programs, setPrograms] = useState<PointsProgram[]>([]);
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [valuations, setValuations] = useState<Record<string, number>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const progs = loadPointsPrograms();
    setPrograms(progs);
    Promise.all([getPointsBalances(), getCustomValuations()]).then(([b, v]) => {
      setBalances(b);
      setValuations(v);
      setMounted(true);
    });
  }, []);

  // Snapshot on first visit of the month
  useEffect(() => {
    if (!mounted || programs.length === 0) return;
    const monthKey = getCurrentMonthKey();
    getWalletSnapshots().then((snapshots) => {
      if (snapshots[monthKey] === undefined) {
        const value = computeWalletValue();
        setWalletSnapshot(monthKey, value);
      }
    });
    // Only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, programs]);

  const computeWalletValue = useCallback(() => {
    const pointsValue = calculatePointsValue(balances, valuations, programs);
    const unusedBenefits = benefits
      .filter((b) => !b.usage?.cc_is_fully_used)
      .reduce((sum, b) => sum + b.cc_annual_total, 0);
    const totalFees = cardROIs.reduce((sum, r) => sum + r.annualFee, 0);
    return calculateWalletValue(pointsValue, unusedBenefits, totalFees);
  }, [balances, valuations, programs, benefits, cardROIs]);

  const walletValue = mounted ? computeWalletValue() : 0;
  const [delta, setDelta] = useState<number | null>(null);
  useEffect(() => {
    if (!mounted) return;
    getWalletSnapshots().then((snapshots) => {
      setDelta(calculateMonthlyDelta(walletValue, snapshots));
    });
  }, [mounted, walletValue]);

  const displayValue = useCountUp(Math.round(walletValue), 800);

  const handleProgramUpdate = (code: string, balance: number, cpp: number) => {
    const oldBalance = balances[code] ?? 0;
    const newBalances = { ...balances, [code]: balance };
    setBalances(newBalances);
    setPointsBalances(newBalances);

    if (oldBalance !== balance) {
      const program = programs.find((p) => p.code === code);
      const cppVal = program?.default_cpp ?? 1;
      logEvent("points_balance_updated", {
        program: code,
        old_balance: oldBalance,
        new_balance: balance,
        value_change: Math.round(((balance - oldBalance) * cppVal) / 100),
      });
    }

    const program = programs.find((p) => p.code === code);
    if (program && cpp !== program.default_cpp) {
      const newValuations = { ...valuations, [code]: cpp };
      setValuations(newValuations);
      setCustomValuations(newValuations);
    } else {
      const newValuations = { ...valuations };
      delete newValuations[code];
      setValuations(newValuations);
      setCustomValuations(newValuations);
    }
  };

  const isPositive = walletValue >= 0;

  return (
    <div className="rounded-xl border-3 border-[#2A3040] bg-bg-black p-6">
      {/* Hero value */}
      <div className="mb-6">
        <span className="font-display text-xs text-text-muted">
          YOUR WALLET IS WORTH
        </span>
        <div className="mt-1 flex flex-wrap items-baseline gap-3 sm:gap-4">
          <span
            className="font-mono-data text-3xl font-bold sm:text-5xl"
            style={{ color: isPositive ? "#39FF14" : "#FF3131" }}
          >
            {isPositive ? "" : "-"}${Math.abs(displayValue).toLocaleString()}
          </span>
          {delta !== null && (
            <span
              className="font-mono-data text-sm font-bold"
              style={{ color: delta >= 0 ? "#39FF14" : "#FF3131" }}
            >
              {delta >= 0 ? "\u25B2" : "\u25BC"} {delta >= 0 ? "+" : ""}{formatCurrency(delta)}
              <span className="ml-1 font-sans text-xs font-normal text-text-muted">
                this month
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Program blocks - horizontal scroll */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {programs.map((program) => (
          <ProgramBlock
            key={program.code}
            program={program}
            balance={balances[program.code] ?? 0}
            valuation={valuations[program.code] ?? program.default_cpp}
            onUpdate={(balance, cpp) => handleProgramUpdate(program.code, balance, cpp)}
          />
        ))}
      </div>
    </div>
  );
}

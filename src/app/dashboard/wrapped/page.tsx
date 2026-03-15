"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getAvailableWrappedMonths,
  getWrappedViewedState,
} from "@/lib/wrapped/queries";
import { getAllMonthlySnapshots } from "@/lib/storage/snapshots";
import type { MonthlySnapshot } from "@/lib/storage/snapshots";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function WrappedHistoryPage() {
  const [months, setMonths] = useState<string[]>([]);
  const [viewedMonths, setViewedMonths] = useState<string[]>([]);
  const [snapshots, setSnapshots] = useState<Record<string, MonthlySnapshot>>(
    {}
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [available, viewed, allSnaps] = await Promise.all([
        getAvailableWrappedMonths(),
        getWrappedViewedState(),
        getAllMonthlySnapshots(),
      ]);
      setMonths(available);
      setViewedMonths(viewed.months);
      setSnapshots(allSnaps);
      setLoading(false);
    }
    load();
  }, []);

  function getMonthLabel(key: string): string {
    const [year, monthStr] = key.split("-");
    const monthIndex = parseInt(monthStr, 10) - 1;
    return `${MONTH_NAMES[monthIndex]} ${year}`;
  }

  function getWalletDelta(key: string): number | null {
    const snap = snapshots[key];
    if (!snap) return null;
    const [year, monthStr] = key.split("-");
    let prevMonth = parseInt(monthStr, 10) - 1;
    let prevYear = parseInt(year, 10);
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear -= 1;
    }
    const prevKey = `${prevYear}-${String(prevMonth).padStart(2, "0")}`;
    const prevSnap = snapshots[prevKey];
    if (!prevSnap) return null;
    return snap.walletValue - prevSnap.walletValue;
  }

  // Current month info
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const nextMonthLabel = nextMonth.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-text-primary">
          Monthly Wrapped
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Your financial optimization journey, month by month.
        </p>
      </div>

      {/* Current month preview */}
      <div className="rounded-lg border border-border bg-bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text-primary">
              {getMonthLabel(currentMonthKey)}
            </p>
            <p className="text-xs text-text-muted">
              This month isn&apos;t over yet. Check back {nextMonthLabel} for
              your Wrapped.
            </p>
          </div>
          <span className="rounded-full bg-bg-elevated px-3 py-1 text-xs text-text-muted">
            In Progress
          </span>
        </div>
      </div>

      {/* Past months */}
      {months.length === 0 ? (
        <div className="rounded-lg border border-border bg-bg-card p-8 text-center">
          <p className="text-text-secondary">
            No past months available yet. Complete your first full month on
            CardClock to see your Wrapped here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {months.map((monthKey) => {
            const snap = snapshots[monthKey];
            const isNew = !viewedMonths.includes(monthKey);
            const walletDelta = getWalletDelta(monthKey);

            return (
              <Link
                key={monthKey}
                href={`/dashboard/wrapped/${monthKey}`}
                className="flex items-center justify-between rounded-lg border border-border bg-bg-card p-4 transition-colors hover:border-[#7A3B42] hover:bg-bg-elevated"
              >
                <div className="flex items-center gap-3">
                  {isNew && (
                    <span className="rounded-full bg-[#7A3B42] px-2 py-0.5 text-[10px] font-bold text-white">
                      NEW
                    </span>
                  )}
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {getMonthLabel(monthKey)}
                    </p>
                    <div className="mt-0.5 flex items-center gap-3 text-xs text-text-muted">
                      {snap && (
                        <>
                          <span>
                            {Math.round(snap.captureRate)}% capture rate
                          </span>
                          {walletDelta !== null && (
                            <span
                              className={
                                walletDelta >= 0
                                  ? "text-green"
                                  : "text-red"
                              }
                            >
                              {walletDelta >= 0 ? "+" : ""}$
                              {Math.abs(walletDelta).toLocaleString()}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-text-muted">View →</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

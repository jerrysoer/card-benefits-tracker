"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getAvailableWrappedMonths,
  getWrappedViewedState,
} from "@/lib/wrapped/queries";

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

export default function WrappedBanner() {
  const [unviewedMonth, setUnviewedMonth] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    async function check() {
      const months = await getAvailableWrappedMonths();
      if (months.length === 0) return;

      const viewed = await getWrappedViewedState();
      const latestMonth = months[0];

      if (!viewed.months.includes(latestMonth)) {
        setUnviewedMonth(latestMonth);
      }
    }
    check();
  }, []);

  if (!unviewedMonth || dismissed) return null;

  const [, monthStr] = unviewedMonth.split("-");
  const monthIndex = parseInt(monthStr, 10) - 1;
  const monthName = MONTH_NAMES[monthIndex];

  return (
    <div className="rounded-lg border-2 border-[#7A3B42] bg-bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✨</span>
          <div>
            <p className="text-sm font-medium text-text-primary">
              Your {monthName} Wrapped is ready!
            </p>
            <p className="text-xs text-text-muted">
              See your monthly recap and share your results.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/wrapped/${unviewedMonth}`}
            className="rounded-lg border-2 border-[#7A3B42] px-4 py-1.5 font-display text-xs text-[#7A3B42] transition-opacity hover:opacity-80"
          >
            VIEW →
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-text-muted hover:text-text-secondary"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { getIncomeData, setIncomeData } from "@/lib/fullwallet/storage";

interface IncomeInputProps {
  onUpdate?: (annualIncome: number | null) => void;
}

export default function IncomeInput({ onUpdate }: IncomeInputProps) {
  const [income, setIncome] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await getIncomeData();
      if (data) {
        setIncome(String(data.annualIncome));
        onUpdate?.(data.annualIncome);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSave() {
    const val = parseFloat(income) || 0;
    if (val > 0) {
      await setIncomeData(val);
      onUpdate?.(val);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      onUpdate?.(null);
    }
  }

  const hasIncome = parseFloat(income) > 0;

  if (!isExpanded && !hasIncome) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full rounded-lg border border-dashed border-border bg-bg-card px-4 py-3 text-left text-xs text-text-muted transition-colors hover:border-text-muted hover:text-text-secondary"
      >
        + Add annual income for personalized ratios and financial score
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-bg-card px-4 py-3">
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className="mb-1 block text-xs text-text-muted">
            Annual Pre-Tax Income
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-muted">
              $
            </span>
            <input
              type="number"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              placeholder="0"
              className="w-full rounded-md border border-border bg-bg-elevated py-2 pl-7 pr-3 font-mono-data text-sm text-text-primary placeholder:text-text-muted focus:border-teal focus:outline-none"
            />
          </div>
        </div>
        <button
          onClick={handleSave}
          className="rounded-md bg-teal px-4 py-2 text-sm font-medium text-white transition-colors"
        >
          {saved ? "Saved" : "Save"}
        </button>
      </div>
      <p className="mt-1 text-[10px] text-text-muted">
        Used for ratios only. Never shared. Stored locally.
      </p>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import type { PointsProgram } from "@/lib/supabase/types";
import { formatCurrency } from "@/lib/benefits/roi";

interface ProgramBlockProps {
  program: PointsProgram;
  balance: number;
  valuation: number;
  onUpdate: (balance: number, valuation: number) => void;
}

function useCountUp(target: number, duration: number = 800): number {
  const [value, setValue] = useState(0);
  const prevTarget = useRef(0);

  useEffect(() => {
    const start = prevTarget.current;
    prevTarget.current = target;
    if (target === 0) { setValue(0); return; }

    const startTime = performance.now();
    let frame: number;
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(start + (target - start) * eased));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}

export default function ProgramBlock({ program, balance, valuation, onUpdate }: ProgramBlockProps) {
  const [editing, setEditing] = useState(false);
  const [editBalance, setEditBalance] = useState(String(balance));
  const [editCpp, setEditCpp] = useState(String(valuation));

  const dollarValue = (balance * valuation) / 100;
  const displayBalance = useCountUp(balance);
  const isDimmed = balance === 0;

  const handleSave = () => {
    const newBalance = Math.max(0, parseInt(editBalance) || 0);
    const newCpp = Math.max(0.1, parseFloat(editCpp) || valuation);
    onUpdate(newBalance, newCpp);
    setEditing(false);
  };

  if (editing) {
    return (
      <div
        className="flex w-44 shrink-0 flex-col gap-2 rounded-lg border-3 p-4"
        style={{ borderColor: program.color, backgroundColor: "#1A1A1A" }}
      >
        <span className="font-display text-xs" style={{ color: program.color }}>
          {program.short_name}
        </span>
        <div>
          <label className="text-xs text-text-muted">Points Balance</label>
          <input
            type="number"
            value={editBalance}
            onChange={(e) => setEditBalance(e.target.value)}
            className="mt-1 w-full rounded border border-[#2A3040] bg-[#252525] px-2 py-1 font-mono-data text-sm text-text-primary focus:border-neon-blue focus:outline-none"
            autoFocus
          />
        </div>
        <div>
          <label className="text-xs text-text-muted">Valuation (¢/pt)</label>
          <input
            type="number"
            step="0.1"
            value={editCpp}
            onChange={(e) => setEditCpp(e.target.value)}
            className="mt-1 w-full rounded border border-[#2A3040] bg-[#252525] px-2 py-1 font-mono-data text-sm text-text-primary focus:border-neon-blue focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 cursor-pointer rounded bg-neon-blue px-2 py-1 text-xs font-bold text-black transition-opacity hover:opacity-80"
          >
            Save
          </button>
          <button
            onClick={() => setEditing(false)}
            className="flex-1 cursor-pointer rounded border border-[#2A3040] px-2 py-1 text-xs text-text-muted transition-colors hover:text-text-primary"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => {
        setEditBalance(String(balance));
        setEditCpp(String(valuation));
        setEditing(true);
      }}
      className={`flex w-36 shrink-0 cursor-pointer flex-col rounded-lg border-3 p-4 text-left transition-colors hover:bg-bg-card-hover-neo ${
        isDimmed ? "opacity-40" : ""
      }`}
      style={{ borderColor: program.color, backgroundColor: "#1A1A1A" }}
    >
      <span className="font-display text-xs" style={{ color: program.color }}>
        {program.short_name}
      </span>
      <span className="mt-2 font-mono-data text-xl font-bold text-text-primary">
        {displayBalance.toLocaleString()}
      </span>
      <span className="font-mono-data text-sm font-bold" style={{ color: "#FFD700" }}>
        {formatCurrency(dollarValue)}
      </span>
      <span className="mt-1 font-mono-data text-xs text-text-muted">
        {valuation.toFixed(1)}¢/pt
      </span>
    </button>
  );
}

export { useCountUp };

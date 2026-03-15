"use client";

import { useState, useEffect } from "react";
import type { PointsProgram } from "@/lib/supabase/types";
import { loadPointsPrograms } from "@/lib/points";
import { getPointsBalances } from "@/lib/storage";
import {
  getRedemptions,
  logRedemption,
  calculateBurnRate,
  calculateRunway,
  getRunwayColor,
  getHoarderNudge,
  type Redemption,
} from "@/lib/burn-rate";

export default function BurnRate() {
  const [programs, setPrograms] = useState<PointsProgram[]>([]);
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [mounted, setMounted] = useState(false);

  // Redemption form
  const [showForm, setShowForm] = useState(false);
  const [formProgram, setFormProgram] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formNote, setFormNote] = useState("");

  useEffect(() => {
    const progs = loadPointsPrograms();
    setPrograms(progs);
    Promise.all([getPointsBalances(), getRedemptions()]).then(([b, r]) => {
      setBalances(b);
      setRedemptions(r);
      setMounted(true);
    });
  }, []);

  if (!mounted) return null;

  const activePrograms = programs.filter((p) => (balances[p.code] ?? 0) > 0);

  if (activePrograms.length === 0) return null;

  const handleLogRedemption = async () => {
    if (!formProgram || !formAmount) return;
    await logRedemption(formProgram, parseInt(formAmount), formNote || "redemption");
    const updated = await getRedemptions();
    setRedemptions(updated);
    setShowForm(false);
    setFormAmount("");
    setFormNote("");
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-sm text-text-secondary">POINTS RUNWAY</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (!formProgram && activePrograms.length > 0) {
              setFormProgram(activePrograms[0].code);
            }
          }}
          className="text-xs text-text-secondary transition-opacity hover:opacity-80"
        >
          {showForm ? "CANCEL" : "LOG REDEMPTION"}
        </button>
      </div>

      {/* Redemption form */}
      {showForm && (
        <div className="mb-4 rounded-lg border border-border bg-bg-card p-4 shadow-card">
          <div className="flex flex-wrap gap-3">
            <select
              value={formProgram}
              onChange={(e) => setFormProgram(e.target.value)}
              className="rounded border border-border bg-bg-elevated px-3 py-2 text-xs text-text-primary focus:border-teal focus:outline-none"
            >
              {activePrograms.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.short_name}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Points"
              value={formAmount}
              onChange={(e) => setFormAmount(e.target.value)}
              className="w-24 rounded border border-border bg-bg-elevated px-3 py-2 text-xs text-text-primary focus:border-teal focus:outline-none"
            />
            <input
              type="text"
              placeholder="Note (optional)"
              value={formNote}
              onChange={(e) => setFormNote(e.target.value)}
              className="flex-1 rounded border border-border bg-bg-elevated px-3 py-2 text-xs text-text-primary focus:border-teal focus:outline-none"
            />
            <button
              onClick={handleLogRedemption}
              className="rounded-full bg-teal px-4 py-2 text-xs font-bold text-white transition-opacity hover:opacity-80"
            >
              Log
            </button>
          </div>
        </div>
      )}

      {/* Per-program runway bars */}
      <div className="space-y-3">
        {activePrograms.map((program) => {
          const balance = balances[program.code] ?? 0;
          const burnRate = calculateBurnRate(redemptions, program.code);
          const runway = calculateRunway(balance, burnRate);
          const color = getRunwayColor(runway);
          const cpp = program.default_cpp;
          const dollarValue = (balance * cpp) / 100;

          const barWidth =
            runway === null
              ? 100
              : Math.min((runway / 24) * 100, 100);

          return (
            <div
              key={program.code}
              className="rounded-lg border border-border bg-bg-card p-3 shadow-card"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-sm"
                    style={{ backgroundColor: program.color }}
                  />
                  <span className="text-xs font-medium text-text-primary">
                    {program.short_name}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono-data text-xs text-text-muted">
                    {balance.toLocaleString()} pts
                  </span>
                  <span className="font-mono-data text-xs font-bold" style={{ color }}>
                    {runway === null ? "∞" : `${runway}mo`}
                  </span>
                </div>
              </div>

              {/* Bar */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor: color,
                  }}
                />
              </div>

              {/* Hoarder nudge */}
              {runway === null && dollarValue > 100 && (
                <p className="mt-2 text-xs text-text-secondary">
                  {getHoarderNudge(program.short_name, dollarValue)}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

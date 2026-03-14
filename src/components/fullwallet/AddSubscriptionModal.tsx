"use client";

import { useState } from "react";
import {
  SUBSCRIPTION_CATEGORIES,
  type SubscriptionCategory,
  type Subscription,
} from "@/lib/fullwallet/types";

interface AddSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sub: {
    name: string;
    monthlyCost: number;
    billingCycle: "monthly" | "annual";
    category: SubscriptionCategory;
  }) => void;
  editingSub?: Subscription | null;
}

export default function AddSubscriptionModal({
  isOpen,
  onClose,
  onSave,
  editingSub,
}: AddSubscriptionModalProps) {
  const [name, setName] = useState(editingSub?.name ?? "");
  const [cost, setCost] = useState(
    editingSub
      ? editingSub.billingCycle === "annual"
        ? String(editingSub.annualCost)
        : String(editingSub.monthlyCost)
      : ""
  );
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    editingSub?.billingCycle ?? "monthly"
  );
  const [category, setCategory] = useState<SubscriptionCategory>(
    editingSub?.category ?? "other"
  );

  if (!isOpen) return null;

  const costNum = parseFloat(cost) || 0;
  const monthlyCost =
    billingCycle === "annual" ? costNum / 12 : costNum;
  const annualDisplay =
    billingCycle === "annual" ? costNum : costNum * 12;
  const isValid = name.trim().length > 0 && costNum > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    onSave({
      name: name.trim(),
      monthlyCost: Math.round(monthlyCost * 100) / 100,
      billingCycle,
      category,
    });
    setName("");
    setCost("");
    setBillingCycle("monthly");
    setCategory("other");
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-xl border border-border bg-bg-card p-6 shadow-2xl">
        <h2 className="mb-4 font-display text-sm tracking-wide text-text-primary">
          {editingSub ? "EDIT SUBSCRIPTION" : "ADD SUBSCRIPTION"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs text-text-muted">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Netflix, Gym, Spotify..."
              className="w-full rounded-md border border-border bg-bg-elevated px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-[#60A5FA] focus:outline-none"
              autoFocus
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-text-muted">
              Billing Cycle
            </label>
            <div className="flex gap-2">
              {(["monthly", "annual"] as const).map((cycle) => (
                <button
                  key={cycle}
                  type="button"
                  onClick={() => setBillingCycle(cycle)}
                  className={`rounded-md px-4 py-2 text-xs font-medium transition-colors ${
                    billingCycle === cycle
                      ? "bg-[#60A5FA]/15 text-[#60A5FA]"
                      : "bg-bg-elevated text-text-muted hover:text-text-secondary"
                  }`}
                >
                  {cycle === "monthly" ? "Monthly" : "Annual"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-text-muted">
              {billingCycle === "annual" ? "Annual Cost" : "Monthly Cost"}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-muted">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-md border border-border bg-bg-elevated py-2 pl-7 pr-3 font-mono-data text-sm text-text-primary placeholder:text-text-muted focus:border-[#60A5FA] focus:outline-none"
              />
            </div>
            {costNum > 0 && (
              <p className="mt-1 text-xs text-text-muted">
                {billingCycle === "annual"
                  ? `$${monthlyCost.toFixed(2)}/mo`
                  : `$${annualDisplay.toFixed(2)}/yr`}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs text-text-muted">
              Category
            </label>
            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as SubscriptionCategory)
              }
              className="w-full rounded-md border border-border bg-bg-elevated px-3 py-2 text-sm text-text-primary focus:border-[#60A5FA] focus:outline-none"
            >
              {SUBSCRIPTION_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm text-text-muted hover:text-text-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className="rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-40"
              style={{
                backgroundColor: isValid ? "#39FF14" : undefined,
                color: isValid ? "#0C0F14" : undefined,
              }}
            >
              {editingSub ? "Save" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

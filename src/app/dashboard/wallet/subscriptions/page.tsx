"use client";

import { useState, useEffect, useCallback } from "react";
import type { Subscription, SubscriptionCategory } from "@/lib/fullwallet/types";
import {
  getSubscriptions,
  addSubscription,
  updateSubscription,
  removeSubscription,
  toggleSubscriptionUsed,
  resetUsedThisMonth,
} from "@/lib/fullwallet/storage";
import { calculateSubscriptionStats } from "@/lib/fullwallet/calculations";
import { getSubscriptionVerdict } from "@/lib/fullwallet/verdicts";
import SubscriptionRow from "@/components/fullwallet/SubscriptionRow";
import AddSubscriptionModal from "@/components/fullwallet/AddSubscriptionModal";
import CategoryBar from "@/components/fullwallet/CategoryBar";

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);

  const loadSubs = useCallback(async () => {
    await resetUsedThisMonth();
    const data = await getSubscriptions();
    setSubs(data);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    loadSubs();
  }, [loadSubs]);

  async function handleAdd(sub: {
    name: string;
    monthlyCost: number;
    billingCycle: "monthly" | "annual";
    category: SubscriptionCategory;
  }) {
    if (editingSub) {
      await updateSubscription(editingSub.id, sub);
    } else {
      await addSubscription(sub);
    }
    setEditingSub(null);
    await loadSubs();
  }

  async function handleToggle(id: string) {
    await toggleSubscriptionUsed(id);
    await loadSubs();
  }

  async function handleDelete(id: string) {
    await removeSubscription(id);
    await loadSubs();
  }

  function handleEdit(sub: Subscription) {
    setEditingSub(sub);
    setShowModal(true);
  }

  if (!isLoaded) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-text-muted">Loading subscriptions...</p>
      </div>
    );
  }

  const stats = calculateSubscriptionStats(subs);
  const sorted = [...subs].sort((a, b) => b.monthlyCost - a.monthlyCost);
  const unusedMonthlyCost = stats.unusedSubs.reduce(
    (sum, s) => sum + s.monthlyCost,
    0
  );

  return (
    <div className="space-y-6">
      {/* Hero Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-bg-card px-4 py-3 text-center">
          <div className="font-mono-data text-2xl font-bold text-text-primary">
            {stats.count}
          </div>
          <div className="text-xs uppercase tracking-wide text-text-muted">
            Subscriptions
          </div>
        </div>
        <div className="rounded-lg border border-border bg-bg-card px-4 py-3 text-center">
          <div className="font-mono-data text-2xl font-bold text-text-primary">
            ${stats.monthlyTotal.toFixed(0)}
          </div>
          <div className="text-xs uppercase tracking-wide text-text-muted">
            Per Month
          </div>
        </div>
        <div className="rounded-lg border border-border bg-bg-card px-4 py-3 text-center">
          <div className="font-mono-data text-2xl font-bold text-text-primary">
            ${stats.annualTotal.toLocaleString()}
          </div>
          <div className="text-xs uppercase tracking-wide text-text-muted">
            Per Year
          </div>
        </div>
      </div>

      {/* Add Button */}
      <button
        onClick={() => {
          setEditingSub(null);
          setShowModal(true);
        }}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-bg-card px-4 py-3 text-sm text-text-muted transition-colors hover:border-text-muted hover:text-text-secondary"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Add Subscription
      </button>

      {/* Unused Callout */}
      {stats.unusedSubs.length > 0 && (
        <div className="rounded-lg border border-[#F87171]/30 bg-[#F87171]/5 px-4 py-3">
          <div className="mb-1 font-display text-xs tracking-wide text-[#F87171]">
            UNUSED THIS MONTH
          </div>
          <div className="mb-2 space-y-1">
            {stats.unusedSubs.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-text-secondary">{sub.name}</span>
                <span className="font-mono-data text-text-muted">
                  ${sub.monthlyCost.toFixed(0)}/mo &middot; $
                  {sub.annualCost.toFixed(0)}/yr
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-text-secondary">
            {getSubscriptionVerdict(stats.unusedSubs.length, unusedMonthlyCost)}
          </p>
        </div>
      )}

      {/* Subscription List */}
      {sorted.length > 0 ? (
        <div className="space-y-2">
          {sorted.map((sub, i) => (
            <SubscriptionRow
              key={sub.id}
              subscription={sub}
              onToggleUsed={handleToggle}
              onEdit={handleEdit}
              onDelete={handleDelete}
              index={i}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-bg-card px-6 py-12 text-center">
          <p className="text-sm text-text-muted">
            No subscriptions yet. Add your first one to start tracking.
          </p>
        </div>
      )}

      {/* Category Breakdown */}
      {Object.keys(stats.categoryBreakdown).length > 0 && (
        <div className="rounded-lg border border-border bg-bg-card px-4 py-3">
          <div className="mb-3 font-display text-xs tracking-wide text-text-muted">
            SPEND BY CATEGORY
          </div>
          <CategoryBar breakdown={stats.categoryBreakdown} />
        </div>
      )}

      {/* Modal */}
      <AddSubscriptionModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingSub(null);
        }}
        onSave={handleAdd}
        editingSub={editingSub}
      />
    </div>
  );
}

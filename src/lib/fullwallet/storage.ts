import { storage } from "@/lib/storage/adapter";
import { STORAGE_KEYS } from "@/lib/storage/keys";
import { logEvent } from "@/lib/storage/event-log";
import type {
  Subscription,
  NetWorthSnapshot,
  SavingsEntry,
  IncomeData,
} from "./types";

const MAX_NET_WORTH_SNAPSHOTS = 120;

// --- Subscriptions ---

export async function getSubscriptions(): Promise<Subscription[]> {
  return storage.get<Subscription[]>(STORAGE_KEYS.subscriptions, []);
}

export async function addSubscription(
  sub: Omit<Subscription, "id" | "annualCost" | "usedThisMonth" | "usedLastToggled" | "createdAt">
): Promise<Subscription> {
  const subs = await getSubscriptions();
  const now = new Date().toISOString();
  const annualCost =
    sub.billingCycle === "annual"
      ? sub.monthlyCost * 12
      : sub.monthlyCost * 12;
  const newSub: Subscription = {
    ...sub,
    id: crypto.randomUUID(),
    annualCost,
    usedThisMonth: false,
    usedLastToggled: now,
    createdAt: now,
  };
  subs.push(newSub);
  await storage.set(STORAGE_KEYS.subscriptions, subs);
  await logEvent("subscription_added", {
    name: newSub.name,
    monthlyCost: newSub.monthlyCost,
    category: newSub.category,
  });
  return newSub;
}

export async function updateSubscription(
  id: string,
  updates: Partial<Pick<Subscription, "name" | "monthlyCost" | "billingCycle" | "category">>
): Promise<void> {
  const subs = await getSubscriptions();
  const idx = subs.findIndex((s) => s.id === id);
  if (idx === -1) return;
  const sub = subs[idx];
  if (updates.name !== undefined) sub.name = updates.name;
  if (updates.monthlyCost !== undefined) sub.monthlyCost = updates.monthlyCost;
  if (updates.billingCycle !== undefined) sub.billingCycle = updates.billingCycle;
  if (updates.category !== undefined) sub.category = updates.category;
  sub.annualCost = sub.monthlyCost * 12;
  subs[idx] = sub;
  await storage.set(STORAGE_KEYS.subscriptions, subs);
}

export async function removeSubscription(id: string): Promise<void> {
  const subs = await getSubscriptions();
  const sub = subs.find((s) => s.id === id);
  if (!sub) return;
  const filtered = subs.filter((s) => s.id !== id);
  await storage.set(STORAGE_KEYS.subscriptions, filtered);
  await logEvent("subscription_removed", {
    name: sub.name,
    monthlyCost: sub.monthlyCost,
  });
}

export async function toggleSubscriptionUsed(id: string): Promise<void> {
  const subs = await getSubscriptions();
  const idx = subs.findIndex((s) => s.id === id);
  if (idx === -1) return;
  subs[idx].usedThisMonth = !subs[idx].usedThisMonth;
  subs[idx].usedLastToggled = new Date().toISOString();
  await storage.set(STORAGE_KEYS.subscriptions, subs);
}

export async function resetUsedThisMonth(): Promise<void> {
  const subs = await getSubscriptions();
  if (subs.length === 0) return;

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  // Check if any sub was last toggled in a previous month
  const needsReset = subs.some((s) => {
    const toggleDate = new Date(s.usedLastToggled);
    const toggleMonth = `${toggleDate.getFullYear()}-${String(toggleDate.getMonth() + 1).padStart(2, "0")}`;
    return toggleMonth < currentMonth && s.usedThisMonth;
  });

  if (!needsReset) return;

  for (const sub of subs) {
    const toggleDate = new Date(sub.usedLastToggled);
    const toggleMonth = `${toggleDate.getFullYear()}-${String(toggleDate.getMonth() + 1).padStart(2, "0")}`;
    if (toggleMonth < currentMonth) {
      sub.usedThisMonth = false;
    }
  }
  await storage.set(STORAGE_KEYS.subscriptions, subs);
}

// --- Net Worth Snapshots ---

export async function getNetWorthSnapshots(): Promise<NetWorthSnapshot[]> {
  return storage.get<NetWorthSnapshot[]>(STORAGE_KEYS.netWorthSnapshots, []);
}

export async function addNetWorthSnapshot(
  snapshot: NetWorthSnapshot
): Promise<void> {
  const snapshots = await getNetWorthSnapshots();
  snapshots.push(snapshot);
  // Enforce max 120 snapshots
  while (snapshots.length > MAX_NET_WORTH_SNAPSHOTS) {
    snapshots.shift();
  }
  await storage.set(STORAGE_KEYS.netWorthSnapshots, snapshots);
  await logEvent("net_worth_updated", {
    cash: snapshot.cash,
    investments: snapshot.investments,
    pointsValue: snapshot.pointsValue,
    debt: snapshot.debt,
    netWorth: snapshot.netWorth,
  });
}

export async function getLatestNetWorth(): Promise<NetWorthSnapshot | null> {
  const snapshots = await getNetWorthSnapshots();
  return snapshots.length > 0 ? snapshots[snapshots.length - 1] : null;
}

// --- Savings Entries ---

export async function getSavingsEntries(): Promise<SavingsEntry[]> {
  return storage.get<SavingsEntry[]>(STORAGE_KEYS.savingsEntries, []);
}

export async function addOrUpdateSavingsEntry(
  month: string,
  amount: number,
  source: "manual" | "calculated" = "manual"
): Promise<void> {
  const entries = await getSavingsEntries();
  const idx = entries.findIndex((e) => e.month === month);
  const now = new Date().toISOString();

  if (idx >= 0) {
    entries[idx].amount = amount;
    entries[idx].source = source;
    entries[idx].loggedAt = now;
  } else {
    entries.push({ month, amount, source, loggedAt: now });
  }

  // Sort by month
  entries.sort((a, b) => a.month.localeCompare(b.month));
  await storage.set(STORAGE_KEYS.savingsEntries, entries);
  await logEvent("savings_logged", { month, amount, source });
}

// --- Income Data ---

export async function getIncomeData(): Promise<IncomeData | null> {
  return storage.get<IncomeData | null>(STORAGE_KEYS.incomeData, null);
}

export async function setIncomeData(annualIncome: number): Promise<void> {
  await storage.set(STORAGE_KEYS.incomeData, {
    annualIncome,
    updatedAt: new Date().toISOString(),
  });
}

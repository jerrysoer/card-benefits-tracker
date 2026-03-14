/**
 * Deterministic verdict generation for Full Wallet features.
 * Uses same hash+pick pattern as src/lib/wrapped/verdicts.ts.
 */

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function pick(pool: string[], seed: string): string {
  return pool[simpleHash(seed) % pool.length];
}

// --- Subscription Verdicts (snarky voice) ---

export function getSubscriptionVerdict(
  unusedCount: number,
  unusedMonthlyCost: number
): string {
  const annualWaste = Math.round(unusedMonthlyCost * 12);

  if (unusedCount === 0) {
    return "Every subscription earned its keep this month. Respect.";
  }

  if (unusedCount <= 2) {
    return pick(
      [
        `You're paying $${unusedMonthlyCost}/mo for things you didn't touch. That's $${annualWaste}/yr you could put toward literally anything else.`,
        `${unusedCount} subscription${unusedCount > 1 ? "s" : ""} collecting dust. That's $${annualWaste}/yr in auto-pay guilt.`,
        `$${unusedMonthlyCost}/mo in subscriptions you forgot existed. Cancel one. Future you says thanks.`,
      ],
      `sub-verdict-${unusedCount}-${unusedMonthlyCost}`
    );
  }

  return pick(
    [
      `You have ${unusedCount} subscriptions you didn't use this month. That's $${annualWaste}/yr in subscriptions you forgot to cancel. We've all been there.`,
      `${unusedCount} unused subscriptions. $${unusedMonthlyCost}/mo walking out the door. Time for an audit.`,
      `$${annualWaste}/yr in unused subscriptions. That's a vacation you're giving to streaming companies instead.`,
    ],
    `sub-verdict-${unusedCount}-${unusedMonthlyCost}`
  );
}

// --- Net Worth Verdicts (empathetic, factual) ---

export function getNetWorthVerdict(
  netWorth: number,
  delta: number | null
): string {
  if (netWorth < 0) {
    if (delta !== null && delta > 0) {
      return "You're at negative net worth, but you're moving in the right direction. That's what matters.";
    }
    return "You're in the negative. That's normal with student loans. Focus on the trajectory — are you moving toward zero?";
  }

  if (netWorth === 0) {
    return "Net zero. You've climbed out of the negative or you're just getting started. Either way, the only direction is up.";
  }

  if (delta !== null && delta > 0) {
    return pick(
      [
        "Growing steadily. Keep the momentum.",
        "Up from last time. The compound effect is real.",
        "Positive trajectory. This is how wealth is built — one update at a time.",
      ],
      `nw-${netWorth}-${delta}`
    );
  }

  if (delta !== null && delta < 0) {
    return "Down from last time. Markets fluctuate, expenses happen. The long-term trend is what counts.";
  }

  return "First snapshot recorded. Come back next month to see your trajectory.";
}

// --- Savings Verdicts (encouraging coach voice) ---

export function getSavingsVerdict(avgMonthlySavings: number): string {
  if (avgMonthlySavings >= 2000) {
    return pick(
      [
        "You're outpacing most people your age. Keep it up.",
        "Serious savings rate. Future you is going to be very comfortable.",
        "This kind of consistency builds real wealth. Respect.",
      ],
      `savings-${Math.round(avgMonthlySavings)}`
    );
  }

  if (avgMonthlySavings >= 1000) {
    return pick(
      [
        "Solid savings rate. Consistency beats intensity.",
        "Four figures a month. That adds up faster than you think.",
        "You're building something real. Keep showing up.",
      ],
      `savings-${Math.round(avgMonthlySavings)}`
    );
  }

  if (avgMonthlySavings >= 500) {
    return pick(
      [
        "Every dollar counts. You're building a foundation.",
        "$500+/mo is $6K+/yr — that's a safety net or a trip. Your call.",
        "Steady progress. Small steps, big distance over time.",
      ],
      `savings-${Math.round(avgMonthlySavings)}`
    );
  }

  if (avgMonthlySavings > 0) {
    return pick(
      [
        "Small steps add up. $500/mo is $6K/yr — that's a trip or a safety net.",
        "You're saving something, and that matters more than the amount.",
        "The habit is what counts. The amount grows with time.",
      ],
      `savings-${Math.round(avgMonthlySavings)}`
    );
  }

  return "Tough month. It happens. The goal is the average, not the streak.";
}

// --- Ratio Verdicts (contextual per ratio) ---

export function getRatioVerdict(
  ratioType: "fees" | "captured" | "subscriptions" | "savings",
  value: number
): string {
  switch (ratioType) {
    case "fees":
      if (value < 1) return "Your fees are a rounding error.";
      if (value <= 3) return "Reasonable if you're capturing the value.";
      return "Your fees are heavy relative to income. Make sure every card is earning its keep.";

    case "captured":
      if (value > 3) return "You're extracting serious value from your cards.";
      if (value > 1) return "Solid value capture relative to income.";
      return "Room to capture more from your cards.";

    case "subscriptions":
      if (value < 3) return "Subscriptions are well within budget.";
      if (value <= 5) return "Moderate subscription spend. Keep an eye on it.";
      return "Your subscription spend is significant. Time for an audit.";

    case "savings":
      if (value >= 20) return "You're saving aggressively. Future you says thanks.";
      if (value >= 10) return "Solid savings rate. You're building.";
      if (value >= 5) return "Room to grow. Even 1% more is real money at your income.";
      return "Your cards capture more value than you save. That's backwards.";
  }
}

// --- Financial Score Verdict (supportive) ---

export function getFinancialScoreVerdict(score: number): string {
  if (score >= 90) {
    return pick(
      [
        "You're thriving. This is elite-level financial awareness.",
        "Top tier. You've got the full picture dialed in.",
      ],
      `fs-${score}`
    );
  }
  if (score >= 75) {
    return pick(
      [
        "Strong foundation. A few optimizations away from thriving.",
        "You're in great shape. Keep the momentum going.",
      ],
      `fs-${score}`
    );
  }
  if (score >= 60) {
    return pick(
      [
        "Building something real. Every improvement compounds.",
        "You're on the right track. Small wins add up fast.",
      ],
      `fs-${score}`
    );
  }
  if (score >= 40) {
    return pick(
      [
        "Work in progress — and that's okay. Awareness is step one.",
        "You're paying attention, and that puts you ahead of most people.",
      ],
      `fs-${score}`
    );
  }
  return pick(
    [
      "Everyone starts somewhere. The fact that you're here means you care.",
      "Getting started is the hardest part. You've already done it.",
    ],
    `fs-${score}`
  );
}

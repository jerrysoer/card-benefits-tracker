import { storage } from "./adapter";
import { STORAGE_KEYS } from "./keys";

export type EventType =
  // Card actions
  | "card_added"
  | "card_removed"
  // Benefit actions
  | "benefit_marked_used"
  | "benefit_unmarked"
  | "benefit_expired_unused"
  // Points actions
  | "points_balance_updated"
  | "points_redeemed"
  // Score events
  | "grade_changed"
  | "wallet_score_changed"
  | "streak_incremented"
  | "streak_broken"
  // Phase 3 events
  | "badge_unlocked"
  | "challenge_completed"
  | "challenge_generated"
  | "roast_generated"
  | "card_open_date_set"
  | "flex_card_exported"
  | "redemption_logged"
  // Phase 5 events (reserved)
  | "subscription_added"
  | "subscription_removed"
  | "net_worth_updated"
  | "savings_logged";

export interface AppEvent {
  type: EventType;
  timestamp: string;
  data: Record<string, unknown>;
}

const MAX_EVENTS = 2000;

export async function logEvent(
  type: EventType,
  data: Record<string, unknown> = {}
): Promise<void> {
  const events = await storage.get<AppEvent[]>(STORAGE_KEYS.eventLog, []);
  events.push({
    type,
    timestamp: new Date().toISOString(),
    data,
  });
  if (events.length > MAX_EVENTS) {
    events.splice(0, events.length - MAX_EVENTS);
  }
  await storage.set(STORAGE_KEYS.eventLog, events);
}

export async function getEventsForMonth(
  year: number,
  month: number
): Promise<AppEvent[]> {
  const events = await storage.get<AppEvent[]>(STORAGE_KEYS.eventLog, []);
  return events.filter((e) => {
    const d = new Date(e.timestamp);
    return d.getFullYear() === year && d.getMonth() === month;
  });
}

export async function getEventsForYear(year: number): Promise<AppEvent[]> {
  const events = await storage.get<AppEvent[]>(STORAGE_KEYS.eventLog, []);
  return events.filter((e) => new Date(e.timestamp).getFullYear() === year);
}

export async function getEventsByType(type: EventType): Promise<AppEvent[]> {
  const events = await storage.get<AppEvent[]>(STORAGE_KEYS.eventLog, []);
  return events.filter((e) => e.type === type);
}

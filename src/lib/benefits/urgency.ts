import type { UrgencyState } from "@/lib/supabase/types";

/**
 * Classify urgency based on days remaining until benefit expires.
 * green: >14 days — safe, plenty of time
 * amber: 7-14 days — warning, use soon
 * red: <7 days — urgent, expiring soon
 */
export function getUrgencyState(daysRemaining: number): UrgencyState {
  if (daysRemaining > 14) return "green";
  if (daysRemaining > 7) return "amber";
  return "red";
}

/**
 * Get CSS classes for urgency state
 */
export function getUrgencyClasses(urgency: UrgencyState | "used"): string {
  switch (urgency) {
    case "green":
      return "urgency-green";
    case "amber":
      return "urgency-amber";
    case "red":
      return "urgency-red";
    case "used":
      return "urgency-used";
  }
}

/**
 * Get the urgency color hex value
 */
export function getUrgencyColor(urgency: UrgencyState | "used"): string {
  switch (urgency) {
    case "green":
      return "#34D399";
    case "amber":
      return "#FBBF24";
    case "red":
      return "#F87171";
    case "used":
      return "#525C6E";
  }
}

/**
 * Get urgency label for accessibility
 */
export function getUrgencyLabel(urgency: UrgencyState): string {
  switch (urgency) {
    case "green":
      return "Safe — plenty of time";
    case "amber":
      return "Warning — use soon";
    case "red":
      return "Urgent — expiring soon";
  }
}

/**
 * Sort priority: red (0) > amber (1) > green (2)
 * Lower number = higher urgency = sorted first
 */
export function getUrgencySortPriority(urgency: UrgencyState | "used"): number {
  switch (urgency) {
    case "red":
      return 0;
    case "amber":
      return 1;
    case "green":
      return 2;
    case "used":
      return 3;
  }
}

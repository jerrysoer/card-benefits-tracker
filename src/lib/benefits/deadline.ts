import type { Benefit } from "@/lib/supabase/types";

export interface PeriodInfo {
  start: Date;
  end: Date;
  daysRemaining: number;
}

/**
 * Calculate the current benefit period and days remaining.
 *
 * Handles all period types (monthly, quarterly, semi_annual, annual)
 * and both reset types (calendar, cardmember_anniversary).
 */
export function getCurrentPeriod(
  benefit: Benefit,
  cardOpenDate: Date | null,
  now: Date = new Date()
): PeriodInfo {
  if (
    benefit.cc_reset_type === "cardmember_anniversary" &&
    cardOpenDate !== null
  ) {
    return getAnniversaryPeriod(benefit.cc_benefit_period, cardOpenDate, now);
  }
  return getCalendarPeriod(benefit.cc_benefit_period, now);
}

function getCalendarPeriod(
  period: Benefit["cc_benefit_period"],
  now: Date
): PeriodInfo {
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed

  let start: Date;
  let end: Date;

  switch (period) {
    case "monthly":
      start = new Date(year, month, 1);
      end = new Date(year, month + 1, 0); // last day of current month
      break;

    case "quarterly": {
      const quarterStart = Math.floor(month / 3) * 3;
      start = new Date(year, quarterStart, 1);
      end = new Date(year, quarterStart + 3, 0);
      break;
    }

    case "semi_annual": {
      const halfStart = month < 6 ? 0 : 6;
      start = new Date(year, halfStart, 1);
      end = new Date(year, halfStart + 6, 0);
      break;
    }

    case "annual":
      start = new Date(year, 0, 1);
      end = new Date(year, 11, 31);
      break;

    default:
      start = new Date(year, month, 1);
      end = new Date(year, month + 1, 0);
  }

  const daysRemaining = Math.max(
    0,
    Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  );

  return { start, end, daysRemaining };
}

function getAnniversaryPeriod(
  period: Benefit["cc_benefit_period"],
  cardOpenDate: Date,
  now: Date
): PeriodInfo {
  const openDay = cardOpenDate.getDate();
  const openMonth = cardOpenDate.getMonth();
  const year = now.getFullYear();

  let start: Date;
  let end: Date;

  switch (period) {
    case "monthly": {
      // Period starts on the card open day each month
      const day = Math.min(openDay, daysInMonth(now.getFullYear(), now.getMonth()));
      const periodStartThisMonth = new Date(year, now.getMonth(), day);

      if (now >= periodStartThisMonth) {
        start = periodStartThisMonth;
        const nextMonth = now.getMonth() + 1;
        const nextDay = Math.min(openDay, daysInMonth(year + (nextMonth > 11 ? 1 : 0), nextMonth % 12));
        end = new Date(year + (nextMonth > 11 ? 1 : 0), nextMonth % 12, nextDay);
        end = new Date(end.getTime() - 1000 * 60 * 60 * 24); // day before next start
      } else {
        const prevMonth = now.getMonth() - 1;
        const prevYear = prevMonth < 0 ? year - 1 : year;
        const prevDay = Math.min(openDay, daysInMonth(prevYear, (prevMonth + 12) % 12));
        start = new Date(prevYear, (prevMonth + 12) % 12, prevDay);
        end = new Date(periodStartThisMonth.getTime() - 1000 * 60 * 60 * 24);
      }
      break;
    }

    case "quarterly": {
      // Find the anniversary month in the current quarter cycle
      const monthsSinceOpen = (year - cardOpenDate.getFullYear()) * 12 + (now.getMonth() - openMonth);
      const quarterIndex = Math.floor(monthsSinceOpen / 3);
      const startMonth = openMonth + quarterIndex * 3;
      const startYear = cardOpenDate.getFullYear() + Math.floor(startMonth / 12);
      const normalizedMonth = ((startMonth % 12) + 12) % 12;

      start = new Date(startYear, normalizedMonth, Math.min(openDay, daysInMonth(startYear, normalizedMonth)));
      const endStartMonth = normalizedMonth + 3;
      const endYear = startYear + Math.floor(endStartMonth / 12);
      const endNormMonth = endStartMonth % 12;
      end = new Date(endYear, endNormMonth, Math.min(openDay, daysInMonth(endYear, endNormMonth)));
      end = new Date(end.getTime() - 1000 * 60 * 60 * 24);
      break;
    }

    case "semi_annual": {
      const monthsSinceOpen = (year - cardOpenDate.getFullYear()) * 12 + (now.getMonth() - openMonth);
      const halfIndex = Math.floor(monthsSinceOpen / 6);
      const startMonth = openMonth + halfIndex * 6;
      const startYear = cardOpenDate.getFullYear() + Math.floor(startMonth / 12);
      const normalizedMonth = ((startMonth % 12) + 12) % 12;

      start = new Date(startYear, normalizedMonth, Math.min(openDay, daysInMonth(startYear, normalizedMonth)));
      const endStartMonth = normalizedMonth + 6;
      const endYear = startYear + Math.floor(endStartMonth / 12);
      const endNormMonth = endStartMonth % 12;
      end = new Date(endYear, endNormMonth, Math.min(openDay, daysInMonth(endYear, endNormMonth)));
      end = new Date(end.getTime() - 1000 * 60 * 60 * 24);
      break;
    }

    case "annual": {
      // Anniversary year runs from open date anniversary to next anniversary
      const anniversaryThisYear = new Date(year, openMonth, Math.min(openDay, daysInMonth(year, openMonth)));
      if (now >= anniversaryThisYear) {
        start = anniversaryThisYear;
        const nextYear = year + 1;
        end = new Date(nextYear, openMonth, Math.min(openDay, daysInMonth(nextYear, openMonth)));
        end = new Date(end.getTime() - 1000 * 60 * 60 * 24);
      } else {
        const prevYear = year - 1;
        start = new Date(prevYear, openMonth, Math.min(openDay, daysInMonth(prevYear, openMonth)));
        end = new Date(anniversaryThisYear.getTime() - 1000 * 60 * 60 * 24);
      }
      break;
    }
  }

  const daysRemaining = Math.max(
    0,
    Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  );

  return { start, end, daysRemaining };
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Format period as human-readable label
 */
export function formatPeriodLabel(period: Benefit["cc_benefit_period"]): string {
  switch (period) {
    case "monthly":
      return "Monthly";
    case "quarterly":
      return "Quarterly";
    case "semi_annual":
      return "Semi-Annual";
    case "annual":
      return "Annual";
    default:
      return period;
  }
}

/**
 * Format days remaining as human-readable string
 */
export function formatDaysRemaining(days: number): string {
  if (days === 0) return "Expires today";
  if (days === 1) return "1 day left";
  if (days <= 30) return `${days} days left`;
  const months = Math.floor(days / 30);
  const remainingDays = days % 30;
  if (remainingDays === 0) return `${months}mo left`;
  return `${months}mo ${remainingDays}d left`;
}

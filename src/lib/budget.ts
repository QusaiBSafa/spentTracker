import { daysInMonth } from "./dates";

export type Budget = {
  targetMinor: number;
  spentMinor: number; // ILS spent this month
  remainingMinor: number; // target - spent, may be negative
  daysLeft: number; // today through the last day of the month
  perDayMinor: number; // whole shekels per remaining day, never negative
  firstDay: number; // first day of the month the allowance applies to
};

// budget = target − ILS spent this month, split evenly over today and the
// rest of the month (all days for a future month). Rounded down to whole
// shekels so the daily figure never overshoots the target.
// Returns null for past months, where there are no days left to plan.
export function computeBudget(
  month: string,
  today: string, // YYYY-MM-DD
  targetMinor: number,
  spentMinor: number,
): Budget | null {
  const todayMonth = today.slice(0, 7);
  if (month < todayMonth) return null;

  const total = daysInMonth(month);
  const firstDay = month === todayMonth ? Number(today.slice(8)) : 1;
  const daysLeft = total - firstDay + 1;
  const remainingMinor = targetMinor - spentMinor;
  const perDayMinor = Math.max(0, Math.floor(remainingMinor / daysLeft / 100) * 100);

  return { targetMinor, spentMinor, remainingMinor, daysLeft, perDayMinor, firstDay };
}

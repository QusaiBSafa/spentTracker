"use client";

import Link from "next/link";
import { useState } from "react";
import { addMonths, daysInMonth, firstWeekday, monthLabel, todayStr } from "@/lib/dates";
import { emptyTotals, formatTotals, type Currency } from "@/lib/money";
import AddExpenseModal, { type CategoryOption } from "./AddExpenseModal";
import DayDetails from "./DayDetails";

export type ExpenseItem = { id: string; date: string; amountMinor: number; currency: string; category: string };

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Calendar({
  month,
  categories,
  expenses,
}: {
  month: string;
  categories: CategoryOption[];
  expenses: ExpenseItem[];
}) {
  const [addingFor, setAddingFor] = useState<string | null>(null);
  const [viewing, setViewing] = useState<string | null>(null);

  const byDay = new Map<string, ExpenseItem[]>();
  for (const e of expenses) byDay.set(e.date, [...(byDay.get(e.date) ?? []), e]);

  const today = todayStr();
  const blanks = firstWeekday(month);
  const days = Array.from({ length: daysInMonth(month) }, (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`);

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-4">
      <div className="flex items-center justify-between mb-4">
        <Link href={`/calendar?month=${addMonths(month, -1)}`} className="btn-secondary text-sm" aria-label="Previous month">
          ←
        </Link>
        <h1 className="text-lg font-semibold">{monthLabel(month)}</h1>
        <Link href={`/calendar?month=${addMonths(month, 1)}`} className="btn-secondary text-sm" aria-label="Next month">
          →
        </Link>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500 mb-1">
        {WEEKDAYS.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: blanks }, (_, i) => (
          <div key={`b${i}`} />
        ))}
        {days.map((day) => {
          const items = byDay.get(day) ?? [];
          const totals = emptyTotals();
          for (const e of items) totals[e.currency as Currency] += e.amountMinor;
          return (
            <div
              key={day}
              className={`min-h-24 rounded-lg border p-1.5 flex flex-col ${
                day === today ? "border-emerald-500 bg-emerald-50/40" : "border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600">{Number(day.slice(8))}</span>
                <button
                  onClick={() => setAddingFor(day)}
                  className="h-6 w-6 rounded-full bg-emerald-600 text-white text-sm leading-none hover:bg-emerald-700"
                  aria-label={`Add spending on ${day}`}
                  title="Add spending"
                >
                  +
                </button>
              </div>
              {items.length > 0 && (
                <button
                  onClick={() => setViewing(day)}
                  className="mt-auto text-left text-[11px] sm:text-xs text-gray-800 hover:underline break-words"
                >
                  {formatTotals(totals)}
                  <span className="block text-gray-400">
                    {items.length} item{items.length > 1 ? "s" : ""}
                  </span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {addingFor && (
        <AddExpenseModal date={addingFor} categories={categories} onClose={() => setAddingFor(null)} />
      )}
      {viewing && (
        <DayDetails
          date={viewing}
          items={byDay.get(viewing) ?? []}
          onClose={() => setViewing(null)}
          onAdd={() => {
            setAddingFor(viewing);
            setViewing(null);
          }}
        />
      )}
    </div>
  );
}

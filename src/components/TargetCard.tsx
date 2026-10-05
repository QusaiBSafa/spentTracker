"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { clearMonthlyTarget, setMonthlyTarget } from "@/app/target-actions";
import type { Budget } from "@/lib/budget";
import { formatMoney } from "@/lib/money";

export default function TargetCard({
  month,
  monthLabel,
  budget,
  hasUsd,
}: {
  month: string;
  monthLabel: string;
  budget: Budget | null; // null when no target is set
  hasUsd: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(!budget);
  const [amount, setAmount] = useState(budget ? String(budget.targetMinor / 100) : "");
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function save(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    startTransition(async () => {
      const res = await setMonthlyTarget(month, amount);
      if (res.error) return setError(res.error);
      setEditing(false);
      router.refresh();
    });
  }

  function remove() {
    startTransition(async () => {
      await clearMonthlyTarget(month);
      setAmount("");
      setEditing(true);
      router.refresh();
    });
  }

  const form = (
    <form onSubmit={save} className="mt-3 flex flex-wrap gap-2">
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₪</span>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          type="number"
          inputMode="decimal"
          min="1"
          step="1"
          required
          placeholder="6000"
          aria-label="Monthly target in ILS"
          className="input w-40 pl-7"
        />
      </div>
      <button disabled={pending} className="btn-primary">
        {pending ? "Saving…" : "Save target"}
      </button>
      {budget && (
        <button type="button" onClick={() => setEditing(false)} className="btn-secondary">
          Cancel
        </button>
      )}
      {error && <p className="w-full text-sm text-red-600">{error}</p>}
    </form>
  );

  if (!budget || editing) {
    return (
      <section className="bg-white rounded-2xl shadow-sm border p-5">
        <h2 className="text-lg font-semibold">Monthly target · {monthLabel}</h2>
        <p className="mt-1 text-sm text-gray-500">
          Set how much you want to spend this month in ILS. We&apos;ll split what&apos;s left over the remaining days
          and show the daily limit on your calendar.
        </p>
        {form}
      </section>
    );
  }

  const over = budget.remainingMinor < 0;
  const pct = Math.min(100, (budget.spentMinor / budget.targetMinor) * 100);

  return (
    <section className="bg-white rounded-2xl shadow-sm border p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold">Monthly target · {monthLabel}</h2>
        <div className="flex gap-1">
          <button onClick={() => setEditing(true)} className="rounded-lg px-2.5 py-1 text-sm text-gray-700 hover:bg-gray-100">
            Edit
          </button>
          <button
            onClick={remove}
            disabled={pending}
            className="rounded-lg px-2.5 py-1 text-sm text-red-600 hover:bg-red-50"
          >
            Remove
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        <Figure label="Target" value={formatMoney(budget.targetMinor, "ILS")} />
        <Figure label="Spent so far" value={formatMoney(budget.spentMinor, "ILS")} />
        <Figure
          label={over ? "Over target by" : "Left to spend"}
          value={formatMoney(Math.abs(budget.remainingMinor), "ILS")}
          tone={over ? "bad" : undefined}
        />
        <Figure
          label={`Per day · next ${budget.daysLeft} ${budget.daysLeft === 1 ? "day" : "days"}`}
          value={formatMoney(budget.perDayMinor, "ILS")}
          tone={over ? "bad" : "good"}
        />
      </div>

      <div className="mt-4">
        <div
          className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100"
          role="progressbar"
          aria-valuenow={Math.round(pct)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Share of target spent"
        >
          <div
            className={`h-full rounded-full transition-[width] duration-700 ${over ? "bg-red-500" : "bg-emerald-500"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs text-gray-500">
          {Math.round((budget.spentMinor / budget.targetMinor) * 100)}% of target spent
          {hasUsd && " · USD spending isn't counted toward the ILS target"}
        </p>
      </div>
    </section>
  );
}

function Figure({ label, value, tone }: { label: string; value: string; tone?: "good" | "bad" }) {
  const color = tone === "bad" ? "text-red-600" : tone === "good" ? "text-emerald-700" : "text-gray-900";
  return (
    <div className="rounded-xl bg-gray-50 p-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`mt-0.5 text-xl font-semibold tabular-nums ${color}`}>{value}</div>
    </div>
  );
}

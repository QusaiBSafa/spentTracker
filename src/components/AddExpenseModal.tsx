"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { addExpense } from "@/app/expense-actions";
import { CURRENCIES, type Currency } from "@/lib/money";
import Modal from "./Modal";

export type CategoryOption = { id: string; name: string };

const NEW = "__new__";

export default function AddExpenseModal({
  date,
  categories,
  onClose,
}: {
  date: string;
  categories: CategoryOption[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? NEW);
  const [newCategory, setNewCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>("ILS");
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  const pretty = new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    startTransition(async () => {
      const res = await addExpense({
        date,
        amount,
        currency,
        categoryId: categoryId === NEW ? undefined : categoryId,
        newCategory: categoryId === NEW ? newCategory : undefined,
      });
      if (res.error) return setError(res.error);
      router.refresh();
      onClose();
    });
  }

  return (
    <Modal title={`Add spending · ${pretty}`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          <span className="text-sm text-gray-600">Category</span>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input mt-1">
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
            <option value={NEW}>+ Add new category…</option>
          </select>
        </label>
        {categoryId === NEW && (
          <label className="block">
            <span className="text-sm text-gray-600">New category name</span>
            <input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              required
              maxLength={40}
              autoFocus
              className="input mt-1"
              placeholder="e.g. Coffee"
            />
          </label>
        )}
        <div>
          <span className="text-sm text-gray-600">Amount</span>
          <div className="mt-1 flex gap-2">
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              required
              autoFocus={categoryId !== NEW}
              className="input"
              placeholder="0.00"
            />
            <div className="flex rounded-lg border border-gray-300 overflow-hidden shrink-0">
              {CURRENCIES.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-3 text-sm font-medium ${
                    currency === c ? "bg-emerald-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {c === "ILS" ? "₪ ILS" : "$ USD"}
                </button>
              ))}
            </div>
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button disabled={pending} className="btn-primary">
            {pending ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

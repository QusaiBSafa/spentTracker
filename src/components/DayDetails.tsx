"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteExpense } from "@/app/expense-actions";
import { formatMoney } from "@/lib/money";
import type { ExpenseItem } from "./Calendar";
import Modal from "./Modal";

export default function DayDetails({
  date,
  items,
  onClose,
  onAdd,
}: {
  date: string;
  items: ExpenseItem[];
  onClose: () => void;
  onAdd: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const pretty = new Date(`${date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <Modal title={`Spending · ${pretty}`} onClose={onClose}>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500">Nothing recorded.</p>
      ) : (
        <ul className="divide-y text-sm mb-4">
          {items.map((e) => (
            <li key={e.id} className="flex items-center justify-between py-2">
              <span>{e.category}</span>
              <span className="flex items-center gap-3">
                <span className="tabular-nums">{formatMoney(e.amountMinor, e.currency)}</span>
                <button
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      await deleteExpense(e.id);
                      router.refresh();
                    })
                  }
                  className="text-gray-400 hover:text-red-600"
                  aria-label="Delete"
                  title="Delete"
                >
                  🗑
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
      <button onClick={onAdd} className="btn-primary w-full">
        + Add spending
      </button>
    </Modal>
  );
}

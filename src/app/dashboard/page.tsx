import Nav from "@/components/Nav";
import DashboardCharts, { type CategoryRow } from "@/components/DashboardCharts";
import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { addMonths, currentMonth, daysInMonth, monthLabel } from "@/lib/dates";
import { CURRENCIES, emptyTotals, formatMoney, type Currency, type Totals } from "@/lib/money";

export const dynamic = "force-dynamic";

type Row = { name: string; totals: Totals };

async function monthData(userId: string, month: string) {
  const expenses = await prisma.expense.findMany({
    where: { userId, date: { startsWith: `${month}-` } },
    select: { amountMinor: true, currency: true, date: true, category: { select: { name: true } } },
  });

  const byCategory = new Map<string, Row>();
  const daily: Totals[] = Array.from({ length: daysInMonth(month) }, emptyTotals);
  const total = emptyTotals();
  for (const e of expenses) {
    const c = e.currency as Currency;
    const row = byCategory.get(e.category.name) ?? { name: e.category.name, totals: emptyTotals() };
    row.totals[c] += e.amountMinor;
    byCategory.set(e.category.name, row);
    daily[Number(e.date.slice(8)) - 1][c] += e.amountMinor;
    total[c] += e.amountMinor;
  }
  const rows = [...byCategory.values()].sort(
    (a, b) => b.totals.ILS + b.totals.USD - (a.totals.ILS + a.totals.USD),
  );
  return { rows, total, daily };
}

function MonthCard({ title, month, rows, total }: { title: string; month: string; rows: Row[]; total: Totals }) {
  return (
    <section className="bg-white rounded-2xl shadow-sm border p-5">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="text-sm text-gray-500">{monthLabel(month)}</span>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-5">
        {CURRENCIES.map((c) => (
          <div key={c} className="rounded-xl bg-emerald-50 p-3">
            <div className="text-xs text-emerald-800">Total {c}</div>
            <div className="text-xl font-semibold text-emerald-900">{formatMoney(total[c], c)}</div>
          </div>
        ))}
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-gray-500">No spending recorded.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-2 font-medium">Category</th>
              {CURRENCIES.map((c) => (
                <th key={c} className="py-2 font-medium text-right">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name} className="border-b last:border-0">
                <td className="py-2">{r.name}</td>
                {CURRENCIES.map((c) => (
                  <td key={c} className="py-2 text-right tabular-nums">
                    {r.totals[c] ? formatMoney(r.totals[c], c) : "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

export default async function DashboardPage() {
  const userId = await requireUserId();
  const thisMonth = currentMonth();
  const prevMonth = addMonths(thisMonth, -1);
  const [current, previous] = await Promise.all([monthData(userId, thisMonth), monthData(userId, prevMonth)]);

  const names = new Set([...current.rows, ...previous.rows].map((r) => r.name));
  const categories: CategoryRow[] = [...names].map((name) => ({
    name,
    current: current.rows.find((r) => r.name === name)?.totals ?? emptyTotals(),
    previous: previous.rows.find((r) => r.name === name)?.totals ?? emptyTotals(),
  }));

  return (
    <>
      <Nav active="dashboard" />
      <main className="max-w-5xl mx-auto p-4 space-y-4">
        <DashboardCharts
          currentLabel={monthLabel(thisMonth)}
          previousLabel={monthLabel(prevMonth)}
          today={new Date().getDate()}
          categories={categories}
          currentDaily={current.daily}
          previousDaily={previous.daily}
          currentTotal={current.total}
          previousTotal={previous.total}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <MonthCard title="This month" month={thisMonth} rows={current.rows} total={current.total} />
          <MonthCard title="Previous month" month={prevMonth} rows={previous.rows} total={previous.total} />
        </div>
      </main>
    </>
  );
}

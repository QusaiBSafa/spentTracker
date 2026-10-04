import Nav from "@/components/Nav";
import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { addMonths, currentMonth, monthLabel } from "@/lib/dates";
import { CURRENCIES, emptyTotals, formatMoney, type Currency, type Totals } from "@/lib/money";

export const dynamic = "force-dynamic";

type Row = { name: string; totals: Totals };

async function monthSummary(userId: string, month: string) {
  const groups = await prisma.expense.groupBy({
    by: ["categoryId", "currency"],
    where: { userId, date: { startsWith: `${month}-` } },
    _sum: { amountMinor: true },
  });
  const categories = await prisma.category.findMany({
    where: { id: { in: [...new Set(groups.map((g) => g.categoryId))] } },
  });
  const nameById = new Map(categories.map((c) => [c.id, c.name]));

  const rows = new Map<string, Row>();
  const total = emptyTotals();
  for (const g of groups) {
    const row = rows.get(g.categoryId) ?? { name: nameById.get(g.categoryId) ?? "?", totals: emptyTotals() };
    const sum = g._sum.amountMinor ?? 0;
    row.totals[g.currency as Currency] += sum;
    total[g.currency as Currency] += sum;
    rows.set(g.categoryId, row);
  }
  const sorted = [...rows.values()].sort((a, b) => b.totals.ILS + b.totals.USD - (a.totals.ILS + a.totals.USD));
  return { rows: sorted, total };
}

function MonthCard({ title, month, rows, total }: { title: string; month: string } & Awaited<ReturnType<typeof monthSummary>>) {
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
  const [current, previous] = await Promise.all([
    monthSummary(userId, thisMonth),
    monthSummary(userId, prevMonth),
  ]);

  return (
    <>
      <Nav active="dashboard" />
      <main className="max-w-5xl mx-auto p-4 grid gap-4 md:grid-cols-2">
        <MonthCard title="This month" month={thisMonth} {...current} />
        <MonthCard title="Previous month" month={prevMonth} {...previous} />
      </main>
    </>
  );
}

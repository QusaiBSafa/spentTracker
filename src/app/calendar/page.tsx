import Nav from "@/components/Nav";
import Calendar from "@/components/Calendar";
import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { currentMonth, isMonth } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const userId = await requireUserId();
  const { month: param } = await searchParams;
  const month = isMonth(param) ? param : currentMonth();

  const [categories, expenses, target] = await Promise.all([
    prisma.category.findMany({ where: { userId }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.expense.findMany({
      where: { userId, date: { startsWith: `${month}-` } },
      orderBy: { createdAt: "asc" },
      include: { category: { select: { name: true } } },
    }),
    prisma.monthlyTarget.findUnique({ where: { userId_month: { userId, month } } }),
  ]);

  return (
    <>
      <Nav active="calendar" />
      <main className="max-w-5xl mx-auto p-4">
        <Calendar
          month={month}
          targetMinor={target?.amountMinor ?? null}
          categories={categories}
          expenses={expenses.map((e) => ({
            id: e.id,
            date: e.date,
            amountMinor: e.amountMinor,
            currency: e.currency,
            category: e.category.name,
          }))}
        />
      </main>
    </>
  );
}

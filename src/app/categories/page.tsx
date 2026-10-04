import Nav from "@/components/Nav";
import CategoryManager from "@/components/CategoryManager";
import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const userId = await requireUserId();
  const categories = await prisma.category.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    select: { id: true, name: true, _count: { select: { expenses: true } } },
  });

  return (
    <>
      <Nav active="categories" />
      <main className="max-w-2xl mx-auto p-4">
        <CategoryManager
          categories={categories.map((c) => ({ id: c.id, name: c.name, expenseCount: c._count.expenses }))}
        />
      </main>
    </>
  );
}

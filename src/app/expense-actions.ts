"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import { CURRENCIES, type Currency } from "@/lib/money";

export type ExpenseInput = {
  date: string;
  categoryId?: string;
  newCategory?: string;
  amount: string;
  currency: string;
};

export async function addExpense(input: ExpenseInput): Promise<{ error?: string }> {
  const userId = await requireUserId();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) return { error: "Invalid date." };
  if (!CURRENCIES.includes(input.currency as Currency)) return { error: "Pick ILS or USD." };

  const amount = Number(input.amount);
  if (!Number.isFinite(amount) || amount <= 0) return { error: "Enter an amount above 0." };
  const amountMinor = Math.round(amount * 100);

  let categoryId = input.categoryId;
  const newName = input.newCategory?.trim();
  if (newName) {
    const category = await prisma.category.upsert({
      where: { userId_name: { userId, name: newName } },
      update: {},
      create: { userId, name: newName },
    });
    categoryId = category.id;
  } else {
    const owned = categoryId
      ? await prisma.category.findFirst({ where: { id: categoryId, userId } })
      : null;
    if (!owned) return { error: "Pick a category." };
  }

  await prisma.expense.create({
    data: { userId, categoryId: categoryId!, amountMinor, currency: input.currency, date: input.date },
  });
  revalidatePath("/dashboard");
  revalidatePath("/calendar");
  return {};
}

export async function deleteExpense(id: string) {
  const userId = await requireUserId();
  await prisma.expense.deleteMany({ where: { id, userId } });
  revalidatePath("/dashboard");
  revalidatePath("/calendar");
}

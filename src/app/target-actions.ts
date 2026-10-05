"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import { isMonth } from "@/lib/dates";

function revalidate() {
  revalidatePath("/dashboard");
  revalidatePath("/calendar");
}

export async function setMonthlyTarget(month: string, amount: string): Promise<{ error?: string }> {
  const userId = await requireUserId();
  if (!isMonth(month)) return { error: "Invalid month." };

  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0) return { error: "Enter a target above 0." };
  if (value > 10_000_000) return { error: "That target is too large." };
  const amountMinor = Math.round(value * 100);

  await prisma.monthlyTarget.upsert({
    where: { userId_month: { userId, month } },
    update: { amountMinor },
    create: { userId, month, amountMinor },
  });
  revalidate();
  return {};
}

export async function clearMonthlyTarget(month: string) {
  const userId = await requireUserId();
  await prisma.monthlyTarget.deleteMany({ where: { userId, month } });
  revalidate();
}

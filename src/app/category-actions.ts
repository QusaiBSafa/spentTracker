"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/auth";

type Result = { error?: string };

const MAX_NAME = 40;

function cleanName(raw: string) {
  return raw.trim().replace(/\s+/g, " ");
}

function revalidate() {
  revalidatePath("/categories");
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
}

async function nameTaken(userId: string, name: string, exceptId?: string) {
  // Case-insensitive so "food" and "Food" can't both exist.
  const all = await prisma.category.findMany({ where: { userId }, select: { id: true, name: true } });
  return all.some((c) => c.id !== exceptId && c.name.toLowerCase() === name.toLowerCase());
}

export async function createCategory(rawName: string): Promise<Result> {
  const userId = await requireUserId();
  const name = cleanName(rawName);
  if (!name) return { error: "Enter a name." };
  if (name.length > MAX_NAME) return { error: `Keep it under ${MAX_NAME} characters.` };
  if (await nameTaken(userId, name)) return { error: "You already have a category with this name." };

  await prisma.category.create({ data: { userId, name } });
  revalidate();
  return {};
}

export async function renameCategory(id: string, rawName: string): Promise<Result> {
  const userId = await requireUserId();
  const name = cleanName(rawName);
  if (!name) return { error: "Enter a name." };
  if (name.length > MAX_NAME) return { error: `Keep it under ${MAX_NAME} characters.` };
  if (await nameTaken(userId, name, id)) return { error: "You already have a category with this name." };

  const { count } = await prisma.category.updateMany({ where: { id, userId }, data: { name } });
  if (count === 0) return { error: "Category not found." };
  revalidate();
  return {};
}

// Deleting a category also deletes the spending recorded under it.
export async function deleteCategory(id: string): Promise<Result> {
  const userId = await requireUserId();
  const { count } = await prisma.category.deleteMany({ where: { id, userId } });
  if (count === 0) return { error: "Category not found." };
  revalidate();
  return {};
}

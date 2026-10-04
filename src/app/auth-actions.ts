"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { DEFAULT_CATEGORIES } from "@/lib/money";
import { SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/session";

export type AuthState = { error?: string; email?: string };

function readCredentials(form: FormData) {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  return { email, password };
}

async function startSession(userId: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, await signSession(userId), sessionCookieOptions);
}

export async function register(_: AuthState, form: FormData): Promise<AuthState> {
  const { email, password } = readCredentials(form);
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Enter a valid email.", email };
  if (password.length < 6) return { error: "Password must be at least 6 characters.", email };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "An account with this email already exists.", email };

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: await bcrypt.hash(password, 10),
      categories: { create: DEFAULT_CATEGORIES.map((name) => ({ name })) },
    },
  });
  await startSession(user.id);
  redirect("/");
}

export async function login(_: AuthState, form: FormData): Promise<AuthState> {
  const { email, password } = readCredentials(form);
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "Wrong email or password.", email };
  }
  await startSession(user.id);
  redirect("/");
}

export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/login");
}

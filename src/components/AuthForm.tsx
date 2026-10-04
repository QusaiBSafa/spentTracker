"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AuthState } from "@/app/auth-actions";

type Props = {
  title: string;
  submitLabel: string;
  action: (state: AuthState, form: FormData) => Promise<AuthState>;
  switchText: string;
  switchHref: string;
  switchLabel: string;
};

export default function AuthForm({ title, submitLabel, action, switchText, switchHref, switchLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-4">
      <Link href="/" className="text-lg font-semibold">
        💸 SpentTracker
      </Link>
      <form action={formAction} className="w-full max-w-sm bg-white rounded-2xl shadow p-6 space-y-4">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <label className="block">
          <span className="text-sm text-gray-600">Email</span>
          <input name="email" type="email" required className="input mt-1" autoComplete="email" defaultValue={state.email} key={state.email} />
        </label>
        <label className="block">
          <span className="text-sm text-gray-600">Password</span>
          <input name="password" type="password" required minLength={6} className="input mt-1" />
        </label>
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button disabled={pending} className="btn-primary w-full">
          {pending ? "Please wait…" : submitLabel}
        </button>
        <p className="text-sm text-gray-600 text-center">
          {switchText}{" "}
          <Link href={switchHref} className="text-emerald-700 font-medium hover:underline">
            {switchLabel}
          </Link>
        </p>
      </form>
    </main>
  );
}

import Link from "next/link";
import { logout } from "@/app/auth-actions";

type Tab = "dashboard" | "calendar" | "categories";

const TABS: { key: Tab; href: string; label: string }[] = [
  { key: "dashboard", href: "/dashboard", label: "Dashboard" },
  { key: "calendar", href: "/calendar", label: "Calendar" },
  { key: "categories", href: "/categories", label: "Categories" },
];

export default function Nav({ active }: { active: Tab }) {
  return (
    <header className="bg-white border-b">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-1 sm:gap-2">
        <Link href="/dashboard" className="font-semibold mr-2 sm:mr-4 whitespace-nowrap">
          💸 <span className="hidden sm:inline">SpentTracker</span>
        </Link>
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={t.href}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-sm font-medium ${
              active === t.key ? "bg-emerald-600 text-white" : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {t.label}
          </Link>
        ))}
        <form action={logout} className="ml-auto">
          <button className="text-sm text-gray-600 hover:text-gray-900 whitespace-nowrap">Log out</button>
        </form>
      </div>
    </header>
  );
}

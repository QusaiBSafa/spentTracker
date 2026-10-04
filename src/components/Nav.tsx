import Link from "next/link";
import { logout } from "@/app/auth-actions";

export default function Nav({ active }: { active: "dashboard" | "calendar" }) {
  const tab = (href: string, label: string, isActive: boolean) => (
    <Link
      href={href}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
        isActive ? "bg-emerald-600 text-white" : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      {label}
    </Link>
  );
  return (
    <header className="bg-white border-b">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-2">
        <span className="font-semibold mr-4">💸 SpentTracker</span>
        {tab("/", "Dashboard", active === "dashboard")}
        {tab("/calendar", "Calendar", active === "calendar")}
        <form action={logout} className="ml-auto">
          <button className="text-sm text-gray-600 hover:text-gray-900">Log out</button>
        </form>
      </div>
    </header>
  );
}

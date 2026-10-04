import Link from "next/link";
import Reveal from "@/components/Reveal";

const FEATURES = [
  {
    icon: "📅",
    title: "Log it on the calendar",
    text: "Every day has a + button. Pick a category, type the amount, save. Done in three taps.",
  },
  {
    icon: "📊",
    title: "See where it goes",
    text: "Your dashboard compares this month with last month, per category, with clear charts.",
  },
  {
    icon: "₪",
    title: "Shekels and dollars",
    text: "Record spending in ILS or USD. Each currency is totalled on its own, so nothing gets mixed up.",
  },
  {
    icon: "🏷️",
    title: "Your own categories",
    text: "Start with Food, Rent, Transport and more, then add, rename or remove categories any time.",
  },
];

const STEPS = [
  { n: "1", title: "Create an account", text: "Any email and a password. No verification emails." },
  { n: "2", title: "Add your spending", text: "Tap a day on the calendar and save what you spent." },
  { n: "3", title: "Watch the trends", text: "Open the dashboard to compare months and categories." },
];

const MOCK_BARS = [
  { label: "Food", h: 78 },
  { label: "Rent", h: 100 },
  { label: "Fun", h: 42 },
  { label: "Bills", h: 61 },
  { label: "Travel", h: 34 },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-gray-900">
      {/* Animated background blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-0">
        <div className="animate-blob absolute -top-32 -left-24 h-96 w-96 rounded-full bg-emerald-200/60 blur-3xl" />
        <div
          className="animate-blob absolute top-20 -right-24 h-[28rem] w-[28rem] rounded-full bg-sky-200/60 blur-3xl"
          style={{ animationDelay: "-5s" }}
        />
        <div
          className="animate-blob absolute top-[32rem] left-1/3 h-80 w-80 rounded-full bg-violet-200/50 blur-3xl"
          style={{ animationDelay: "-9s" }}
        />
      </div>

      {/* Top bar */}
      <header className="relative z-10">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6">
          <span className="whitespace-nowrap text-lg font-semibold">💸 SpentTracker</span>
          <nav className="ml-auto flex items-center gap-1 sm:gap-2">
            <Link href="/login" className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 sm:px-4">
              Sign in
            </Link>
            <Link
              href="/register"
              className="whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-gray-700 sm:px-4"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-2 lg:pt-20">
          <div>
            <p
              className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/70 px-3 py-1 text-xs font-medium text-emerald-700 backdrop-blur"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Free and simple spending tracker
            </p>
            <h1
              className="animate-fade-up mt-5 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
              style={{ animationDelay: "120ms" }}
            >
              Know where every <span className="text-shimmer">shekel</span> goes.
            </h1>
            <p
              className="animate-fade-up mt-5 max-w-lg text-lg text-gray-600"
              style={{ animationDelay: "240ms" }}
            >
              Log daily spending on a calendar, sort it into categories, and see this month next to last month at a
              glance.
            </p>
            <div className="animate-fade-up mt-8 flex flex-wrap gap-3" style={{ animationDelay: "360ms" }}>
              <Link
                href="/register"
                className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:-translate-y-0.5 hover:bg-emerald-700"
              >
                Start tracking free
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-gray-300 bg-white/80 px-6 py-3 font-semibold text-gray-800 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white"
              >
                I have an account
              </Link>
            </div>
          </div>

          {/* Mock product card */}
          <div className="animate-fade-up relative mx-auto w-full max-w-md" style={{ animationDelay: "300ms" }}>
            <div className="animate-float rounded-3xl border border-gray-200 bg-white/90 p-6 shadow-2xl shadow-gray-300/50 backdrop-blur">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium text-gray-500">This month</span>
                <span className="text-xs text-gray-400">by category</span>
              </div>
              <div className="mt-1 text-3xl font-bold">₪4,280</div>
              <div className="mt-6 flex h-40 items-end gap-3">
                {MOCK_BARS.map((b, i) => (
                  <div key={b.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                    <div
                      className="animate-grow-up w-full rounded-t-md bg-gradient-to-t from-emerald-500 to-sky-400"
                      style={{ height: `${b.h}%`, animationDelay: `${600 + i * 120}ms` }}
                    />
                    <span className="text-[11px] text-gray-500">{b.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div
              className="animate-float absolute -bottom-6 -left-2 rounded-2xl sm:-left-6 border border-gray-200 bg-white px-4 py-3 shadow-xl"
              style={{ animationDelay: "-2s", ["--tilt" as string]: "-3deg" }}
            >
              <div className="text-xs text-gray-500">Coffee · today</div>
              <div className="font-semibold">₪18</div>
            </div>
            <div
              className="animate-float absolute -right-2 -top-6 rounded-2xl sm:-right-4 border border-gray-200 bg-white px-4 py-3 shadow-xl"
              style={{ animationDelay: "-4s", ["--tilt" as string]: "4deg" }}
            >
              <div className="text-xs text-gray-500">vs last month</div>
              <div className="font-semibold text-emerald-600">−12%</div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything you need, nothing you don&apos;t</h2>
            <p className="mt-4 text-gray-600">Built for quick daily logging and an honest monthly picture.</p>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 100}>
                <div className="group h-full rounded-2xl border border-gray-200 bg-white/80 p-6 backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-2xl transition duration-300 group-hover:scale-110 group-hover:rotate-6">
                    {f.icon}
                  </div>
                  <h3 className="mt-4 font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{f.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
          <Reveal className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Up and running in a minute</h2>
          </Reveal>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 150} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-sky-500 text-xl font-bold text-white shadow-lg">
                  {s.n}
                </div>
                <h3 className="mt-4 font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{s.text}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-4 pb-24 pt-8 sm:px-6">
          <Reveal className="mx-auto max-w-4xl">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-sky-600 px-8 py-14 text-center text-white shadow-2xl">
              <div aria-hidden className="animate-blob absolute -right-10 -top-10 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
              <h2 className="relative text-3xl font-bold sm:text-4xl">Start tracking today</h2>
              <p className="relative mx-auto mt-3 max-w-md text-emerald-50">
                It&apos;s free. Create an account and log your first expense in seconds.
              </p>
              <div className="relative mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  href="/register"
                  className="rounded-xl bg-white px-6 py-3 font-semibold text-emerald-700 shadow-lg transition hover:-translate-y-0.5"
                >
                  Create free account
                </Link>
                <Link
                  href="/login"
                  className="rounded-xl border border-white/40 px-6 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="relative z-10 border-t border-gray-200 py-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} SpentTracker
      </footer>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CURRENCIES, formatMoney, type Currency, type Totals } from "@/lib/money";

export type CategoryRow = { name: string; current: Totals; previous: Totals };

type Props = {
  currentLabel: string;
  previousLabel: string;
  today: number;
  categories: CategoryRow[];
  currentDaily: Totals[];
  previousDaily: Totals[];
  currentTotal: Totals;
  previousTotal: Totals;
};

// Series colours follow the period, never its rank: this month is always
// slot 1 (blue), last month is always slot 2 (orange).
const COLOR = { current: "#2a78d6", previous: "#eb6834" };

function cumulative(daily: Totals[], c: Currency) {
  let sum = 0;
  return daily.map((d) => (sum += d[c]));
}

function niceMax(v: number) {
  if (v <= 0) return 100;
  const pow = 10 ** Math.floor(Math.log10(v));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * pow >= v) return m * pow;
  return 10 * pow;
}

function compact(minor: number, c: Currency) {
  const v = minor / 100;
  const sym = c === "ILS" ? "₪" : "$";
  if (v >= 1000) return `${sym}${(v / 1000).toLocaleString("en-US", { maximumFractionDigits: 1 })}k`;
  return `${sym}${Math.round(v)}`;
}

export default function DashboardCharts(props: Props) {
  const { currentTotal, previousTotal } = props;
  const [currency, setCurrency] = useState<Currency>(
    currentTotal.USD > currentTotal.ILS && currentTotal.ILS === 0 ? "USD" : "ILS",
  );

  const curCum = useMemo(() => cumulative(props.currentDaily, currency), [props.currentDaily, currency]);
  const prevCum = useMemo(() => cumulative(props.previousDaily, currency), [props.previousDaily, currency]);
  const today = Math.min(props.today, curCum.length);
  const soFar = curCum[today - 1] ?? 0;
  const prevSameDay = prevCum[Math.min(today, prevCum.length) - 1] ?? 0;
  const change = prevSameDay > 0 ? Math.round(((soFar - prevSameDay) / prevSameDay) * 100) : null;

  const hasData = currentTotal[currency] > 0 || previousTotal[currency] > 0;

  return (
    <section className="bg-white rounded-2xl shadow-sm border p-5 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-semibold">Overview</h1>
        <div className="flex rounded-lg border border-gray-300 overflow-hidden" role="group" aria-label="Currency">
          {CURRENCIES.map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              aria-pressed={currency === c}
              className={`px-3 py-1.5 text-sm font-medium ${
                currency === c ? "bg-gray-900 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label={`${props.currentLabel} so far`} value={formatMoney(currentTotal[currency], currency)} />
        <Stat label={`${props.previousLabel} total`} value={formatMoney(previousTotal[currency], currency)} />
        <Stat
          label={`vs. ${props.previousLabel.split(" ")[0]} 1–${today}`}
          value={change === null ? "—" : `${change > 0 ? "+" : change < 0 ? "−" : ""}${Math.abs(change)}%`}
          hint={change === null ? "No spending to compare yet" : change > 0 ? "Spending more" : change < 0 ? "Spending less" : "Same pace"}
        />
      </div>

      {!hasData ? (
        <p className="text-sm text-gray-500 py-8 text-center">
          No {currency} spending in these two months yet. Add some from the Calendar.
        </p>
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
          <CategoryBars categories={props.categories} currency={currency} labels={props} />
          <PaceChart
            current={curCum.slice(0, today)}
            previous={prevCum}
            currency={currency}
            labels={props}
          />
        </div>
      )}
    </section>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl bg-gray-50 p-4">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
      {hint && <div className="mt-0.5 text-xs text-gray-500">{hint}</div>}
    </div>
  );
}

function Legend({ labels }: { labels: { currentLabel: string; previousLabel: string } }) {
  return (
    <div className="flex flex-wrap gap-4 text-xs text-gray-600">
      <span className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-sm" style={{ background: COLOR.current }} /> {labels.currentLabel}
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-sm" style={{ background: COLOR.previous }} /> {labels.previousLabel}
      </span>
    </div>
  );
}

function CategoryBars({
  categories,
  currency,
  labels,
}: {
  categories: CategoryRow[];
  currency: Currency;
  labels: { currentLabel: string; previousLabel: string };
}) {
  const [hover, setHover] = useState<string | null>(null);
  const rows = categories
    .filter((r) => r.current[currency] > 0 || r.previous[currency] > 0)
    .sort((a, b) => b.current[currency] - a.current[currency] || b.previous[currency] - a.previous[currency]);
  const max = Math.max(1, ...rows.flatMap((r) => [r.current[currency], r.previous[currency]]));

  return (
    <div>
      <h2 className="font-medium">Spending by category</h2>
      <div className="mt-2 mb-4">
        <Legend labels={labels} />
      </div>
      <div className="space-y-3">
        {rows.map((r) => (
          <div
            key={r.name}
            className={`relative grid grid-cols-[6.5rem_1fr] items-center gap-3 rounded-lg px-1 py-1 ${
              hover === r.name ? "bg-gray-50" : ""
            }`}
            onMouseEnter={() => setHover(r.name)}
            onMouseLeave={() => setHover(null)}
          >
            <span className="truncate text-sm text-gray-700" title={r.name}>
              {r.name}
            </span>
            <div className="space-y-[2px]">
              {(["current", "previous"] as const).map((k) => (
                <div key={k} className="flex items-center gap-2">
                  <div
                    className="h-2.5 rounded-r transition-[width] duration-700 ease-out"
                    style={{
                      width: `${(r[k][currency] / max) * 85}%`,
                      minWidth: r[k][currency] > 0 ? 3 : 0,
                      background: COLOR[k],
                    }}
                  />
                  <span className="text-[11px] tabular-nums text-gray-600 whitespace-nowrap">
                    {r[k][currency] > 0 ? formatMoney(r[k][currency], currency) : ""}
                  </span>
                </div>
              ))}
            </div>
            {hover === r.name && (
              <div className="pointer-events-none absolute right-0 -top-2 z-10 -translate-y-full rounded-lg border bg-white px-3 py-2 text-xs shadow-lg">
                <div className="font-medium text-gray-900">{r.name}</div>
                <div className="mt-1 flex items-center gap-1.5 text-gray-600">
                  <span className="h-2 w-2 rounded-sm" style={{ background: COLOR.current }} />
                  {labels.currentLabel}: <span className="tabular-nums text-gray-900">{formatMoney(r.current[currency], currency)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <span className="h-2 w-2 rounded-sm" style={{ background: COLOR.previous }} />
                  {labels.previousLabel}: <span className="tabular-nums text-gray-900">{formatMoney(r.previous[currency], currency)}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

function PaceChart({
  current,
  previous,
  currency,
  labels,
}: {
  current: number[];
  previous: number[];
  currency: Currency;
  labels: { currentLabel: string; previousLabel: string };
}) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hoverDay, setHoverDay] = useState<number | null>(null);

  const height = 240;
  const pad = { top: 12, right: 16, bottom: 26, left: 48 };
  const days = Math.max(current.length, previous.length, 28);
  const yMax = niceMax(Math.max(1, ...current, ...previous));
  const innerW = Math.max(0, width - pad.left - pad.right);
  const innerH = height - pad.top - pad.bottom;
  const x = (day: number) => pad.left + ((day - 1) / (days - 1)) * innerW;
  const y = (v: number) => pad.top + innerH - (v / yMax) * innerH;
  const path = (vals: number[]) => vals.map((v, i) => `${i ? "L" : "M"}${x(i + 1).toFixed(1)},${y(v).toFixed(1)}`).join("");
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * yMax);
  const xTicks = [1, 8, 15, 22, days];

  function onMove(e: React.MouseEvent<SVGRectElement>) {
    const box = e.currentTarget.getBoundingClientRect();
    const day = Math.round(((e.clientX - box.left) / box.width) * (days - 1)) + 1;
    setHoverDay(Math.min(days, Math.max(1, day)));
  }

  const hv = hoverDay
    ? { cur: current[hoverDay - 1], prev: previous[hoverDay - 1] }
    : null;

  return (
    <div>
      <h2 className="font-medium">Running total by day</h2>
      <div className="mt-2 mb-4">
        <Legend labels={labels} />
      </div>
      <div ref={ref} className="relative">
        {width > 0 && (
          <svg width={width} height={height} role="img" aria-label="Cumulative spending by day of month, this month and last month">
            {ticks.map((t) => (
              <g key={t}>
                <line x1={pad.left} x2={width - pad.right} y1={y(t)} y2={y(t)} stroke="#ecebe8" />
                <text x={pad.left - 8} y={y(t)} dy="0.32em" textAnchor="end" fontSize="11" fill="#6b6a65">
                  {compact(t, currency)}
                </text>
              </g>
            ))}
            {xTicks.map((d) => (
              <text key={d} x={x(d)} y={height - 8} textAnchor="middle" fontSize="11" fill="#6b6a65">
                {d}
              </text>
            ))}
            <path d={path(previous)} fill="none" stroke={COLOR.previous} strokeWidth={2} strokeLinejoin="round" />
            <path d={path(current)} fill="none" stroke={COLOR.current} strokeWidth={2} strokeLinejoin="round" />
            {current.length > 0 && (
              <circle
                cx={x(current.length)}
                cy={y(current[current.length - 1])}
                r={4}
                fill={COLOR.current}
                stroke="#fff"
                strokeWidth={2}
              />
            )}
            {hoverDay && (
              <g>
                <line x1={x(hoverDay)} x2={x(hoverDay)} y1={pad.top} y2={pad.top + innerH} stroke="#9a9993" strokeDasharray="3 3" />
                {hv?.prev !== undefined && (
                  <circle cx={x(hoverDay)} cy={y(hv.prev)} r={4} fill={COLOR.previous} stroke="#fff" strokeWidth={2} />
                )}
                {hv?.cur !== undefined && (
                  <circle cx={x(hoverDay)} cy={y(hv.cur)} r={4} fill={COLOR.current} stroke="#fff" strokeWidth={2} />
                )}
              </g>
            )}
            <rect
              x={pad.left}
              y={pad.top}
              width={innerW}
              height={innerH}
              fill="transparent"
              onMouseMove={onMove}
              onMouseLeave={() => setHoverDay(null)}
            />
          </svg>
        )}
        {hoverDay && hv && (
          <div
            className="pointer-events-none absolute top-0 z-10 rounded-lg border bg-white px-3 py-2 text-xs shadow-lg"
            style={{
              left: Math.min(Math.max(x(hoverDay) + 10, 0), width - 170),
            }}
          >
            <div className="font-medium text-gray-900">Day {hoverDay}</div>
            <div className="mt-1 flex items-center gap-1.5 text-gray-600">
              <span className="h-2 w-2 rounded-sm" style={{ background: COLOR.current }} />
              {labels.currentLabel}:{" "}
              <span className="tabular-nums text-gray-900">{hv.cur !== undefined ? formatMoney(hv.cur, currency) : "—"}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-600">
              <span className="h-2 w-2 rounded-sm" style={{ background: COLOR.previous }} />
              {labels.previousLabel}:{" "}
              <span className="tabular-nums text-gray-900">{hv.prev !== undefined ? formatMoney(hv.prev, currency) : "—"}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const CURRENCIES = ["ILS", "USD"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const DEFAULT_CATEGORIES = [
  "Food",
  "Groceries",
  "Transport",
  "Rent",
  "Bills",
  "Shopping",
  "Health",
  "Entertainment",
  "Other",
];

const SYMBOL: Record<string, string> = { ILS: "₪", USD: "$" };

export function formatMoney(amountMinor: number, currency: string) {
  const value = (amountMinor / 100).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return `${SYMBOL[currency] ?? ""}${value}`;
}

export type Totals = Record<Currency, number>;

export function emptyTotals(): Totals {
  return { ILS: 0, USD: 0 };
}

export function formatTotals(t: Totals) {
  const parts = CURRENCIES.filter((c) => t[c] !== 0).map((c) => formatMoney(t[c], c));
  return parts.length ? parts.join(" + ") : "—";
}

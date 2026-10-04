# SpentTracker

A small spending tracker: register with any email and password, log what you spend on a month calendar, and see totals per category for this month and last month.

## Features

- **Login / register** with email and password (hashed with bcrypt, no email verification). Sessions are a signed, http-only cookie.
- **Dashboard** with two cards, this month and the previous month, each showing the total spent per category. ILS and USD are totalled separately (no currency conversion).
- **Calendar** for any month. Each day has a **+** button that opens a popup to pick a category, enter an amount, choose ILS or USD, and save. Click a day's total to see its items and delete one.
- **Categories**: each new account starts with Food, Groceries, Transport, Rent, Bills, Shopping, Health, Entertainment and Other. Pick "+ Add new category…" in the popup to create your own.

## Stack

Next.js 15 (App Router, TypeScript, server actions), Tailwind CSS 4, Prisma with SQLite.

## Run locally

Requires Node.js 20+.

```bash
npm install                 # also generates the Prisma client
cp .env.example .env        # then set AUTH_SECRET to a long random string
npm run db:push             # creates prisma/dev.db
npm run dev                 # http://localhost:3000
```

For a production build:

```bash
npm run build
npm start
```

## Environment variables

| Name           | Description                                         |
| -------------- | --------------------------------------------------- |
| `DATABASE_URL` | SQLite file, e.g. `file:./dev.db` (relative to `prisma/`) |
| `AUTH_SECRET`  | Secret used to sign the session cookie              |

## Project layout

```
prisma/schema.prisma          User, Category, Expense models
src/middleware.ts             redirects logged-out users to /login
src/app/auth-actions.ts       register, login, logout
src/app/expense-actions.ts    add / delete spending
src/app/page.tsx              dashboard
src/app/calendar/page.tsx     month calendar
src/components/               Calendar, AddExpenseModal, DayDetails, AuthForm, Nav
```

Amounts are stored in minor units (agorot / cents) and days as `YYYY-MM-DD` strings so a spend never moves to another day because of time zones.

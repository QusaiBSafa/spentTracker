# SpentTracker

A small spending tracker: register with any email and password, log what you spend on a month calendar, and see totals per category for this month and last month.

## Features

- **Login / register** with email and password (hashed with bcrypt, no email verification). Sessions are a signed, http-only cookie.
- **Dashboard** with two cards, this month and the previous month, each showing the total spent per category. ILS and USD are totalled separately (no currency conversion).
- **Calendar** for any month. Each day has a **+** button that opens a popup to pick a category, enter an amount, choose ILS or USD, and save. Click a day's total to see its items and delete one.
- **Categories**: each new account starts with Food, Groceries, Transport, Rent, Bills, Shopping, Health, Entertainment and Other. Pick "+ Add new category…" in the popup to create your own.

## Stack

Next.js 15 (App Router, TypeScript, server actions), Tailwind CSS 4, Prisma with PostgreSQL.

## Deploy to Vercel

1. In Vercel, **Add New → Project** and import this GitHub repo. Keep the detected Next.js settings.
2. Before the first deploy (or right after it fails for a missing database), open the project's **Storage** tab, create a **Neon** Postgres database and connect it to the project. This sets `DATABASE_URL` and `DATABASE_URL_UNPOOLED`.
3. In **Settings → Environment Variables**, add `AUTH_SECRET` with a long random value (`openssl rand -base64 32`).
4. Deploy (or redeploy). The `vercel-build` script runs `prisma migrate deploy` before `next build`, so the tables are created automatically and every later schema migration is applied on deploy.

Any other Postgres works too: set `DATABASE_URL` to its pooled URL and `DATABASE_URL_UNPOOLED` to its direct URL (the same value if it has no pooler).

## Run locally

Requires Node.js 20+ and a Postgres database (for example `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=spent postgres:16`).

```bash
npm install                 # also generates the Prisma client
cp .env.example .env        # point the URLs at your database, set AUTH_SECRET
npm run db:migrate          # creates the tables
npm run dev                 # http://localhost:3000
```

To change the schema, edit `prisma/schema.prisma` and run `npx prisma migrate dev --name <change>`, then commit the new folder in `prisma/migrations`.

## Environment variables

| Name                    | Description                                              |
| ----------------------- | -------------------------------------------------------- |
| `DATABASE_URL`          | Postgres connection string used by the app (pooled)      |
| `DATABASE_URL_UNPOOLED` | Direct Postgres connection used by migrations            |
| `AUTH_SECRET`           | Secret used to sign the session cookie                   |

## Project layout

```
prisma/schema.prisma          User, Category, Expense models
prisma/migrations/            SQL migrations, applied on every Vercel deploy
src/middleware.ts             redirects logged-out users to /login
src/app/auth-actions.ts       register, login, logout
src/app/expense-actions.ts    add / delete spending
src/app/page.tsx              dashboard
src/app/calendar/page.tsx     month calendar
src/components/               Calendar, AddExpenseModal, DayDetails, AuthForm, Nav
```

Amounts are stored in minor units (agorot / cents) and days as `YYYY-MM-DD` strings so a spend never moves to another day because of time zones.

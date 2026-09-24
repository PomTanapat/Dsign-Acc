# Dsign Accounting Workspace

Web application for a Thai accounting firm. Marketing site + authenticated workspace
for quotations, tax invoices, receipts, withholding tax, and tax estimation.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript 5
- Tailwind CSS 3 + shadcn/ui
- Drizzle ORM + Postgres
- Auth.js v5 (Credentials + Google) with Drizzle adapter
- next-intl for Thai / English (locale in URL)
- react-pdf for document rendering (Phase 2+)
- Resend for transactional email (Phase 5+)

## Install

```bash
npm install
cp .env.example .env.local
# fill in DATABASE_URL, AUTH_SECRET, etc.
npm run db:push   # creates auth tables in the dev database
npm run dev
```

App runs at `http://localhost:3000` and redirects to `/th` by default.

## Environment variables

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | yes | Postgres connection string |
| `AUTH_SECRET` | yes | 32-byte random string. `npx auth secret` |
| `AUTH_URL` | prod | Public base URL with no trailing slash |
| `AUTH_GOOGLE_ID` | optional | Google OAuth client id |
| `AUTH_GOOGLE_SECRET` | optional | Google OAuth client secret |
| `RESEND_API_KEY` | later | Used from Phase 5 onwards |
| `EMAIL_FROM` | later | Sender identity for Resend |
| `TALK_TO_US_EMAIL` | prod | Firm inbox for "Talk to us" leads |
| `CRON_SECRET` | prod | Bearer secret for `/api/cron/leads-digest`; unset disables it |
| `NEXT_PUBLIC_SHOW_DRAFT_BADGES` | optional | `true` shows "draft — pending CPA review" badges; read at server start |

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm start` | Run production build |
| `npm run lint` | ESLint |
| `npm run db:generate` | Generate Drizzle migration SQL |
| `npm run db:migrate` | Apply migrations |
| `npm run db:migrate:deploy` | Production migrator (`scripts/migrate.mjs`); reads `DATABASE_URL` from the shell, not `.env.local` |
| `npm run db:push` | Push schema directly (dev convenience) |
| `npm run db:studio` | Drizzle Studio UI |

## Deploy to Railway

1. Create a Railway project, attach a Postgres plugin.
2. Set the env vars from the table above in the Railway service.
3. Push this repo — Railway picks up `railway.json`, runs `npm run build`, then starts with
   `npm run db:migrate:deploy && npm start`, so migrations apply on every deploy before boot.
   Never run `db:push` against production.
4. Schedule a daily `GET /api/cron/leads-digest` with `Authorization: Bearer $CRON_SECRET`
   (see `docs/specs/phase-7-qa-checklist.md` section E).

## Project layout

```
src/
  app/                Next.js App Router
    [locale]/         All routes live under a locale prefix
      (marketing)/    Public marketing pages
      (app)/          Authed workspace
      login, signup
    api/auth/[...nextauth]/
  components/         UI components (shadcn under ui/)
  i18n/               next-intl config
  lib/
    auth.ts           Auth.js v5 config
    db/               Drizzle schema + client
    utils.ts
  middleware.ts       i18n + auth gate
messages/             th.json, en.json
```

## Phase 0 scope

This is the scaffold only. Marketing page is fully ported, auth flow boots end-to-end,
the authed workspace renders placeholder pages. Document generation, PDF, email, and
business logic land in later phases.

## Phase 2 — documents & PDFs

Phase 2 ships quotation / tax invoice / receipt issuance with PDF download.

After cloning, fetch the Sarabun font files used by the PDF renderer once:

```bash
bash scripts/download-fonts.sh
```

This downloads `Sarabun-Regular.ttf` and `Sarabun-Bold.ttf` from the upstream
Google Fonts repository into `public/fonts/`. Commit the files so the PDF
route can find them in production. The font is published under SIL OFL.

Then push the new schema:

```bash
npm run db:push
```

Tables added: `documents`, `document_lines`, `document_counters`.

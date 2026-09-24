# Phase 7 — manual QA checklist (gate matrix + visual passes)

> Run against staging with a copy of production data BEFORE the deploy that
> carries the gate flip (migrations 0001+0002). Automated coverage: 51 unit
> tests (`npm test`), i18n parity (`node scripts/check-i18n-parity.mjs`),
> onboarding message coverage (`node scripts/check-onboarding-messages.mjs`).
> Playwright E2E was deliberately deferred — this checklist is the v1 E2E.

## QA run — 2026-09-24 (local rehearsal)

**Environment:** local Postgres 16 (Docker, port 5434), two databases —
`dsign_qa_fresh` (empty DB → `db:migrate:deploy`) and `dsign_qa_legacy`
(`0000_baseline.sql` + hand-made pre-Phase-7 companies → `db:migrate:deploy`,
i.e. the exact Railway path: baseline bootstrap, 0001, 0002 backfill). Dev
server driven through the in-app browser; money and lead outcomes checked
in the database, not just on screen. `NEXT_PUBLIC_SHOW_DRAFT_BADGES=true`,
`TALK_TO_US_EMAIL` unset.

**Result:** 27 of 28 rows pass. D2 is the owner's eyeball call. Two
sub-checks need staging (real email delivery in C3, a real phone tap in C2).
**Still required before deploy:** the prod-data-copy rehearsal (section E
step 1) — this run used synthetic legacy data.

**Fixed during this run** (all on `feat/phase-7-guidance-onboarding`):
drizzle migration journal was git-ignored (Railway deploy would crash-loop);
Sarabun fonts never committed (PDFs lose Thai glyphs); all `/api/*` routes
except auth were locale-redirected to 404 (PDF download + leads-digest cron
dead); invoice/WHT live totals stuck at 0.00; wizard draft leaked between
accounts on a shared device; foreign-term glossary deep links landed on
nothing; form validation showed raw keys (`invalidTin`).

## A. Gate matrix (the high-blast-radius cases)

- [x] **New signup** → first visit to any workspace URL lands on `/onboarding`; finishing lands on the tailored dashboard.
- [x] **Existing (backfilled) user** → signs in, lands on dashboard, NEVER sees the wizard. Verify `onboardingCompletedAt` was stamped by migration 0002. *(All 4 legacy companies stamped = createdAt; 0 unstamped.)*
- [x] **Existing VAT-issuing user** → can still issue a 7% VAT invoice post-flip (backfill must have inferred `vatRegistered='yes'` from their documents). **This was the adversarial review's top regression risk.** *(INV-2026-00001: DB 5,000.00 + 350.00 VAT = 5,350.00. A company whose only VAT invoice was voided correctly inferred 'unsure'.)*
- [x] **Existing user with WHT certificates** → still sees the WHT nav item (`paysOthers` inferred 'yes').
- [x] **Skip-all** → lands in the workspace with safe defaults; revisiting `/onboarding` redirects to dashboard; no redirect loop.
- [x] **Foreign branch** → selecting "Foreign owner" flips to `/en/...` mid-wizard WITHOUT losing the two answers already given; the two foreign questions appear after nationality.
- [x] **Legal-incomplete issuance** → wizard-onboarded user (no nameTh/tin) opening `/invoices/new` redirects to Settings with the banner; the server also rejects (`companyIncomplete`) if the form is submitted via a crafted request. *(Crafted server-action call returned `companyIncomplete`.)*
- [x] **VAT server block** → with `vatRegistered='no'` (or 'unsure'), submitting an invoice with a 7% line returns the friendly `vatNotRegistered` error — also when bypassing the confirm dialog (fast mode / direct action call). *(Blocked via UI, direct call, and a call spoofing zero totals — VAT is recomputed server-side.)*
- [x] **Glossary mid-onboarding** → a not-yet-onboarded user can open `/glossary` from a wizard explainer "Learn more" link (deliberately ungated) and return to the wizard with the draft intact. *(Foreign-term links fixed to land on their term.)*
- [x] **Resume** → answer 3 questions, close the tab, return after >30s → "pick up where you left off" card; Continue restores position; Start over clears. *(Draft now scoped per user.)*

Also verified: tenant isolation — another company's customer (write), invoice page and PDF (read) all 404/`customerNotFound`, no data leaked.

## B. Tailoring matrix (one pass per archetype)

- [x] **Salon (receipt-primary)**: onboards in ≤8 screens; sidebar shows Receipts (badged "main") then Invoices, no Quotations, no WHT; dashboard KPI 1 = "Collected this month" reading RECEIPTS; New-receipt CTA. *(8 question screens with the optional incorporation offer.)*
- [x] **Freelancer**: Quotations/Invoices (badged)/Receipts + WHT (when paysOthers=yes); WHT-received educational card on dashboard; invoice form auto-suggests 3% WHT for a juristic customer (once — clearing it doesn't re-apply).
- [x] **Contractor**: Quotations badged + first; KPI 1 = "Open quotations".
- [x] **Industry switch in Settings** (salon → freelancer): sidebar + dashboard re-tailor on save; previously-issued receipts NEVER disappear from the nav. *(Reverse also checked: a hidden type with documents — quotations on salon — stays visible, unbadged.)*
- [x] **Receipt-primary VAT nudge**: a receipt-only company with ≥฿1.53M trailing-12-month receipts sees the threshold nudge (this was structurally broken in the prototype's invoice-only basis). Dismiss → gone; re-arms after 30 days or +5% revenue. *(Shown at ฿1,600,000. Dismiss/re-arm covered by `threshold-logic.test.ts`, not re-driven by hand.)*

## C. Guidance modes

- [x] Guided: explainer cards open under VAT/WHT/juristic fields; issuing with VAT/WHT opens the confirm dialog with real amounts; Esc/cancel works; confirm issues. *(INV-2026-00006: DB 10,000.00 − 300.00 WHT = 9,700.00.)*
- [x] Fast: quiet "term?" triggers with hover + tap popovers (test TOUCH — tap opens, tap outside closes); no confirm dialog. *(Tap simulated with a mouse click; confirm on a real phone.)*
- [x] Talk-to-us: from an explainer → dialog carries the term context; submit with a phone number → lead row in `lead_events` with `contactValue`; firm inbox receives the email; on TALK_TO_US_EMAIL unset → success state still shows "call us now" fallback and the lead row exists. *(Lead row: surface `vat`, channel phone. Inbox delivery needs `RESEND_API_KEY` — verify on staging.)*
- [x] Switch-to-Fast suggestion appears in Settings only after ≥5 issued documents; "Keep Guided" dismisses forever. *(Absent at 4, shown at 5, gone after dismiss + reload. Dismissal is per browser, not per user.)*

## D. Visual / typography passes (manual, both locales)

- [x] **Thai typography**: explainer fact pills, onboarding option subs, rate table, nudge bodies — no clipped vowel/tone marks (ภ.ง.ด., ฿, ทวิ) at small sizes; Sarabun line-heights breathe. *(Measured, not eyeballed: 0 clipping containers; pills ≥1.5× line-height; nudge 13px at 1.63×; Sarabun + Kanit loaded.)*
- [ ] **Marketing site + login re-theme** (one-brand decision): hero, services, contact, login/signup all carry the new teal without broken contrast; owner eyeballs and approves. *(Owner call — Tanapat.)*
- [x] **Onboarding on a phone** (≤390px): one column, full-width options, reachable footer nav, no horizontal scroll; Finish report readable. *(375px: all 10 steps + Finish report exactly 375px wide. Q1's Next button sits ~70px below the fold — reachable by scroll.)*
- [x] **Draft badges**: with `NEXT_PUBLIC_SHOW_DRAFT_BADGES=true` every glossary term shows the amber flag + page banner; with it unset, none do. Pricing estimate badge shows while `PRICING_CONFIRMED=false`. *(18/18 flagged on; 0 off. `PRICING_CONFIRMED` is a code constant in `src/lib/guidance/pricing.ts`, not an env var.)*
- [x] **Fast-mode popover** inside the document form's narrow columns: no clipping, sits above inputs, closes on Esc.

## E. Deploy runbook (same release as the gate flip)

1. Staging rehearsal of sections A+B against a prod-data copy.
2. Deploy: Railway runs `npm run db:migrate:deploy` (journal bootstrap marks baseline applied; 0001 adds columns; 0002 backfills + stamps) before `npm start`.
3. Post-deploy: spot-check one real pre-existing account against section A rows 2–4.
4. Rollback stance: additive columns are reversible; the NOT NULL relaxation is forward-fix-only once wizard rows exist (documented in the plan, D2).
5. **Set env in prod:** `TALK_TO_US_EMAIL` (lead inbox) and `CRON_SECRET` (any random string). Without the secret the digest endpoint plays dead.
6. **Schedule the leads digest** — REQUIRED, not optional. `incorporation_interest` leads send no instant email; the digest is their only delivery. Point a daily scheduler (Railway cron service, or a free pinger like cron-job.org) at `GET /api/cron/leads-digest` with header `Authorization: Bearer $CRON_SECRET`. Without this, soft leads surface nowhere. (`talk_request` — including the Finish "Talk to a CPA" and the VAT nudge — still emails the firm instantly, so it does not depend on the cron.)

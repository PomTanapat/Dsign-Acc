# Phase 7 — manual QA checklist (gate matrix + visual passes)

> Run against staging with a copy of production data BEFORE the deploy that
> carries the gate flip (migrations 0001+0002). Automated coverage: 51 unit
> tests (`npm test`), i18n parity (`node scripts/check-i18n-parity.mjs`),
> onboarding message coverage (`node scripts/check-onboarding-messages.mjs`).
> Playwright E2E was deliberately deferred — this checklist is the v1 E2E.

## A. Gate matrix (the high-blast-radius cases)

- [ ] **New signup** → first visit to any workspace URL lands on `/onboarding`; finishing lands on the tailored dashboard.
- [ ] **Existing (backfilled) user** → signs in, lands on dashboard, NEVER sees the wizard. Verify `onboardingCompletedAt` was stamped by migration 0002.
- [ ] **Existing VAT-issuing user** → can still issue a 7% VAT invoice post-flip (backfill must have inferred `vatRegistered='yes'` from their documents). **This was the adversarial review's top regression risk.**
- [ ] **Existing user with WHT certificates** → still sees the WHT nav item (`paysOthers` inferred 'yes').
- [ ] **Skip-all** → lands in the workspace with safe defaults; revisiting `/onboarding` redirects to dashboard; no redirect loop.
- [ ] **Foreign branch** → selecting "Foreign owner" flips to `/en/...` mid-wizard WITHOUT losing the two answers already given; the two foreign questions appear after nationality.
- [ ] **Legal-incomplete issuance** → wizard-onboarded user (no nameTh/tin) opening `/invoices/new` redirects to Settings with the banner; the server also rejects (`companyIncomplete`) if the form is submitted via a crafted request.
- [ ] **VAT server block** → with `vatRegistered='no'` (or 'unsure'), submitting an invoice with a 7% line returns the friendly `vatNotRegistered` error — also when bypassing the confirm dialog (fast mode / direct action call).
- [ ] **Glossary mid-onboarding** → a not-yet-onboarded user can open `/glossary` from a wizard explainer "Learn more" link (deliberately ungated) and return to the wizard with the draft intact.
- [ ] **Resume** → answer 3 questions, close the tab, return after >30s → "pick up where you left off" card; Continue restores position; Start over clears.

## B. Tailoring matrix (one pass per archetype)

- [ ] **Salon (receipt-primary)**: onboards in ≤8 screens; sidebar shows Receipts (badged "main") then Invoices, no Quotations, no WHT; dashboard KPI 1 = "Collected this month" reading RECEIPTS; New-receipt CTA.
- [ ] **Freelancer**: Quotations/Invoices (badged)/Receipts + WHT (when paysOthers=yes); WHT-received educational card on dashboard; invoice form auto-suggests 3% WHT for a juristic customer (once — clearing it doesn't re-apply).
- [ ] **Contractor**: Quotations badged + first; KPI 1 = "Open quotations".
- [ ] **Industry switch in Settings** (salon → freelancer): sidebar + dashboard re-tailor on save; previously-issued receipts NEVER disappear from the nav.
- [ ] **Receipt-primary VAT nudge**: a receipt-only company with ≥฿1.53M trailing-12-month receipts sees the threshold nudge (this was structurally broken in the prototype's invoice-only basis). Dismiss → gone; re-arms after 30 days or +5% revenue.

## C. Guidance modes

- [ ] Guided: explainer cards open under VAT/WHT/juristic fields; issuing with VAT/WHT opens the confirm dialog with real amounts; Esc/cancel works; confirm issues.
- [ ] Fast: quiet "term?" triggers with hover + tap popovers (test TOUCH — tap opens, tap outside closes); no confirm dialog.
- [ ] Talk-to-us: from an explainer → dialog carries the term context; submit with a phone number → lead row in `lead_events` with `contactValue`; firm inbox receives the email; on TALK_TO_US_EMAIL unset → success state still shows "call us now" fallback and the lead row exists.
- [ ] Switch-to-Fast suggestion appears in Settings only after ≥5 issued documents; "Keep Guided" dismisses forever.

## D. Visual / typography passes (manual, both locales)

- [ ] **Thai typography**: explainer fact pills, onboarding option subs, rate table, nudge bodies — no clipped vowel/tone marks (ภ.ง.ด., ฿, ทวิ) at small sizes; Sarabun line-heights breathe.
- [ ] **Marketing site + login re-theme** (one-brand decision): hero, services, contact, login/signup all carry the new teal without broken contrast; owner eyeballs and approves.
- [ ] **Onboarding on a phone** (≤390px): one column, full-width options, reachable footer nav, no horizontal scroll; Finish report readable.
- [ ] **Draft badges**: with `NEXT_PUBLIC_SHOW_DRAFT_BADGES=true` every glossary term shows the amber flag + page banner; with it unset, none do. Pricing estimate badge shows while `PRICING_CONFIRMED=false`.
- [ ] **Fast-mode popover** inside the document form's narrow columns: no clipping, sits above inputs, closes on Esc.

## E. Deploy runbook (same release as the gate flip)

1. Staging rehearsal of sections A+B against a prod-data copy.
2. Deploy: Railway runs `npm run db:migrate:deploy` (journal bootstrap marks baseline applied; 0001 adds columns; 0002 backfills + stamps) before `npm start`.
3. Post-deploy: spot-check one real pre-existing account against section A rows 2–4.
4. Rollback stance: additive columns are reversible; the NOT NULL relaxation is forward-fix-only once wizard rows exist (documented in the plan, D2).

# Phase 7 Implementation Plan — Guidance & Industry Onboarding
Dsign Accounting Workspace · base `develop` · 2026-06-12 · v2.1 FINAL (post-adversarial-review; owner confirmed D7 drivers-first, D17 'thinking'-only, D13 one-brand, D7b pricing watermark)

## 0. Product intent — the contract every decision answers to

Core (owner's words): **be honest and help entrepreneurs — solo owners and small-company admins with little accounting knowledge — do their daily job of issuing documents. Dsign knows and supports them; beyond basic information, when they need advice, Dsign takes charge.**

1. **Honest** — safe defaults a beginner can't get fined by; full costs shown with disclaimers; draft tax copy flagged until CPA sign-off; no verdict we might later contradict; no promise the system can't keep (every "we'll watch it for you" claim is qualified by what the data can actually see).
2. **Helpful** — every tax term ships with its plain-language `<Explainer>`; Guided is the default; the app shrinks to what the user's industry needs. Persona B (admins) keeps speed: Fast mode, backfilled existing users start in Fast, and a one-shot in-context "switch to Fast?" offer.
3. **Dsign takes charge** — every confusing moment routes to a context-aware "Talk to us" request form that emails the firm, records a lead with a callable contact value, confirms to the user when they'll hear back, and never silently drops a request.

## 1. Locked product decisions (owner, 2026-06-12)
1. Scope: Phase 7 deep + roadmap connection (7 → 10 → 6 → 8 → 11 → 9).
2. Talk-to-us = in-app request form (Resend email + stored lead record) + phone/LINE links.
3. Draft flags stay during build; CPA review is a pre-launch release gate.
4. Onboarding wizard fully mobile-responsive; workspace desktop-first (1080px breakpoint).

## 2. Architecture decisions

**D1 — Profile lives on `companies`; row created at onboarding Finish.**
Relax `nameTh`/`tin`/`addressTh` to nullable. Two predicates in `src/lib/queries/company.ts`: `isOnboarded()` (`onboardingCompletedAt` set) and `isLegalComplete()` (nameTh+tin+addressTh present). `requireOnboarded()` gates ALL `(app)` routes incl. dashboard + tax-estimator (currently ungated); legal-complete check stays only on document-creation pages → `/settings`. Matches Phase 11 auto-onboard (re-runs onboarding for the new juristic company).

**D2 — Real migrations with an actual execution mechanism.**
- No `drizzle/` folder exists (history = `db:push`) and `railway.json` runs no migrate step. Step 0 must: (a) generate a **baseline** and mark it applied in prod's migrations journal (drizzle journal bootstrap — the baseline CREATE TABLEs must never execute against the live DB); (b) wire `db:migrate` into the Railway deploy (pre-deploy command or `npm run db:migrate && npm start`); (c) verify end-to-end against a prod copy *including journal state*.
- **Migration #1 (Step 0, additive only):** new columns (D3) + `lead_events` table + the `nameTh`/`tin`/`addressTh` DROP NOT NULL.
- **Backfill ships with the gate flip (Step 2), not Step 0** — as an idempotent script/migration run in the same deploy that flips the gate, so signups during the Step-0→Step-2 window are covered. Backfill **infers the profile from real data, never bare defaults**:
  - `onboardingCompletedAt = createdAt` where null (existing companies skip the wizard)
  - `vatRegistered = 'yes'` where the company has non-void documents with vatAmount > 0 (else `'unsure'` — never `'no'` for pre-existing rows)
  - `paysOthers = 'yes'` where whtCertificates rows exist
  - `guidanceMode = 'fast'` for backfilled companies (they already operate the raw tool — no day-one confirm-dialog regression for Persona B); new users default `'guided'`
- **Rollback stance:** additive columns are reversible; the NOT NULL relaxation is forward-fix-only once wizard-created rows exist — documented in the runbook; staging rehearsal of the full gate matrix before prod.

**D3 — Schema additions.** `companies`: `industry` ('other'), `entityType` ('individual'), `revenueBand` nullable, `vatRegistered` tri-state text yes|no|unsure, `paysOthers` ('no'), `guidanceMode` guided|fast, `foreignOwned` bool, `ownershipStructure` nullable, `workPermitNeed` nullable, `onboardingAnswers` jsonb (raw answers + schema-version field — Phase 8/10 prefill), `onboardingCompletedAt`, `dismissedNudges` jsonb. New `lead_events`: id, **userId notNull** (wizard-stage requests happen before any company exists), companyId **nullable** FK, kind ('talk_request'|'talk_open'|'incorporation_interest'|'vat_threshold_cta'), surface/term, message nullable, contactChannel, **contactValue** (the actual phone/LINE/email to reach them — prefilled from company.phone when present), **emailedAt nullable** (send-success record), status ('new'|'handled'), createdAt. Phase 8's leads/triggers table evolves from this.

**D4 — guidanceMode stored collapsed** (guided2 → guided); raw answer kept in `onboardingAnswers`. The guided2 option's sub-copy is relabeled honestly ("Guided mode — same help; switch to Fast anytime") since no third experience exists; recorded in the spec amendment.

**D5 — Glossary is a typed TS module** `src/lib/guidance/glossary.ts` (18 terms, dual-locale, selected by `useLocale()`); arrays/asymmetries don't fit next-intl messages; precedent `wht-types.ts`. Page chrome in messages. **During the port, strip or parameterize any copy that asserts the user's current state** (e.g. vat term's "left off by default for you" is false for registered users) — no static copy may claim the user's configuration; state-aware suffixes can read the profile slice from GuidanceProvider. "Learn more" links render only where the glossary page adds content beyond the card (e.g. whtIssued's rate table); otherwise omitted — curiosity routes to Talk-to-us instead (no dead-ends, no circular links).

**D6 — Draft badges env-gated** (`NEXT_PUBLIC_SHOW_DRAFT_BADGES`): on in dev/staging; CPA sign-off flips `draft:false` per term; production launch requires zero draft terms. **Same gate pattern applies to pricing** (see D7b).

**D7 — Finish screen: drivers-first assessment with safe edge states. [CONFIRMED 2026-06-12]**
Keep the assessment experience; compute the verdict ONLY from qualitative drivers (liability, credibility, funding, corp clients, hiring — captured by `whyIncorporate`) + corp-client signal. Never from tax math; never a ฿-savings claim. Edge cases specified:
- Drivers = only 'tax' and/or 'unsure' (and clientType not corp/mixed) → **no verdict tone**: neutral "your answer points at the numbers — run the full assessment / talk to us, free" state. Never amber "probably not yet" (a tax-only user with high profit could be told 'no' now and 'yes' by Phase 10 — same hazard inverted).
- Genuinely empty driver set → soft "no strong reason stood out yet — we'll tell you when that changes" + Phase 10 CTA.
- Foreign owners: suppress the ฿20,000 one-time setup row (their setup is "quoted case-by-case after a free consult" — showing the Thai-track price contradicts it); keep the recurring table; verdict copy "typically operate through a Thai company" (not "must" — branch/rep-office is a structure they may have just selected); CTA routes to the specialist (Phase 10 §6 pattern).
- Already-juristic: reframed "here's what we set up" (no verdict).
Scoring isolated in `src/lib/guidance/incorporation-teaser.ts` (Phase 10 absorbs it); emits `lead_events` 'incorporation_interest'. Alternative if owner prefers: cut verdict entirely, keep summary + costs + assessment link.

**D7b — Pricing is release-gated like the glossary.** All figures (฿20k setup, ฿30k+8k+8k recurring, ฿66k year-1, ฿2,500/mo from, ฿80k–200k active range, "first consult free") live in `src/lib/guidance/pricing.ts` with `// TODO: verify with firm`; an env-gated "estimate" watermark only firm sign-off removes; **owner confirmation of pricing added to the inputs list** — publishing the firm's own wrong prices would break the exact honesty the cost table exists to prove.

**D8 — Sidebar tailoring with safety overrides.** Reorder + hide per industry config; "main" badge strictly follows `primaryDocType` (fixes the prototype's `unshift(quo)` badge bug); never hide a doc type with existing documents — **and the WHT nav item's override counts `whtCertificates` rows** (separate table). Static items unchanged. The "Managed by Dsign — full-service accounting" sidebar box ports too: it's the persistent visual cue that a real firm stands behind the tool (the owner's core promise), linking to Talk-to-us.

**D9 — Nudges honest-by-construction, with an honest revenue basis.**
VAT-threshold nudge from `src/lib/guidance/threshold-watch.ts` — trailing-12-month revenue over **non-void invoices + receipts, with a de-dup rule for invoice→receipt pairs** (invoice-only would be structurally blind for exactly the cash/receipt segments — online/food/salon — the nudge exists for; the de-dup rule goes on the CPA review list). Shown when `vatRegistered !== 'yes'` and revenue ≥ 85% of ฿1.8M; figures via ICU args only. **All "we'll watch it for you" copy (wizard sub-option, glossary vatThreshold) is qualified: "based on the documents you issue in Dsign."** Dismissal persists in `dismissedNudges` but re-arms (next 5% band or 30 days). WHT-received nudge = educational "good to know" card (real explainer copy, Talk-to-us CTA, no fake figures, no record-CTA — received-slip model is Phase 6/9).

**D10 — Confirm-before-consequence, client AND server, symmetric safety.**
Guided + (VAT>0 or WHT>0) → confirm dialog (amounts + running-number permanence). Server-side in `createDocument`: block issuing a tax invoice with VAT lines when `vatRegistered` is `'no'` **or `'unsure'`** ('unsure' behaves like 'no' everywhere — and "We'll explain and help you check" is delivered exactly here): friendly two-path escape — "I'm registered → update settings" / "Not sure → let us check for you (free)". This is STRATEGY §8's "can't issue an invalid doc" made real (issuing a ใบกำกับภาษี unregistered is unlawful). Persona B relief valve: after N consecutive unmodified confirms, a one-shot dismissed-forever offer inside the dialog ("You seem comfortable — switch to Fast? Settings → Guidance").

**D11 — Safe defaults in the document form, complete.** Line `vatRate` default = `vatRegistered === 'yes' ? '7' : '0'` (currently hardcoded '7') **including the add-from-catalog path** (`addFromItem`: `vatRegistered === 'yes' && item.vatApplicable ? '7' : '0'` — otherwise the "we kept VAT off" note lies); assist note shown. `defaultVatRate`'s role restated: the rate applied when VAT is on; Settings keeps it adjacent to `vatRegistered` with a consistency hint. **WHT auto-suggest keyed to service-natured industries** (freelance / prof / contractor) + juristic customer → pre-select 3% (suggest, never force); goods-leaning industries (retail/online/other) get a passive hint instead — 3% withholding applies to services, not goods purchases, and an auto-on default would manufacture wrong documents. Heuristic goes on the CPA review list.

**D12 — Foreign branch locale flip without data loss.** Persist answers to localStorage draft → inline "switching to English-first" notice → `router.replace(pathname, {locale:'en'})` → restore on remount → write `users.locale`. Draft payload carries a version field; on restore, answers are filtered to currently-valid question ids/option values and position recomputed from first unanswered (survives deploys that change the question config).

**D13 — Theme: targeted Ledger token adoption. [CONFIRMED: one brand everywhere — marketing + login included, added to Step 5 QA]**
Repoint `--primary`/`--ring` (+ dark) to teal #157E8C, add `--brand` #106070 + soft amber/teal surface tokens; tailwind.config entries. **The swap re-themes the public marketing site and login/signup too** (shared globals.css; marketing components consume primary tokens) — either confirmed as one-brand intent (marketing QA added to Step 5) or scoped to the app/onboarding trees. Body font stays **Sarabun** (screen/PDF parity — resolves the handoff's Prompt question). next/font migration + status-pill refactor = follow-ups.

**D14 — Skip never strands; resume exists.** Skip-all writes minimal profile + `onboardingCompletedAt`. Resume = localStorage draft + "pick up where you left off" entry card.

**D15 — Render the per-question `note`** ("what this sets") — honest "quietly configures" microcopy; use `TermLabel` in real forms.

**D16 — revenueBand cadence: yearly** (matches ฿1.8M/year threshold framing); STRATEGY §10's "monthly" superseded — in spec amendment.

**D17 — OB_DECIDE gating. [CONFIRMED: 'thinking'-only + optional offer for individuals]** The prototype asks the 3 incorporation questions of every non-juristic user (a salon owner who said "just myself" answers 10 screens — against the spec's 'thinking'-only offer and the 3-minute benchmark). Recommended: OB_DECIDE only when `entityType === 'thinking'`; for 'individual', one optional one-line offer ("Curious whether a company would fit? 3 quick questions / skip"). Prototype behavior available if owner prefers the lead data.

**D18 — GuidanceProvider mounts in BOTH layouts.** `(app)/layout.tsx` (mode from profile; layout fetches company via React `cache()`) AND `(onboarding)/layout.tsx` (mode forced 'guided', TalkToUs hosted) — the wizard embeds Explainers on 6+ questions and its Talk-to-us moments are the most valuable leads; without the second mount the funnel is dead during the most confusion-heavy flow.

**D19 — Talk-to-us closes the loop.** Form: topic (prefilled from term/surface), message, preferred channel + **contact value** (prefilled where known). Server action: insert `lead_events` (userId-keyed), **await** the Resend send (reusing `src/lib/email/client.ts` + a new template), stamp `emailedAt`; on send failure persist the lead anyway and show the tel:/LINE fallback prominently ("or call us now"). Post-submit confirmation states when the firm will respond (e.g. "within 1 business day" — owner confirms the promise). Until Phase 8 exists: a daily digest email of `status='new'` leads so nothing rots in a table nobody reads.

## 3. Build sequence — six steps off `develop` (B-core before wizard: questions embed Explainers)

**Step 0 — Foundations** (small-medium)
Drizzle baseline + journal bootstrap on prod; Railway migrate wiring; migration #1 (additive: D3 columns, lead_events, NOT NULL relaxation); deploy/rollback runbook; theme tokens (D13, after owner scope decision); shadcn `popover` (`@radix-ui/react-popover`); `isOnboarded`/`isLegalComplete`/`requireOnboarded` helpers built but **gates stay on the old predicate/target** (flip is Step 2 — flipping now would redirect every new user to a 404 and strand them, since /settings is today the only place a company row is created); middleware segments; constants (phone, LINE); env flags; **install Vitest** (repo has Vitest-shaped doc-tests already).

**Step 1 — Pillar B core: the guidance system** (large, copy-heavy)
`glossary.ts` (18 terms; state-claim strip per D5; TH/EN asymmetries flagged); `guidance-provider.tsx`; `explainer.tsx` / `rate-table.tsx` / `term-label.tsx`; `talk-to-us.tsx` per D19 + daily digest; glossary page (core/foreign sections, draft banner); sidebar Guidance group + Managed-by-Dsign box (D8). i18n: `Guidance`, `Glossary`. Unit tests: glossary shape, lucide icon-name mapping (CircleHelp vs HelpCircle at lucide-react@0.468 verified here).

**Step 2 — Pillar A: onboarding wizard + THE gate flip** (largest; one atomic deploy)
`(onboarding)` route group + layout (auth-gated, no shell, GuidanceProvider per D18); `onboarding-questions.ts` (D17 branch rules); wizard client (navigate by question id; 260ms auto-advance singles; explicit Next on the multi; Back/Skip; versioned localStorage draft; stepper; mobile-responsive); foreign branch + locale flip (D12); zod validation; `actions/onboarding.ts` upsert + revalidate; Finish per D7/D7b (summary, what-we-configured, drivers-first verdict with safe edge states, pricing table, foreign essentials, CPA CTA, disclaimer); resume entry (D14). **Same deploy:** gate predicate/destination flip at all 14 call sites + the idempotent inference backfill (D2). i18n: `Onboarding`. Unit tests: question-list assembly (foreign/decide branches), teaser scoring incl. edge states, zod schema, draft restore filtering.

**Step 3 — Pillar C: industry tailoring** (medium-large — needs new queries)
`industry-config.ts` (8 industries; port `hide` AND booleans; `onboardingHint`); sidebar `buildNav` + D8 overrides; dashboard emphasis with **explicit data mapping and the new queries it requires**: sales → invoices total this month (exists); billing → receipts collected this month (**new query** — existing aggregates are invoice-only, so receipt-primary industries would otherwise show ฿0); projects → **remapped to open-quotations count** (new cheap query; no projects entity exists — 'Active projects' is unimplementable) [owner may prefer descoping to sales]; KPI 2 documents-this-month all types (new count); KPI 3 WHT-withheld vs VAT-collected by profile; "New {doc}" CTA; first-task card derived from real data; **list-page empty states tailored** by `primaryDocType` ({doc} ICU strings — spec §7 requires it). i18n: `Industries`, `App.dashboard.firstTask`. Unit tests: buildNav incl. overrides.

**Step 4 — Fear-removal wiring into existing screens** (medium-large)
Explainers into `document-form` (doc-WHT → whtReceived, netPayable, VAT column compact), `customer-form` (juristic), `wht-form` (whtIssued + RateTable, income-type codes, paymentMethod), `company-form` (tin/branch/vat), **`item-form` (vatApplicable → vat, whtRate → whtIssued — in the build prompt's Modify list)**; safe defaults incl. addFromItem (D11); WHT auto-suggest per D11; confirm dialog + server-side block (D10) + Persona-B relief valve; VAT-threshold nudge (threshold-watch per D9) + educational WHT card + dismissal persistence; settings business-profile section (mode radio, industry, vatRegistered tri-state + defaultVatRate consistency hint, paysOthers) + `updateBusinessProfile`; "switch to Fast?" in Settings after ≥5 docs; retire `?onboarding=1`. i18n: `Nudges`, `Settings.*`, `DocumentForm.confirm.*`. Unit tests: threshold-watch math incl. receipt de-dup + a receipt-primary company crossing 85%.

**Step 5 — Hardening, QA, spec amendment** (medium)
th/en key parity; Thai typography QA (tall vowels/tone marks at small sizes) on every new component; a11y (wizard keyboard nav, popover focus/Esc/touch + z-index/clipping at compact column headers, dialog traps, ARIA, reduced motion); demo-data sweep (fakes live inside i18n strings); **E2E gate matrix as a scripted manual QA checklist** (Playwright deferred, cost noted): new user → wizard; existing user backfilled → no wizard; **existing VAT user issues an invoice post-flip**; skip → workspace; foreign → EN flip preserving answers; legal-incomplete → settings on doc pages; receipt-primary nudge; draft/pricing gating; marketing-site visual QA (if D13 one-brand). Spec amendment recording every deviation: D7 reframe, D7b, lead_events, tri-state vatRegistered + 'unsure'=block, yearly bands, D17 gating, guided2 relabel, cut first-doc walkthrough + mode-dependent field labels (spec §4 items the prototype never designed — deferred with reason), notifications/bell deferred to Phase 8's deadline calendar.

**Out of scope / resolved by existing screens** (handoff Remaining Issues 4–7): add-customer → existing `/customers` (first-task step 2 links there); document list "View all" → existing list pages; WHT-certificate tool → existing `/wht`; notifications/bell → deferred to Phase 8 deadline calendar; received-WHT-slip recording → Phase 6/9.

## 4. "Dsign takes charge" wiring (north star)
Confusion → Explainer (plain words) → still unsure → Talk-to-us (context prefilled) → lead recorded with callable contact + awaited email + response-time promise → human takes over. Every nudge CTA and every "Not sure?" routes through the same funnel; the Managed-by-Dsign box keeps the firm visibly present. Phase 8's cockpit consumes `lead_events`; Phase 11 enters from the threshold nudge.

## 5. Roadmap fit
| Artifact | P10 (next) | P6 | P8 | P9 | P11 |
|---|---|---|---|---|---|
| Profile fields | prefill | vatRegistered hides input-VAT; paysOthers↔WHT | entityType/foreign in cockpit | gates VAT block; set-aside type | routes track; re-run post-formation |
| onboardingAnswers (versioned) | prefill drivers+bands | — | lead context | — | intake prefill |
| Explainer/GuidanceProvider | respects Guided/Fast | 3 new terms | n/a (staff see real terms) | explicit dependency | plain-language cost lines |
| glossary.ts | — | +input VAT, deductible, WHT-when-paying | — | +set-aside | +MOA/CPD/CPA |
| threshold-watch.ts | entry trigger | — | same signal → staff trigger | complexity nudges | formation entry |
| lead_events (userId-keyed) | incorporation_interest | — | becomes leads/triggers | "handle this" sink | case pipeline |
| incorporation-teaser.ts | absorbed into compareIncorporation() | — | single fit-signal producer | — | — |

## 6. Top risks (post-review)
| Risk | Sev | Mitigation |
|---|---|---|
| Draft tax copy reaches users | high | D6 env gate; CPA release gate |
| Wrong pricing published | high | D7b: pricing.ts + estimate watermark + firm sign-off release gate |
| Backfill breaks existing VAT/WHT users | high | D2 inference backfill (vatRegistered/paysOthers/guidanceMode from real data); E2E case |
| Gate flip strands users / loops | high | Flip atomic with wizard deploy (Step 2); idempotent backfill same deploy; staging rehearsal |
| Migration vs drifted prod schema, no migrate mechanism | high | D2 baseline journal bootstrap + Railway wiring + runbook |
| Finish verdict contradicts Phase 10 | high | D7 drivers-only + neutral tax/unsure edge states |
| Foreign figures stale/wrong (2026 nominee rule past-tense; 180 vs 183 days) | high | One constants module; specialist review pre-launch; resolve discrepancy |
| Threshold nudge blind for receipt industries | med→fixed | D9 revenue basis incl. receipts + de-dup; copy qualified |
| Tailored nav hides existing data | med | D8 overrides incl. whtCertificates |
| Demo data leaks | med | Step 5 sweep; ICU-args-only rule |
| Client-only confirm bypassable | med | D10 server block incl. 'unsure' |
| Thai typography regressions | med | Step 5 th-locale QA |
| Lost leads (email fails, no contact value) | med | D19 awaited send + emailedAt + contactValue + daily digest |

## 7. Owner decisions — resolved 2026-06-12
1. **D7** — drivers-first Finish assessment with neutral tax/unsure states. ✅ CONFIRMED
2. **D17** — incorporation questions only for "thinking about a company"; individuals get one optional offer. ✅ CONFIRMED
3. **D7b** — pricing ships behind env-gated "first-pass estimate" watermark; firm sign-off removes it pre-launch. ✅ CONFIRMED
4. **D13** — one brand everywhere: teal re-theme includes marketing + login; marketing pages added to Step 5 visual QA. ✅ CONFIRMED
5. **D16** — yearly revenue bands. ✅ (recommended, unobjected)

## 8. Facts still needed from owner (non-blocking until the steps that use them)
- **Before Step 1 (Talk-to-us):** destination email for talk-to-us requests; LINE OA id; confirm phone 086-980-7222; the response-time promise wording (e.g. "within 1 business day").
- **Pre-launch:** CPA reviewer + sign-off channel for glossary terms, rate tables, the WHT auto-suggest heuristic, the threshold de-dup rule, foreign-owner figures (incl. resolving 180 vs 183-day residency), and the pricing figures.

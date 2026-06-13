# Phase 7 Spec — Guidance layer + industry onboarding

> **Status:** BUILT (2026-06-13, branch `feat/phase-7-guidance-onboarding`) —
> see the **Implementation deviations** section at the bottom for every place
> the build differs from this spec, and
> [`phase-7-implementation-plan.md`](phase-7-implementation-plan.md) /
> [`phase-7-qa-checklist.md`](phase-7-qa-checklist.md) for the plan + QA gate.
> · **Priority:** highest of the unbuilt phases
> · **Strategy ref:** `STRATEGY.md` §8 (adaptive guidance), §10 (onboarding),
> Decision #4 (industry tailoring), Groups 1 & 2.
>
> **One line:** Make the already-built features usable — and unscary — for a
> beginner who doesn't know what VAT is, by adding plain-language guidance,
> smart defaults, and an industry-aware onboarding that tailors the whole app.

---

## 1. Why this is the highest-priority build

Phases 0–5 built a capable document tool — but a capable tool a scared beginner
**won't touch** is worth nothing. Phase 7 is the layer that turns "a cockpit of
tax fields" into "it just told me what to do." It's the difference between the
product the strategy describes and the generic SaaS it currently is.

> **Design north star:** the app should feel like *a friendly accountant sitting
> next to you*, not a form. Every tax term is explained the moment it appears;
> every dangerous default is safe; the beginner is never left guessing.

---

## 2. Three pillars

| Pillar | What it does | Serves |
|---|---|---|
| **A. Onboarding interview** | A 6-question, <3-min wizard that understands the business and configures the app | First-run activation; industry tailoring |
| **B. Adaptive guidance** | Guided vs Fast mode; inline plain-language explainers on every tax concept; glossary | Group 1 (novice) vs Group 2 (pro) |
| **C. Industry tailoring** | Surfaces only the relevant doc types/features per industry | Decision #4; "it understands me" |

---

## 3. Pillar A — the onboarding interview

A friendly, one-question-per-screen wizard with a progress bar, reassuring
microcopy, skippable by confident users, resumable, and editable later in
Settings. Replaces/extends the current bare company-setup gate.

### Questions → configuration

| # | Question (plain language) | Sets | Effect |
|---|---|---|---|
| 1 | "What kind of business do you run?" (industry picker) | `industry` | Which docs/features surface (Pillar C) |
| 2 | "Are you just yourself, or a registered company?" | `entityType` | Individual vs juristic defaults; if "thinking about a company" → offer the §Phase-10 assessment |
| 3 | "Roughly how much do you make a year?" (bands) | `revenueBand` | VAT-threshold proximity + nudges |
| 4 | "Are you registered for VAT?" (Yes / No / Not sure) | `vatRegistered` | Whether VAT appears at all ("Not sure" → guidance) |
| 5 | "Do you pay staff, freelancers, or rent?" | `paysOthers` | Whether WHT-issuing features surface |
| 6 | "How comfortable are you with tax & accounting?" (New / Basics / Experienced) | `guidanceMode` | Guided vs Fast |

### Output
On finish: persist the profile, set `onboardingCompletedAt`, apply defaults
(e.g. VAT off if not registered; WHT hidden if `paysOthers=no`), route to a
tailored dashboard with a "here's what to do first" card.

### Gate
Extend the existing company-setup redirect: if `onboardingCompletedAt` is null,
any `(app)` route → `/onboarding`. (Reuses the Phase-1 gate pattern.)

### Foreign-owner branch
A "Are you / your shareholders Thai nationals?" question routes foreign owners to
an **English-first** flavor with extra Thai-tax context (corporate tax, VAT, WHT,
work-permit-linked obligations, dividend WHT). The guidance glossary gains a
dedicated "Thai tax for foreign owners" section. Full treatment in
`specs/foreign-owner-context.md`. This is a distinct, underserved, high-value
persona (Group 4) — not an edge case.

---

## 4. Pillar B — adaptive guidance modes

Two modes, stored per user/company, chosen in onboarding, togglable anytime in
Settings, with an optional "you seem comfortable — turn guides off?" prompt.

| | **Guided** (default) | **Fast** |
|---|---|---|
| Explainers | Expanded inline under each field | Collapsed; hover/tap tooltip only |
| First-doc | Step-by-step walkthrough | Blank form, keyboard-first |
| Language | "Is your customer a company or a person?" | "Juristic / Individual" |
| Confirmations | Before anything with tax impact | Minimal |
| Glossary | Visible "what's this?" affordances | Hidden |

### Implementation
- `GuidanceModeProvider` (React context) reading the user setting.
- A reusable **`<Explainer term="vat">`** component: renders inline help in
  Guided, hover-tooltip in Fast. Pulls copy from the glossary.
- `src/lib/guidance/glossary.ts` — central TH/EN term store (see §5).
- Wire `<Explainer>` into existing forms (invoice VAT/WHT fields, customer
  juristic flag, WHT form income types, settings TIN/branch, etc.).

---

## 5. Pillar B content — the plain-language glossary (starter copy)

The actual explainer copy for every concept a beginner hits. **Draft — needs a
Thai accountant's review before ship.** Each term: short plain-language line
(TH + EN) + optional "learn more."

| Term | Plain-language explainer (EN draft; TH to mirror) |
|---|---|
| **VAT (ภาษีมูลค่าเพิ่ม)** | "A 7% tax on sales. You only charge it once your yearly sales pass ฿1.8M and you've registered. Under that? Leave it off — we've done that for you." |
| **WHT received (ถูกหัก ณ ที่จ่าย)** | "When a company pays you, they hold back a small % (usually 3%) and send it to the Revenue Department for you. It's **not lost** — you claim it back when you file. Keep the slip they give you." |
| **WHT issued (หัก ณ ที่จ่าย)** | "When *you* pay for certain things (services, rent), you must hold back a % and remit it. We'll prepare the certificate for the person you paid." |
| **Tax invoice vs receipt** | "A *tax invoice* (ใบกำกับภาษี) shows VAT and is for VAT-registered sellers. A *receipt* (ใบเสร็จ) just proves you got paid." |
| **TIN (เลขผู้เสียภาษี)** | "Your tax ID. If you're an individual, it's your national ID number. A company gets a 13-digit number when it registers." |
| **Branch code (รหัสสาขา)** | "00000 means head office. Almost every small business uses 00000." |
| **Quotation (ใบเสนอราคา)** | "A price offer you send *before* the work. Not a bill yet." |
| **Net payable (ยอดสุทธิ)** | "What the customer actually pays — after VAT is added and any withholding tax is taken out." |
| **Juristic vs individual** | "A registered company is a 'juristic person' (นิติบุคคล). A person is an 'individual' (บุคคลธรรมดา). It changes which tax forms apply." |
| **VAT threshold (฿1.8M)** | "Once your sales pass ฿1.8M in a year, you must register for VAT within 30 days. We'll warn you before you get there." |
| **PIT (ภ.ง.ด.90/91)** | "Personal income tax — what an individual files once a year. 91 is salary-only; 90 is everything else." |

---

## 6. Fear-removal patterns (cross-cutting)

The emotional core. These apply everywhere, not just onboarding:

- **Smart, safe defaults** — a beginner can't easily make a tax mistake: VAT off unless registered; WHT off unless relevant; today's date pre-filled; sensible due dates.
- **Confirm before consequence** — anything with a tax effect gets a plain-language "are you sure / here's what this means" step in Guided mode.
- **Proactive explainer cards** — e.g. *"You received a withholding-tax slip — here's what it means and what to do with it."*
- **Threshold nudges** — *"You're getting close to ฿1.8M in sales — you'll soon need to register for VAT. Want us to handle it?"* (also an upsell → service).
- **No dead-ends** — every confusing moment has a *"Not sure? Talk to us →"* path (→ the paid service).
- **Plain language always** — a technical term never appears without its `<Explainer>`.

---

## 7. Pillar C — industry tailoring mechanics

A config map keyed by `industry` controls what each user sees. Drawn from the
`STRATEGY.md` §5 industry playbooks.

```ts
// src/lib/guidance/industry-config.ts
type IndustryConfig = {
  primaryDocType: 'quotation' | 'invoice' | 'receipt';
  visibleDocTypes: DocType[];
  showWhtIssuing: boolean;     // do they pay others?
  showQuotation: boolean;
  defaultVat: 0 | 7;
  dashboardEmphasis: 'sales' | 'billing' | 'projects';
  onboardingHint: string;      // industry-specific reassurance
};
```

| Industry | Primary doc | Hides | Emphasis |
|---|---|---|---|
| Freelancer / creative | Quotation → Invoice | — | WHT-received tracking |
| Online seller | Receipt / Tax invoice | Quotation | Quick bulk entry |
| Food & café | **Receipt** | Quotation, WHT-issuing | Daily sales + expense capture |
| Retail / trading | Tax invoice | — | Buy/sell, margins |
| Professional services | Invoice | — | Correct WHT rate |
| Contractor / events | Quotation → progress Invoices | — | Deposits / progress billing |
| Salon / beauty | **Receipt** | Quotation, WHT | Walk-in simplicity |

The sidebar, the dashboard's "new document" default, and the empty-state copy
all read from this config.

---

## 8. Data model additions

Add to `users` (or `companies`, where the profile lives):
`industry`, `entityType`, `revenueBand`, `vatRegistered`, `paysOthers`,
`guidanceMode` ('guided'|'fast'), `onboardingCompletedAt` (timestamp).
Some overlap with existing company fields — reconcile, don't duplicate.

---

## 9. Reuse & build notes

- **Reuse:** the Phase-1 company-setup gate pattern (extend it for onboarding);
  existing shadcn form components; existing settings page (add the mode toggle +
  "edit business profile").
- **New:** onboarding wizard, `GuidanceModeProvider`, `<Explainer>`, glossary,
  `industry-config.ts`, proactive nudge cards, threshold-watch logic.
- **Touches:** every existing form (wire in `<Explainer>`), the dashboard
  (industry emphasis + nudge cards), middleware/layout (onboarding gate), i18n
  (all new copy in th + en, key-identical).

---

## 10. Scope / out of scope

**In:** onboarding interview, guidance modes, explainer system + glossary, smart
defaults, fear-removal patterns, industry tailoring, threshold nudges.

**Out:** the actual filing/bookkeeping (that's the paid service); receipt OCR
(Phase 6); the formation flow (Phase 11); the incorporation assessment (Phase 10,
though onboarding Q2 links to it).

---

## 11. Open questions

- **Glossary copy** — every explainer needs a Thai accountant's sign-off for
  accuracy and tone.
- **Industry list** — is the 7-segment list right for Dsign's actual market, or
  are there local segments to add/merge?
- **Nudge aggressiveness** — how often/insistent should threshold and "talk to
  us" prompts be before they annoy?
- **Mode detection** — purely self-selected, or also behavioral (auto-suggest
  Fast mode after N fluent sessions)?
- **Onboarding length** — 6 questions is the target; validate none cause drop-off;
  consider making 3–6 optional/progressive.

---

## Implementation deviations (recorded 2026-06-13)

Every place the build (branch `feat/phase-7-guidance-onboarding`) deviates
from this spec or the design handoff, with the reason. Owner-confirmed
decisions reference the implementation plan (D-numbers).

**Product decisions (owner-confirmed 2026-06-12):**
1. **Finish-screen assessment is drivers-first (D7).** The prototype scored
   revenue/profit bands into a verdict; the build derives the verdict ONLY
   from qualitative drivers. Tax-only / unsure answers get a neutral "let's
   run your numbers" state. netProfit is stored for Phase 10 prefill but
   never affects the verdict — Phase 10's `compareIncorporation()` can never
   contradict it. Scoring lives in `src/lib/guidance/incorporation-teaser.ts`
   for Phase 10 to absorb.
2. **Incorporation questions only for "thinking" users (D17).** The prototype
   forced them on every non-juristic user (10 screens for a salon owner).
   Individuals get one optional offer screen instead.
3. **Pricing behind an estimate watermark (D7b).** `PRICING_CONFIRMED=false`
   in `src/lib/guidance/pricing.ts` until the firm signs off its figures.
4. **One brand (D13):** the teal token swap intentionally re-themes the
   marketing site + login.
5. **revenueBand is yearly (D16)** — supersedes STRATEGY §10's "per month".

**Spec §4 items cut with reason:**
6. **First-doc step-by-step walkthrough** and **mode-dependent field labels**
   ("company or person?" vs "Juristic/Individual") were never designed in the
   prototype and are deferred. The explainers + confirm dialog + first-task
   card cover the intent; revisit after real-user feedback.
7. **guided2 ("know the basics")** collapses to `guided` (D4) — no third
   experience exists. Its option sub-copy was relabeled honestly ("same help,
   switch to Fast anytime"); the raw answer is kept in `onboardingAnswers`.

**Honesty-driven changes vs the prototype:**
8. **State-claim stripping (D5):** glossary copy never asserts the reading
   user's current configuration (4 rewrites documented in `glossary.ts`).
9. **Threshold nudge basis (D9):** trailing-12-month invoices + receipts (the
   prototype hardcoded ฿1,640,000; invoice-only would be blind for
   receipt-primary industries). Known double-count limitation (no
   invoice→receipt link) errs early, never late — CPA review item.
10. **WHT-received nudge** became an educational card with no fake figures
    and no "record the slip" CTA (no received-slip data model exists — that
    is Phase 6/9 scope).
11. **Server-side VAT block:** issuing a document charging VAT while
    `vatRegistered` is 'no' OR 'unsure' is rejected server-side
    (`vatNotRegistered`) — STRATEGY §8's "can't issue an invalid doc" made
    real; 'unsure' behaves like 'no' everywhere (safe default).
12. **"Main" badge follows `primaryDocType`** — fixes the prototype's
    `unshift(quo)` bug that badged Quotations for invoice-primary industries.
13. **Never-hide override:** doc types with existing documents (and the WHT
    item with existing certificates) stay in the nav regardless of industry.

**Mechanics that differ from the prototype:**
14. **Profile lives on `companies`** (spec §8 left it open); the row is
    created at onboarding Finish; `nameTh`/`tin`/`addressTh` are nullable
    with a separate legal-complete gate on document issuance (plan D1).
15. **Gate flip ships atomically** with the inference backfill (migration
    0002): existing users get `vatRegistered`/`paysOthers` inferred from
    real data, `guidanceMode='fast'`, and `onboardingCompletedAt=createdAt`.
16. **Locale flip on the foreign branch is URL-only** (matches the existing
    LocaleSwitcher; `users.locale` is not written — neither does the
    switcher).
17. **Glossary page is reachable mid-onboarding** (auth-only) so wizard
    explainer "Learn more" links don't bounce.
18. **Dashboard "projects" emphasis** maps to open-quotations count (no
    projects entity exists); "Collected today" became "Collected this month"
    (consistent month-window queries).
19. **Talk-to-us is a request form** (owner decision): persists a
    `lead_events` row (userId-keyed — wizard-stage requests predate the
    company row) with a callable contact value, then emails the firm
    (`TALK_TO_US_EMAIL`); `emailedAt` records send success; a daily digest
    endpoint (`/api/cron/leads-digest`, `CRON_SECRET`) catches anything
    unhandled until Phase 8.
20. **Switch-to-Fast suggestion** lives in Settings only, after ≥5 issued
    documents, dismissed forever on decline; the confirm dialog carries a
    one-line pointer instead of the planned N-consecutive-confirms valve.
21. **Presenter bar, demo toasts, fake notification bell** from the
    prototype were not ported (demo scaffolding). The notification/reminder
    system is deferred to Phase 8's deadline calendar.

**Pre-launch gates (unchanged from the plan):** CPA sign-off flips
`draft:false` per glossary term (badges env-gated via
`NEXT_PUBLIC_SHOW_DRAFT_BADGES`); firm sign-off flips `PRICING_CONFIRMED`;
foreign-owner figures (incl. the 180- vs 183-day residency discrepancy
between the glossary and `foreign-owner-context.md`) need specialist review;
the WHT auto-suggest heuristic and the threshold revenue basis are on the
same review list. LINE OA id + talk-to-us inbox + response-time promise
still needed from the owner (`src/lib/constants.ts`, `.env.example`).

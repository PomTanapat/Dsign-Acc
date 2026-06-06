# Phase 7 Spec — Guidance layer + industry onboarding

> **Status:** Spec / ready to build · **Priority:** highest of the unbuilt phases
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

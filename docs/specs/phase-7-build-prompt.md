# Phase 7 — build prompt + file list (for designer/developer)

> A ready-to-hand prompt to **develop Phase 7 (Guidance + Industry Onboarding)**
> with a designer or design-capable developer, plus the grounded file list.
> Spec: [`phase-7-guidance-onboarding.md`](phase-7-guidance-onboarding.md).

---

## Prerequisite — the build base

Phase 7 builds on Phases 0–5. Those landed as stacked feature branches; the
**`develop`** branch is the integration base that contains all of them **plus
these docs**. Branch Phase-7 work off `develop`.

---

## The prompt (paste into claude.ai / your coding agent)

```
You are a senior product designer-developer. Design AND build Phase 7 —
"Guidance + Industry Onboarding" — of the Dsign Accounting Workspace, a Next.js
15 Thai accounting web app. Goal: make the existing features usable and unscary
for a beginner who doesn't know what VAT or withholding tax is.

READ FIRST (the blueprint):
- docs/specs/phase-7-guidance-onboarding.md   ← your spec, follow it
- docs/STRATEGY.md  (§4 personas, §8 guidance, §10 onboarding, the honesty principle)
- docs/specs/foreign-owner-context.md          (the foreign-owner branch)
- docs/PRODUCT.md   (design-system direction + the existing screens)

CODEBASE: Next.js 15 App Router + TypeScript (strict) + Tailwind + shadcn/ui +
Drizzle ORM + Auth.js v5 + next-intl (th default, en toggle). Phases 0–5 are
already built (auth, company/customer/item CRUD, documents + Thai PDF, WHT, PIT,
dashboard). REUSE existing patterns — do not reinvent.

APPROACH — design first, then build:
1) DESIGN PASS: propose the visual/UX direction (tokens + key-screen mockups) for
   the onboarding wizard, the Guided-mode form experience with the <Explainer>,
   and the guidance toggle. 2 directions; get sign-off.
2) BUILD PASS: implement against the spec, committing per pillar.

DELIVER THE 3 PILLARS:
A. Onboarding interview — /[locale]/(app)/onboarding: a <3-min wizard (the 6
   questions in the spec), one-question-per-screen, progress bar, reassuring
   plain-language microcopy, skippable, resumable. Foreign-owner branch =
   English-first + extra Thai-tax context. On finish, persist the profile and
   apply defaults. EXTEND the existing company-setup gate in
   src/app/[locale]/(app)/layout.tsx so incomplete onboarding redirects here.
B. Adaptive guidance — a GuidanceModeProvider (Guided default / Fast); a reusable
   <Explainer term="..."> (inline help in Guided, hover-tooltip in Fast) reading
   from a central glossary (src/lib/guidance/glossary.ts) using the plain-language
   TH/EN copy in the spec. Wire <Explainer> into the VAT + WHT fields of the
   document and WHT forms, the customer "juristic" flag, and the settings
   TIN/branch fields.
C. Industry tailoring — src/lib/guidance/industry-config.ts mapping industry →
   which doc types/features surface; apply to the sidebar, dashboard emphasis,
   "new document" default, and empty-state copy.
PLUS fear-removal patterns: safe defaults, confirm-before-consequence, proactive
explainer cards, VAT-threshold nudge, and a "Not sure? Talk to us →" escape hatch.

PRINCIPLES (non-negotiable):
- Remove FEAR, not just clicks. Friendly-accountant tone, never a bare form.
- Every tax term appears WITH its <Explainer>. Plain language first, real term second.
- Thai-first layout (taller line-heights); English equally clean.
- Honest, never pushy — no dark patterns. The "talk to us" path is help, not a sell.
- Guided vs Fast modes. Foreign owner = English + Thai-tax context.

TECH CONSTRAINTS:
- Strict TS, no `any`. Reuse cn() and the existing src/components/ui/* shadcn
  components; add a shadcn `tooltip` for Fast-mode hover if missing.
- ALL user-facing strings via next-intl, in BOTH messages/th.json and en.json,
  identical key shapes.
- Persistence via server actions following src/app/actions/* (the ActionResult
  envelope, auth() gate, requireCompany()).
- Drizzle: add onboarding/guidance fields (industry, entityType, revenueBand,
  vatRegistered, paysOthers, guidanceMode, onboardingCompletedAt); generate a
  migration. Keep the solo-user model; don't break Phases 0–5.

QUALITY: the glossary copy is DRAFT — flag every term for Thai-accountant review.
Commit per pillar (A, then B, then C) and have it reviewed before moving on.
```

---

## Related file list

### 📖 Read for context (docs)
- `docs/specs/phase-7-guidance-onboarding.md` — the spec / blueprint
- `docs/STRATEGY.md`, `docs/specs/foreign-owner-context.md`, `docs/PRODUCT.md`, `docs/README.md`

### ♻️ Reuse (patterns & components — don't change)
- `src/lib/utils.ts` (`cn()`)
- `src/components/ui/*` — `button, input, label, card, dialog, select, checkbox, textarea, alert, dropdown-menu`
- `src/lib/queries/company.ts` — the `requireCompany()` gate pattern
- `src/app/actions/company.ts` — server-action + `ActionResult` pattern to mirror
- `src/i18n/routing.ts`, `src/i18n/request.ts`, `src/components/locale-switcher.tsx`

### ✏️ Modify
- `src/lib/db/schema.ts` — add onboarding/guidance fields
- `src/app/[locale]/(app)/layout.tsx` — extend the gate → onboarding redirect
- `messages/th.json` + `messages/en.json` — all new copy (identical keys)
- `src/app/[locale]/(app)/settings/page.tsx` + `src/components/forms/company-form.tsx` — guidance-mode toggle + edit business profile
- `src/components/forms/document-form.tsx` — wire `<Explainer>` into VAT/WHT fields
- `src/components/forms/wht-form.tsx` — explainers on income types
- `src/components/forms/customer-form.tsx`, `src/components/forms/item-form.tsx` — juristic / VAT-flag explainers
- `src/app/[locale]/(app)/dashboard/page.tsx` — nudge cards + industry emphasis
- `src/components/app/sidebar.tsx` — industry-tailored nav

### ✨ Create
- `src/app/[locale]/(app)/onboarding/page.tsx` + `src/components/onboarding/*` — the wizard
- `src/app/actions/onboarding.ts` — save profile (server action)
- `src/lib/validation/onboarding.ts` — Zod schema
- `src/lib/guidance/glossary.ts` — the TH/EN term store
- `src/lib/guidance/industry-config.ts` — per-industry config map
- `src/components/guidance/explainer.tsx` — the `<Explainer>` component
- `src/components/guidance/guidance-mode-provider.tsx` — Guided/Fast context
- `src/components/ui/tooltip.tsx` — shadcn tooltip (Fast-mode hover), if not added

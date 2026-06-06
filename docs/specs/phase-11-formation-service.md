# Phase 11 Spec — Company formation service

> **Status:** Spec / ready to build · **Depends on:** Phase 10 (assessment),
> Phase 8 (accountant back-office) · **Strategy ref:** `STRATEGY.md` §3A, Decision
> #5 (incorporation wedge), Decision #6 (two tracks).
>
> **One line:** When incorporating is genuinely best for someone, Dsign forms the
> company for them — cleanly, with the **full cost shown on day one** and **no
> hard sell** — then onboards them straight into the workspace and the ongoing
> service.

---

## 1. Guiding principle (read this first)

**We do not sell company formation. We advise honestly.**

- The assessment (Phase 10) decides if it's right — and it is **willing to say
  "no, stay an individual."** This service only proceeds when incorporating
  genuinely benefits the person.
- **Total cost is shown on day one** — one-time *and* recurring — before any
  commitment. No hidden fees, no "we'll discuss pricing later," no surprises
  after signing.
- The human confirmation step exists to make sure it's **right for them**, not
  to upsell.
- Honest and clear beats pushy. The trust earned here is what wins the lifetime
  service relationship (the real revenue).

> Every screen in this flow must pass one test: *would the customer feel we were
> straight with them, even if they walked away?*

---

## 2. Two tracks (Decision #6)

| | **Thai-national** | **Foreign-owned** |
|---|---|---|
| Volume | High | Lower, premium |
| Complexity | Standard DBD registration | BOI / Foreign Business License / work permits / ~฿2M-per-permit capital |
| Fulfillment | Mostly self-serve intake + human confirm | **Human specialist-led from the start**; law-firm partner where needed |
| Routing | Default | Triggered when the user indicates foreign shareholders/directors |

A single "Are you / your shareholders Thai nationals?" question routes the case.
Foreign cases skip self-serve and go straight to a specialist.

---

## 3. Entry points

| From | Context |
|---|---|
| **Phase 10 assessment** | "Incorporating fits you → let us handle it." Pre-fills what we know. |
| **Dashboard threshold nudge** | An existing solo user grew into the right zone. |
| **Direct / marketing** | A founder who already decided they want a company. |

---

## 4. The flow (with cost transparency)

```
1. Honest eligibility check  →  2. FULL COST shown (day one)  →  3. Intake
        │                              │                            │
   may say "not yet"          one-time + recurring, itemized    company + people + docs
        ▼                              ▼                            ▼
4. Human confirmation  →  5. Pay  →  6. Execute (Dsign does it)  →  7. Auto-onboard
   right for them?         transparent   DBD registration etc.       into workspace +
   (specialist if foreign)               with visible status         ongoing service begins
```

**Step 1 — Honest eligibility.** Pull the Phase-10 result (or a quick check). If
incorporating isn't clearly right, say so and stop — don't bill to bill.

**Step 2 — Full cost, day one.** Itemized and transparent *before commitment*
(see §5). Both the one-time cost *and* the recurring annual cost of being a
company. "Here's the complete picture, including every year after."

**Step 3 — Intake (digital).**
- Company: 3 name choices (for DBD reservation), business objectives/activities, registered address, registered capital.
- People: shareholders (min **2** since 2023), directors, shareholding %.
- Documents: IDs, house registration, address proof, consent forms.
- Foreign track also: nationalities/passports, BOI/FBL intent, work-permit needs.

**Step 4 — Human confirmation.** A Dsign person (specialist for foreign) reviews,
discusses, confirms it's correct *and* right for them. Trust + error-catching.

**Step 5 — Pay.** Exactly the costs already shown — service fee + pass-through
government fees, clearly separated.

**Step 6 — Execute.** Dsign performs: name reservation → MOA (หนังสือบริคณห์สนธิ)
→ DBD registration → VAT registration (if needed) → corporate income-tax
registration → social security (if staff) → assign CPD (bookkeeper) + CPA
(auditor). **Visible status tracker** throughout (§6).

**Step 7 — Auto-onboard.** The new company is provisioned in the workspace →
starts issuing documents → bookkeeping (the paid service) begins. *They never
touch another firm.*

---

## 5. Cost transparency — what we show on day one

Itemized, with **who gets the money** made explicit (government pass-through vs
Dsign service). Figures are placeholders — set real ranges with the team.

**One-time (to register):**
| Item | Type |
|---|---|
| DBD registration fee | Government (pass-through) |
| Name reservation | Government (pass-through) |
| Stamp duty / company seal / misc | Government / vendor |
| VAT registration (if applicable) | Government (pass-through) |
| **Dsign formation service fee** | **Dsign** |

**Recurring (every year, the part most firms hide):**
| Item | Type |
|---|---|
| Bookkeeping (mandatory CPD) | Dsign service |
| **Annual audit (mandatory CPA)** | Dsign service |
| Tax filings — monthly VAT (ภ.พ.30), WHT, half-year ภ.ง.ด.51, annual ภ.ง.ด.50 | Dsign service |
| DBD annual financial-statement submission | Dsign service |
| Payroll & social security (if staff) | Dsign service |

**Headline summary shown:** *"First-year total: ฿___. Ongoing every year: ฿___."*
Plus a plain-language line: *"A company must keep books and be audited every
year — that's the ฿___ ongoing. If that's not worth it for you yet, we'll tell
you."*

---

## 6. Status tracking (transparency during the wait)

Formation takes days–weeks, so show progress honestly:
`Submitted → Name reserved → Documents prepared → Registered with DBD → VAT
registered → Complete`. Each step timestamped, with what's next and what (if
anything) we need from them.

---

## 7. Auto-onboard → the ongoing service (the actual business)

The handoff *is* the point. On "Complete":
- The company profile is provisioned in the workspace (TIN, branch, address —
  the data we already collected).
- The user lands on a "your company is ready" screen → Phase-7 onboarding for
  the company context.
- The recurring service (bookkeeping/filing) is now active — the formation fee
  was the front door; this is the house.

---

## 8. Data model

A new `formation_cases` table (distinct from `companies`, which is the *result*):
`id`, `userId`, `track` ('thai'|'foreign'), `status`, `intake` (jsonb: names,
objectives, capital, shareholders, directors), `documents` (uploaded refs),
`quotedCostOneTime`, `quotedCostRecurring`, `assignedStaffId`, `resultingCompanyId`
(FK once created), timestamps. Foreign cases carry extra intake fields.

---

## 9. Build notes & scope

- **Heavy operational/workflow component** — this is not just UI; it's a
  human-in-the-loop case pipeline. The software is: self-serve intake + document
  upload + the day-one cost calculator + status tracker + a back-office case
  queue (overlaps Phase 8).
- **Foreign track** likely means a **law-firm/partner integration** — that's a
  business process, not just code; scope the partnership separately.
- **DBD filing** — confirm how much can be digital/API vs manual paperwork.
- **Reuse:** Phase 10 (assessment → entry), Phase 8 (back-office case management),
  Phase 7 (post-formation onboarding), existing company provisioning.

---

## 10. Honesty guardrails (the principle, made concrete)

- The flow can **end at Step 1** with "don't incorporate yet" — and that's a
  success, not a failure. Track it; follow up when their situation changes.
- **No dark patterns:** no fake urgency, no "limited time," no pre-ticked
  upsells, no burying the recurring cost.
- Every cost line has a plain-language "what is this and who gets it."
- The recurring cost is shown with **equal prominence** to the one-time cost.
- A clear "talk to a human before you decide" option at every step.

---

## 11. Open questions

- **Pricing** — the Dsign formation service fee; bundled vs itemized; does it
  include the first year of bookkeeping?
- **Foreign track fulfillment** — in-house vs law-firm partner; which structures
  (BOI categories, FBL) we take on; specialist staffing.
- **DBD mechanics** — digital submission availability; realistic timelines/SLA.
- **Refund / failure handling** — if a name is rejected or registration fails,
  what's refunded?
- **Realistic cost ranges** — set the placeholder figures in §5 with the team so
  the day-one quote is accurate.
- **Lead-but-not-yet** — how/when to follow up with people who (honestly) weren't
  ready, without being pushy.

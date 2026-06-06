# Dsign Accounting Workspace — Product Strategy & North Star

> **Companion to `PRODUCT.md`.** That doc describes *what is built* and the design
> surface. **This doc describes *why*, *for whom*, *the business model*, and
> *what we still need to build* to make the strategy real.**
>
> **Last updated:** 2026-05-30 · **Status:** Strategy locked (4 key decisions made — see §11)

---

## 1. Vision & thesis

**The webapp is a wedge, not the product.** The product is Dsign's accounting
*service*. The app exists to (a) acquire scared beginners by being radically
easier than the incumbents, and (b) quietly capture their business activity as
clean data so Dsign's accountants can keep their books — and know exactly when
to sell the next thing.

> **Front / Back split — the core mental model:**
> **The platform owns the FRONT** — *issue documents + understand my business.*
> **The firm owns the BACK** — *file, keep books, advise.*
> **The front feeds the back.** Every document a user creates is simultaneously
> a bookkeeping entry the firm harvests with no re-entry.

### Who we serve
Solo entrepreneurs and business starters — people just beginning, who **don't
need much accounting yet and are afraid of the parts they don't understand**
(VAT? WHT? pricing? "why is my payment short by 3%?"). We make the basics
effortless and demystified. As they grow, we sell deeper: bookkeeping, filing,
consulting, problem-solving — and *that* relationship is where trust and revenue
compound.

---

## 2. Positioning — the front door, not the cockpit

| | PEAK / FlowAccount | **Dsign Workspace** |
|---|---|---|
| What it is | Full accounting system (double-entry, chart of accounts) | Guided front-door for issuing documents |
| Built for | Someone who already has a bookkeeper | Someone who has never done accounting |
| Emotional effect | "A cockpit with 200 switches" → fear | "It just told me what to do" → relief |
| The hard part | Learning the software | Nothing — defaults + plain language |
| Where accounting happens | In the app (user does it) | Behind the scenes (Dsign does it from the data) |

> **The barrier we're removing is fear, not price.** A beginner doesn't avoid
> PEAK because it costs money — they avoid it because they're terrified of
> pressing the wrong button and getting fined. We win by making it *impossible
> to press a wrong button*, and by explaining every tax concept in the moment
> it appears.

**One-line positioning:** *"The easiest way for a Thai solo business to send a
quote, bill a client, and never get in trouble with the Revenue Department —
with real accountants one tap away when you grow."*

---

## 3. Business model — free tool, paid service

**Decision: the document tool is free; we monetize the service.** (See §11.)

```
FREE (acquisition + data capture)          PAID (the business)
─────────────────────────────────         ───────────────────────────
• Issue quotes/invoices/receipts/WHT       • Monthly bookkeeping
• Understand WHT slips received            • VAT & WHT filing (ภ.พ.30, ภ.ง.ด.3/53)
• Capture expenses (snap receipts)         • Annual statements / audit / ภ.ง.ด.50/51
• Money-in / money-out view                • Payroll & social security
• VAT-threshold watch                      • Company / VAT registration
• Personal income tax estimate             • Tax planning & consulting
                                           • Revenue Dept audit support
```

**The funnel:** free tool → clean data + threshold/life-event signals → timed,
relevant upsell → paid service → trust → higher packages & consulting.

**Upsell triggers** (the data tells us when to sell):
- Approaching ฿1.8M annual revenue → *"You'll need to register for VAT soon — want us to handle it?"*
- First time paying staff/freelancers → payroll + WHT service
- Registering a company → registration service
- Year-end approaching → filing service
- Activity gets complex (many docs, mixed VAT, contested WHT) → bookkeeping + consulting

---

## 3A. The incorporation wedge — catch founders before formation

**The highest-leverage acquisition moment isn't when someone is already
operating — it's the moment they decide to open a company.** In Thailand,
forming a บริษัทจำกัด legally requires a CPD/accountant relationship plus a
bureaucratic DBD (Department of Business Development) process. Whoever walks a
founder through that almost always becomes their bookkeeper, auditor, and
advisor — for years.

> **The chokepoint insight:** Company formation is where the lifetime
> relationship is decided. If we are not the easy, trustworthy option at "I want
> to open a company," the founder gets locked to whichever firm or lawyer
> registers them — and we've lost a client we never even met. *"If we do it
> later, the customer is already stuck with another accounting firm."*

### One funnel, two entry points, one bridge
- **Entry A — already operating** (freelancer, seller, café): free guided tool → grows → upsell.
- **Entry B — founder-to-be** *(new, higher value)*: high intent, no firm yet → formation service → **company client from day zero**.
- **The bridge — a "Should I incorporate?" comparison tool**: turns a grown
  Entry-A user into Entry B at the right moment, *and* works as standalone
  top-of-funnel lead-gen. It extends the already-built PIT estimator.

### The productized formation service
1. **Educate & qualify** — "Sole proprietor vs company" benefits/comparison + the calculator. Qualifies the lead while helping them.
2. **Intake** — clean digital form (name choices, objectives, shareholders, capital, address) + document upload.
3. **Confirm** — a Dsign person reviews and discusses to confirm everything. Trust + error-catching.
4. **Pay** — service fee + government fees, transparently.
5. **Execute** — Dsign does the DBD registration, VAT registration if needed, assigns CPD/CPA.
6. **Auto-onboard** — the new company drops straight into the workspace → issues documents → bookkeeping begins. *They never touch another firm.*

### Why a company client is worth 5–10× a solo user
A registered company must (by law) do far more than an individual — every line
is recurring Dsign revenue: monthly VAT (ภ.พ.30), WHT remittance (ภ.ง.ด.3/53),
**mandatory bookkeeping (CPD)**, **mandatory annual audit (CPA)**, corporate
income tax (ภ.ง.ด.51 half-year + ภ.ง.ด.50 annual), DBD financial statements,
payroll & social security.

> The comparison tool can be honest *and* self-serving: *"As a company you'd
> save ฿X in tax but it costs ฿Y in compliance — net ฿Z."* Dsign is the ฿Y.
> (Since 2023 a private company needs only **2 shareholders** — a lower barrier
> worth highlighting.)

> **Tax framing for the comparison tool** (verify with the team each year):
> personal income tax is progressive up to 35%; SME corporate tax is 0% on the
> first ฿300k net profit, 15% to ฿3M, 20% above. There's a crossover income
> where incorporating wins on tax — that crossover is the tool's punchline and
> the formation-service trigger.

---

## 4. User groups (3 actors)

| Group | Who | Mindset | Needs |
|---|---|---|---|
| **1. Solo — No-knowledge** *(primary)* | Beginner; never studied tax | **Afraid** — "I don't want to get fined" | Guidance, plain language, safety, proactive nudges |
| **2. Solo/Admin — Confident** *(secondary)* | Knows basics, or admin for an owner | **Impatient** — "just let me issue it" | Speed, density, keyboard, no hand-holding |
| **3. Dsign accountant — back office** *(the engine)* | Internal team consuming client data | **Buried in manual entry & doc-chasing** | Clean structured data, deadline visibility, upsell signals |

Groups 1 and 3 are **two ends of one pipe**: a plain-language invoice issued by
Group 1 arrives as a categorized transaction for Group 3, with zero re-keying.

*(Decision: "accountant" = Dsign's internal team only. Not external multi-client
firms in v1. Data model should leave room to add that later — see §11–12.)*

---

## 5. Industry playbooks

**Decision: tailor the app per industry** (see §11) — a café and a contractor
should see different, smaller, relevant apps. Each playbook below drives that
tailoring: which documents surface, what defaults apply, where to focus
guidance, and what upsell to watch for.

### A. Freelancer — creative & digital (designer, dev, content, photo)
- **Journey:** inquiry → quotation → work → invoice → client deducts **3% WHT** → paid net → receipt → year-end **ภ.ง.ด.90/91**
- **Top fears:** "What's a quotation?" · **"Why is my money short by 3%?"** (the #1 moment) · "Do I charge VAT?" (no, under ฿1.8M) · "What do I do with this WHT slip I received?"
- **Doc set:** Quotation + Invoice + Receipt; *receives* WHT (explain + track)
- **Guidance focus:** demystify WHT-received; reassure on the VAT threshold
- **Upsell signal:** revenue climbing toward ฿1.8M; year-end PIT filing

### B. Online seller (Shopee / Lazada / TikTok / FB live)
- **Journey:** list → sell (high volume, small amounts) → buyer sometimes wants a tax invoice → restock from suppliers
- **Top fears:** "A company buyer wants a full ใบกำกับภาษี — how?" · recording every tiny sale · "Revenue Dept can see my transfers — am I in trouble?" · personal/business money mixed
- **Doc set:** Receipt + Tax Invoice (on demand); bulk/quick entry
- **Guidance focus:** when a tax invoice is actually required; separating business money
- **Upsell signal:** volume → bookkeeping; threshold → VAT registration

### C. Food & café / home kitchen (cash-heavy)
- **Journey:** daily cash/QR sales → buy ingredients → mostly receipts
- **Top fears:** "Catering client wants a real receipt" · no daily sales record · supplier bills unsorted
- **Doc set:** **Receipt-first**; rarely quotes/WHT — *simplest onboarding*
- **Guidance focus:** daily takings log; expense capture from supplier slips
- **Upsell signal:** wants to know real profit → bookkeeping

### D. Professional services (clinic, tutor, agency, consultant)
- **Journey:** service → invoice → **WHT 3% (rent 5%)** → receipt → filing
- **Top fears:** "Which WHT rate?" · bigger invoices = bigger fear · clients need official receipts
- **Doc set:** Invoice + Receipt + WHT; higher-value
- **Guidance focus:** correct WHT rate by income type; official receipt formatting
- **Upsell signal:** complexity + value → bookkeeping + advisory

### E. Contractor / installation / events
- **Journey:** site visit → quote → **deposit invoice → progress invoices** → 3% WHT → final → receipt
- **Top fears:** "How do I bill 30% now, 70% later?" · retention · materials vs labor
- **Doc set:** Quotation + (progress) Invoices + Receipt + WHT
- **Guidance focus:** deposit/progress billing; contract-level WHT
- **Upsell signal:** project scale → bookkeeping + tax planning

### F. Salon / beauty / wellness (walk-in, cash)
- Simplest variant of C — receipt-first, almost never quotes/WHT. The **"easiest
  possible path" benchmark**: if a salon owner can't onboard in 3 minutes, the
  flow is too hard.

---

## 6. The accountant (back-office) — what the internal team gets

Cross-industry, process-based pains — every one solved by the client using the
front-end:

| Accountant pain today | Fixed by |
|---|---|
| Chasing clients for documents monthly | Docs already in the system at issue time |
| Re-keying invoices/receipts into software | Structured data flows through — no re-entry |
| Illegible photos, missing slips | Captured + nudged at the moment of issue |
| Not knowing a client crossed VAT threshold | Platform watches and flags it |
| Month-end deadline scramble | Continuous activity, not a month-end dump |

**Back-office view (to build — §12):** an internal dashboard across all client
companies showing activity, completeness, threshold flags, and upsell signals,
plus a clean export/feed into the firm's bookkeeping process.

---

## 7. Scope — platform vs human

**Rule:** the platform handles what's *basic and common across all industries*;
humans handle what's *complex, filing-regulated, or contested* — and that
boundary is the upsell.

| Task | Platform | Dsign firm |
|---|:---:|:---:|
| Issue quotation / invoice / tax invoice / receipt | ✅ | |
| Issue WHT certificate (when they pay someone) | ✅ | |
| Understand a WHT slip they received | ✅ | |
| Income, who-paid, outstanding | ✅ | |
| Capture & categorize expenses | ✅ | |
| VAT-threshold watch + plain alerts | ✅ | |
| Personal income tax *estimate* | ✅ | |
| Monthly VAT filing (ภ.พ.30) | | ✅ |
| WHT remittance filing (ภ.ง.ด.3/53) | | ✅ |
| Bookkeeping / double-entry | | ✅ *(from captured data)* |
| Annual statements, audit, ภ.ง.ด.50/51 | | ✅ |
| Payroll & social security | | ✅ |
| Company / VAT registration | | ✅ |
| Tax planning, advisory, audits | | ✅ *(consulting)* |

---

## 8. Adaptive guidance — novice vs professional

The same screen serves both via a mode:

| | **Guided** (No-knowledge) | **Fast** (Confident) |
|---|---|---|
| Tax fields | Inline explainer: *"VAT 7% — only if yearly sales pass ฿1.8M. You're under, so it's off ✓"* | Raw field, default applied, hover tooltip only |
| First doc | Step-by-step walkthrough | Blank form, keyboard-first |
| Language | "Is your customer a company or a person?" | "Juristic / Individual" |
| Safety | Confirms anything with tax impact; can't issue an invalid doc | Trusts the user |
| WHT slip received | Proactive explainer card | Just logged |
| Glossary / "what's this?" | One tap away | Hidden |

**Mode selection:** asked once in onboarding (*"New to this / I know my way
around"*), a settings toggle, and an optional offer to dial guidance down for
users who breeze through. **Default = Guided** — the beginner is who we can't
afford to lose.

---

## 9. The bookkeeping bridge

The "we know what the customer does, so we can do their books" loop —
**with expense capture confirmed in scope** (see §11):

```
Client issues docs + snaps supplier receipts (easy, guided)
        │  every doc = categorized income;  every receipt = categorized expense
        ▼
Platform builds a live picture of the business
   • income (invoices / receipts)
   • expenses (snapped supplier receipts)
   • simple "money in / money out" this month
        │
        ├──►  Client sees plain-language financial health (demystified → trust)
        │
        └──►  Dsign accountant gets clean, complete data → books with ~no re-entry
                 │
                 ▼
        Threshold & life-event triggers → perfectly-timed, relevant upsell
```

The platform's real output isn't PDFs — it's **a continuously-clean dataset +
a stream of well-timed upsell signals.**

---

## 10. Industry-tailored onboarding

Onboarding is an interview that *gets* the user and quietly configures the app:

| We ask | It tailors |
|---|---|
| What's your business? (industry) | Which doc types surface first (café → receipt-first; contractor → quote-first) |
| Just you, or a registered company? | Individual vs juristic defaults; which taxes apply |
| Roughly how much per month? | VAT-threshold proximity; guidance depth |
| VAT-registered? | Whether VAT appears at all |
| Do you pay other people? | Whether WHT-issuing features surface |
| New to tax, or comfortable? | Guided vs Fast mode |

A freelancer and a café owner end up with **different, smaller, relevant apps** —
not the same intimidating everything.

---

## 11. Locked decisions (2026-05-30)

| # | Decision | Choice | Implication |
|---|---|---|---|
| 1 | "Thai accountant" scope | **Internal Dsign team only** | Build a back-office view; keep solo end-user model; design data model so external multi-client is *possible* later |
| 2 | Expense capture | **Yes — lightweight (snap receipts)** | Makes the bookkeeping bridge real; new build scope (§12) |
| 3 | Free / paid line | **Free tool, paid service** | Maximize acquisition; revenue from bookkeeping/filing/consulting |
| 4 | Industry tailoring | **Tailor per industry** | Onboarding interview + feature gating per segment |
| 5 | Incorporation wedge | **Adopted — formation as top-of-funnel** | New entry point B + bridge tool + productized formation service (§3A) |
| 6 | Foreigner-owned formation | **PENDING** (see §13) | Thai-national only is far simpler; foreign-owned (BOI/FBL/work permits) is higher value but much more complex |

---

## 12. What this means for the build (gap analysis)

**Already built (Phases 0–5):** auth, company/customer/item data, issue
quotation/invoice/receipt + Thai PDF, WHT certificates, PIT estimator, email,
basic firm-side dashboard stats. *This is the document-issuance FRONT.*

**The strategy adds new scope beyond what's built:**

| Proposed phase | Scope | Serves |
|---|---|---|
| **Phase 6 — Expense capture** | Snap/upload supplier receipts; categorize; "money in / money out" view; (OCR later) | Decision #2; the bookkeeping bridge |
| **Phase 7 — Adaptive guidance + industry onboarding** | Guided vs Fast modes; inline plain-language explainers on every tax field; glossary; onboarding interview that gates features per industry | Decisions #4; Group 1 vs 2; the "fear" barrier |
| **Phase 8 — Accountant back-office + triggers** | Internal cross-client activity view; data completeness flags; VAT-threshold watch; life-event upsell triggers; "request this service" handoff | Decisions #1, #3; the monetization engine |
| **Phase 9 — Plain-language money health** | Demystified financial summary for the user (not accounting jargon); "what you owe / what's coming back" | Trust; Group 1 |
| **Phase 10 — "Should I incorporate?" comparison tool** | Individual-vs-company tax + compliance-cost comparison; the bridge from Entry A → B. Extends the built PIT estimator (cheap to build). | Decision #5; funnel bridge |
| **Phase 11 — Formation service** | Productized intake (name/shareholders/capital/docs) → human confirm → pay → DBD execution → auto-onboard. Operational + workflow build. | Decision #5; Entry B; the chokepoint |

> **Sequencing logic:** Phase 7 (guidance + onboarding) is still the highest
> priority — it makes the *current* features usable by a scared beginner at all.
> Phase 6 (expenses) makes the *service* sellable. **Phase 10 (the comparison
> tool) is a cheap, high-leverage early win** — it extends the built PIT
> estimator and opens the incorporation funnel without the full service build.
> Phase 11 (formation service) is the bigger operational lift that captures
> Entry B. A reasonable order is **7 → 10 → 6 → 8 → 11 → 9**.

---

## 13. Open questions / next

- **Pricing of the paid service** — tiers, per-month bookkeeping fee bands by
  document volume? (Drives the upsell UI.)
- **The handoff moment** — when a user hits an upsell trigger, is it self-serve
  (subscribe in-app) or human (a Dsign person reaches out)? Probably human first
  for trust, self-serve later.
- **Expense capture depth** — manual entry first, OCR later? What categories?
- **How "Thai-Revenue-real" must the captured data be** to feed bookkeeping
  without rework — confirm the data shape with the accounting team.
- **Verify the tax specifics each season** — VAT threshold, WHT rates, PIT
  brackets, deduction caps against the current year's forms.
- **Foreigner-owned formation scope** — Thai-national companies only (simple),
  or also foreign-owned (BOI, Foreign Business License, work permits — higher
  value, much more complex, competes with law firms)?
- **Formation service pricing & fulfillment** — flat service fee + pass-through
  government fees? How much is self-serve intake vs human-handled? Who does the
  DBD filing operationally?
- **Comparison-tool honesty guardrails** — it gives tax guidance; needs a clear
  "estimate, not advice — confirm with us" disclaimer like the PIT estimator.

---

*Strategy is locked on the four key forks. The build so far is the front-end of
the front; Phases 6–9 above are what turn it into the wedge-and-service engine
this strategy describes.*

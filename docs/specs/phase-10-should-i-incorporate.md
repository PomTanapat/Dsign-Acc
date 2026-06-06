# Phase 10 Spec — "Should I incorporate?" comparison tool

> **Status:** Spec / ready to build · **Depends on:** the built PIT bracket engine
> (`src/lib/tax/pit-brackets.ts`) · **Strategy ref:** `STRATEGY.md` §3A, Decision #5
>
> **One line:** A plain-Thai *assessment* that tells a solo entrepreneur whether
> becoming a company makes sense **for their situation** — across tax, partners,
> credibility, and financing — and turns a "yes" into a formation-service lead.
>
> **Important reframe:** this is **not** a tax calculator. Tax is only one of
> four reasons people incorporate (see §1A) and often not the deciding one. The
> tool is a multi-driver *fit assessment*; the tax math is one module inside it.

---

## 1. Why this exists (role in the funnel)

This is **the bridge** between Entry A (solo users on the free tool) and Entry B
(formation-service clients). Its jobs, in order of importance:

1. **Convert** — when incorporating clearly wins, drive the user to *"Let us open
   your company for you →"*.
2. **Educate** — demystify the individual-vs-company decision for someone who has
   no idea what corporate tax is.
3. **Qualify** — capture the inputs (income level, intent) so Dsign knows this is
   a warm lead and roughly how valuable.

> **Design principle: directional, not a CPA.** This tool must be *honest and
> roughly right*, not precisely optimal. Real incorporation tax planning is
> complex (salary/dividend mix, deductions, BOI, etc.). The tool's purpose is to
> reveal *whether there's likely a benefit* and start a conversation — **every
> result ends with "confirm with us."** Over-engineering the math is a trap.

---

## 1A. The six reasons to incorporate (the diagnostic core)

From real experience, founders incorporate for six reasons — and **tax is rarely
the trigger.** The tool opens with a short diagnostic that detects which driver(s)
apply, then tailors the result. Lead with the protection & credibility drivers.

| Group | Driver | Diagnostic question | If yes → |
|---|---|---|---|
| 🛡 | **Limited liability** | "Does your business take on contracts, debts, or risks where you'd want to protect your personal assets?" | Explain separate legal person / asset protection; strong signal |
| 🛡 | **Asset management** | "Do you want to hold or pass on assets (property, investments) through a business?" | Explain holding/succession via shares; strong signal |
| 📈 | **B2B credibility** | "Are your clients companies or government? Lost work for not being a company?" | Explain vendor/contract credibility; emotional signal |
| 📈 | **Financing / growth** | "Want a loan, investors, or to expand soon?" | Explain audited statements → credit; highest-value lead |
| 🤝 | **Partners** | "Do you have / are you bringing on business partners?" | Explain shareholding/dividends/liability; strong signal |
| 🧮 | **Tax** | "Roughly how much profit per year?" | Run the tax module (§4); show ฿ saving |

**Output logic:**
- Any **qualitative driver** = yes → "Incorporating likely makes sense for you
  because [drivers], regardless of the tax math." (qualitative-first)
- The **tax module** shows the ฿ number as supporting evidence, **not** the gate.
- Combine into one tailored recommendation + CTA.

> A tax-only tool would tell a liability- or credibility-driven founder "not
> worth it, you'd only save ฿8k" and lose a hot lead. The diagnostic prevents
> that — the tax number never blocks a recommendation the *other* five drivers
> justify.

---

---

## 2. Users & entry points

| Entry point | Context | Mode default |
|---|---|---|
| Sidebar / Tools nav | A curious user explores | Simple |
| **Trigger from dashboard** | User's tracked income crosses a threshold → "You might save money as a company — check now" | Simple |
| Public marketing page | Top-of-funnel lead-gen (no login) | Simple |
| Inside PIT estimator | "Wondering if a company is better? Compare →" | Simple |

The trigger from the dashboard (once income data exists, post-Phase 6/8) is the
highest-intent entry — it fires at the exact moment incorporation starts to pay off.

---

## 3. Inputs

Keep it short. Beginners abandon long forms.

**Step 1 — Driver diagnostic (4 quick yes/no + 1 number)** — the §1A questions:
partners? client type / lost deals? loan or expansion? + profit. This decides
the recommendation *and* which tax inputs to ask for.

**Step 2 — Tax inputs (only the profit-relevant ones):**
| Field | Notes |
|---|---|
| Annual revenue (รายได้ต่อปี) | Pre-fill from tracked data if available |
| Annual business expenses (ค่าใช้จ่ายต่อปี) | Real deductible costs → gives true profit |
| How much you take out to live on / year | Drives the salary assumption; default = the whole profit |

**Detailed mode (optional, for confident users / advisors):**
- Owner salary vs dividend split (override)
- Personal allowances (reuse the PIT estimator's deduction set)
- Estimated annual compliance cost (default provided)
- Is this an SME? (paid-up capital ≤ ฿5M and revenue ≤ ฿30M) → SME corporate rates

---

## 4. Calculation model

> ⚠️ **All rates flagged for annual verification** against the current Revenue
> Department schedule. Encode them as named constants with a `// TODO: verify`
> comment, exactly like the existing PIT engine.

### Reference rates (as of 2024, verify yearly)
**Personal income tax (progressive)** — reuse `calculatePIT()` from
`src/lib/tax/pit-brackets.ts` (0/5/10/15/20/25/30/35% bands).

**Corporate income tax — SME** (paid-up capital ≤ ฿5M AND revenue ≤ ฿30M):
| Net profit | Rate |
|---|---|
| 0 – 300,000 | 0% |
| 300,001 – 3,000,000 | 15% |
| 3,000,000+ | 20% |
Non-SME: flat 20%.

**Dividend:** 10% withholding tax on distribution to an individual.

### The two scenarios (same revenue R, same expenses E → profit P = R − E)

**Scenario 1 — Stay individual:**
```
taxableIndividual = max(0, P − personalAllowances)
taxIndividual     = calculatePIT(taxableIndividual)
```
> Note: a real trading business deducts **actual expenses** (no 50%/100k cap) —
> so this tool computes profit from real expenses, NOT the salary-style 50%
> deduction the PIT estimator uses for 40(1)/40(2) income. Reuse only the
> *bracket* function, not that deduction assumption.

**Scenario 2 — Operate as a company** (salary + dividend model):
```
salary            = min(takeHome, P)                       // owner's salary (default = P)
companyProfit     = P − salary
taxCorporate      = citSME(companyProfit)
salaryDeduction   = min(salary * 0.5, 100_000)             // 40(1) deduction
taxOnSalary       = calculatePIT(max(0, salary − salaryDeduction − personalAllowances))
dividend          = max(0, companyProfit − taxCorporate)   // if distributed
taxDividend       = dividend * 0.10                        // 10% WHT (final-tax option)
taxCompany        = taxCorporate + taxOnSalary + taxDividend
complianceCost    = annualComplianceEstimate               // default ฿30,000 (configurable)
companyTotalCost  = taxCompany + complianceCost
```

**Result:**
```
netBenefit = taxIndividual − companyTotalCost
```
- `netBenefit > 0` → incorporating likely saves money (by ฿netBenefit/yr).
- `netBenefit ≤ 0` → staying individual is likely cheaper *for now*.

> **The compliance cost is the honest twist** — and it's literally Dsign's
> revenue. Show it as a line, don't hide it. "A company saves ฿X in tax but
> costs ฿Y in bookkeeping/audit/filing — net ฿Z. (We handle the ฿Y.)"

### Pure-function shape (mirror the existing tax engine)
```ts
// src/lib/tax/incorporation-compare.ts
export function compareIncorporation(input: IncorporationInput): IncorporationResult
// returns { individual: {...}, company: {...}, netBenefit, recommendation, assumptions[] }
```
Add `incorporation-compare.test.ts` (Vitest-shaped, like the PIT tests):
cover a low earner (individual wins), a mid earner near the crossover, and a
high earner (company wins), plus the dividend-vs-salary edge.

---

## 5. Results UI

**Lead with the drivers, then the math.** First a "why this fits you" summary of
the qualitative drivers that applied (partners / credibility / financing), each
with a one-line plain-language reason. *Then* the tax side-by-side as the hard
number underneath.

```
✓ ทำไมการเป็นบริษัทเหมาะกับคุณ / Why incorporating fits you
  • คุณมีหุ้นส่วน — บริษัทช่วยแบ่งหุ้น/ปันผล/ความรับผิดอย่างชัดเจน
  • ลูกค้าของคุณเป็นบริษัท — เพิ่มความน่าเชื่อถือ ไม่เสียดีลอีกต่อไป
  • และด้านภาษี: (see below)
```

Then the tax module — a side-by-side a scared beginner can read at a glance:

```
┌──────────────────────────┐   ┌──────────────────────────┐
│  บุคคลธรรมดา (You now)     │   │  บริษัท (As a company)     │
│  ภาษีต่อปี      ฿XXX,XXX   │   │  ภาษีบริษัท     ฿XX,XXX    │
│                          │   │  ภาษีเงินเดือน   ฿XX,XXX    │
│                          │   │  ภาษีปันผล       ฿X,XXX    │
│                          │   │  ค่าทำบัญชี/สอบบัญชี ฿XX,XXX │
│  รวม           ฿XXX,XXX   │   │  รวม            ฿XXX,XXX   │
└──────────────────────────┘   └──────────────────────────┘

        💡 การเป็นบริษัทจะ [ประหยัด/แพงกว่า] ประมาณ ฿ZZ,ZZZ ต่อปี
           (savings shown green, extra cost shown rose)

        [ what each line means — expandable plain-language ]
```

- **One headline number**: save / cost ฿Z per year. Color-coded (emerald/rose).
- **Each line expandable** with a plain-language "what is this?" (corporate tax,
  dividend tax, why a company needs an audit).
- **A simple "crossover" hint**: "Companies usually start to win when your yearly
  profit is around ฿___." (computed, directional.)
- **Assumptions panel** (collapsed): salary assumption, compliance estimate,
  SME status — so a savvy user can see what drove it.

---

## 6. The conversion CTA (the whole point)

After the result, always:

- **If company wins:** prominent → *"ให้เราเปิดบริษัทให้คุณ / Let us open your
  company for you"* → routes to the **formation service** (Phase 11). Pre-fill
  what we already know (revenue, intent).
- **If individual wins:** softer → *"ยังไม่คุ้มตอนนี้ — เราจะเตือนคุณเมื่อถึงจุดคุ้ม /
  Not worth it yet — we'll tell you when it is."* → opt-in to a threshold nudge.
  *(Still a captured lead.)*
- **Always:** *"คุยกับผู้เชี่ยวชาญ / Talk to an expert"* — human handoff.

> For **foreign-owned** founders (Decision #6), the CTA routes to a **human
> specialist immediately**, not self-serve — flag it if the user indicates
> foreign ownership (a simple "Are you / your shareholders Thai?" question).

---

## 7. Plain-language & guidance (this is a Group-1 surface)

- No jargon without an inline explainer. "Corporate income tax (ภาษีเงินได้
  นิติบุคคล) — the tax a company pays on its profit, often lower than personal tax."
- Frame inputs as questions: "How much do you earn in a year?" not "Annual gross revenue."
- The whole tool should feel like *advice from a friendly accountant*, not a spreadsheet.
- Respect Guided vs Fast mode (Phase 7): Guided shows all explainers expanded;
  Fast collapses them.

---

## 8. Disclaimers & guardrails

- Persistent banner: *"การประมาณการเบื้องต้นเท่านั้น ไม่ใช่คำแนะนำทางภาษี โปรด
  ยืนยันกับเรา / Rough estimate, not tax advice — confirm with us."* (Same pattern
  as the PIT estimator's existing disclaimer.)
- Never present the number as a guarantee. Always "ประมาณ / approximately."
- Don't store this as a filing or a document — it's ephemeral (unless we add
  "save calculation," which is a separate decision).

---

## 9. Lead capture / telemetry

This tool is a lead engine — instrument it:
- Record (for logged-in users): inputs, result, netBenefit, which CTA clicked.
- This feeds the accountant back-office (Phase 8) as a **warm-lead signal**:
  "User X computed a ฿120k/yr incorporation saving and clicked 'talk to expert'."
- For anonymous (marketing-page) use, capture an email before showing the CTA
  result, or after — A/B later.

---

## 10. Reuse & build notes

- **Reuse:** `calculatePIT()` bracket function and the deduction set from the
  built PIT estimator. Do **not** duplicate bracket logic.
- **New:** `citSME()` corporate-tax function + `compareIncorporation()` + the
  comparison UI + the CTA routing.
- **Cheap:** no new DB tables required for the calculator itself (lead capture
  can reuse/extend existing tables or a light `leads` table).
- Keep all rates in one `incorporation-rates.ts` constants file with verify TODOs.

---

## 11. Out of scope (for this phase)

- The actual formation workflow (that's Phase 11).
- Foreign-ownership tax specifics (BOI incentives, etc.) — the tool flags foreign
  users to a human; it doesn't model their tax.
- Precise salary/dividend optimization — we use one sensible model, clearly labeled.
- VAT in the comparison — it's broadly neutral between the two (both register
  above ฿1.8M); mention in a footnote, don't model.

---

## 12. Open questions

- **Default compliance-cost estimate** — what annual ฿ figure is realistic for a
  small company's bookkeeping + audit + filing? (Set with the accounting team;
  it's also a soft anchor for the service price.)
- **Salary assumption** — default "owner takes all profit as salary," or a more
  realistic split? Affects the result; pick the most defensible simple default.
- **Anonymous use** — gate the result behind an email on the marketing page, or
  show freely and capture on CTA?
- **"Save calculation"** — ephemeral only, or let logged-in users save/compare
  scenarios over time?

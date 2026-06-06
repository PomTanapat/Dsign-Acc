# Phase 6 Spec — Expense capture

> **Status:** Spec / ready to build · **Strategy ref:** `STRATEGY.md` §9 (bookkeeping
> bridge), Decision #2 (expense capture = yes).
>
> **Concept:** Let users record what they *spend* — snap a supplier receipt, log
> an expense — so that income (the documents they issue) **plus** expenses
> together become real bookkeeping data and a true "money in / money out"
> picture. This is what turns "an invoice tool" into "enough to keep their books."

---

## 1. Why this exists

Phases 0–5 capture **income** (issued documents). But you can't keep books — or
tell a user their real profit — with income alone. Expense capture closes the
loop:
- The user finally sees **profit, not just revenue**.
- Dsign's accountants get the **other half of the data** with no chasing.
- It's the precondition for Phase 9 (money health) and a real bookkeeping service.

---

## 2. Core flow

```
Add expense  →  enter (manual) OR snap/upload receipt  →  categorize  →  saved
                                                          (+ claimable VAT, WHT if any)
```
Fast and forgiving — a café owner should log a supplier bill in 15 seconds.

---

## 3. Fields

| Field | Notes / guidance |
|---|---|
| Date | Default today |
| Supplier / paid to | Free text or pick from a light supplier list |
| Amount | Total paid |
| Input VAT | If the supplier gave a tax invoice and the user is VAT-registered, this VAT is **claimable** (guidance explains it) |
| Category | From a simple Thai-SME set (§4) |
| WHT withheld? | If the user withheld tax paying this supplier → links to issuing a WHT certificate (Phase 3) |
| Attachment | Photo/PDF of the receipt |
| Payment method | Cash / transfer / card |
| Notes | Optional |

---

## 4. Categories (simple Thai-SME set)

Keep it short and plain: ซื้อสินค้า/วัตถุดิบ (goods/materials), ค่าจ้าง/บริการ
(services/labor), ค่าเช่า (rent), ค่าสาธารณูปโภค (utilities), ค่าขนส่ง (transport),
ค่าการตลาด (marketing), อุปกรณ์/เครื่องมือ (equipment), ค่าธรรมเนียม/ภาษี (fees/tax),
อื่นๆ (other). Map each to a proper accounting category behind the scenes for the
bookkeeping feed — the user sees plain words, the accountant sees real categories.

---

## 5. The concepts to explain (guidance — Phase 7 `<Explainer>`)

- **Input VAT (ภาษีซื้อ):** "If a supplier charged you 7% VAT and you're
  VAT-registered, you can claim it back against the VAT you collect. Keep the tax
  invoice." *(For non-VAT users: ignore — we hide it.)*
- **Deductible expense:** "Money spent for the business reduces your taxable
  profit. Keep the receipt — no receipt, no deduction."
- **WHT when you pay:** "Paying for services or rent? You may need to withhold a
  little and give the supplier a certificate. We'll prepare it."

---

## 6. Money in / money out (feeds Phase 9)

A simple running view per month: income (from issued docs) − expenses = **kept
(profit)**. Plain language, friendly visuals (reuse the dashboard CSS bars). The
detailed financial-health interpretation is Phase 9; Phase 6 just produces the
numbers.

---

## 7. Foreign owner note

Explain input VAT, deductibility, and the "keep the tax invoice" rule **in
English** — foreign owners often don't know Thai expense/VAT documentation
requirements. (See `foreign-owner-context.md`.)

---

## 8. Data model

`expenses` table: `id`, `companyId` (FK, cascade), `date`, `supplierName`,
`amount` numeric(14,2), `inputVat` numeric(14,2) nullable, `category`,
`whtAmount` numeric(14,2) nullable, `attachmentUrl`, `paymentMethod`, `notes`,
timestamps. Optional light `suppliers` table later.

---

## 9. Scope / out of scope

**In:** manual + photo-upload expense entry, categorization, input-VAT capture,
WHT-on-expense link, money-in/out totals, attachment storage.

**Out (later):** receipt **OCR** (auto-extract supplier/amount/VAT — manual
first); bank-feed import; full double-entry (that's the accountant's job from
this data).

---

## 10. Open questions

- Attachment storage (where — Railway volume / object storage?).
- Supplier list: free-text only, or a managed list like customers/items?
- Category set — validate with the accounting team for clean bookkeeping mapping.
- OCR timing — fast-follow or much later?

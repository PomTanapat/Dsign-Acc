# Dsign Accounting Workspace — Product & Design Brief

> **Purpose of this document.** A single source of truth for the product so a
> designer can pick up the work and progress further — covering the *why*, the
> *who*, the *service*, the *flows & journeys*, every *screen*, the *constraints*
> that shape the UI, and the *open questions* where design judgment is needed.
>
> **Status:** Engineering scaffold for Phases 0–5 is built and on GitHub as 5
> open PRs. The product is functionally complete for v1 but visually generic
> (default shadcn/ui). **This is exactly where design takes over.**
>
> **Last updated:** 2026-05-30 · **Audience:** Product / UX / UI designer

---

## 1. What this product is

**Dsign Accounting Workspace** is a web application that lets Thai solo
entrepreneurs and small admin/accounting teams **issue routine financial
documents in seconds instead of fighting Word and Excel templates.**

It grew out of the existing marketing site for *Dsign Accounting Co., Ltd.*
(a Thai accounting firm). The marketing site stays as the public front door;
behind a login sits a focused workspace that does the time-sensitive paperwork
a monthly-cycle accounting firm *can't* do for the client day-to-day.

**One sentence:** *Turn 30 minutes of manual document-making and VAT math into
30 seconds of fill-a-form-and-download-a-PDF — fully compliant with Thai tax
rules, in Thai or English.*

### The shift we're making

| Before (today, live) | After (this product) |
|---|---|
| Static brochure website | Brochure **+** a real web app behind login |
| "Call us for accounting services" | "Sign up and issue your own documents now" |
| Firm does monthly books | Client self-serves the daily documents; firm consolidates monthly |

---

## 2. Who it's for (personas)

### Persona A — "Nan", the solo entrepreneur
- Runs a small design studio / freelance practice. Issues 5–20 documents a month.
- **Pain:** Doesn't know the exact VAT/WHT rules. Re-uses a Word template, fat-fingers the running number, forgets which invoice was paid.
- **Wants:** Something that already knows the rules, looks professional to *her* clients, and produces a proper PDF she can send.
- **Emotional job:** "Make me look legitimate and in control without hiring an accountant yet."

### Persona B — "Khun Aoy", the admin / outsourced accounting operator
- Handles paperwork for one or several owners. Issues 30–100+ documents a month.
- **Pain:** High volume, repetitive, time-sensitive. Errors are expensive (a wrong tax-invoice number is a legal problem).
- **Wants:** Speed, keyboard-friendly forms, a reliable document history she can search, and the ability to email the customer directly.
- **Emotional job:** "Let me clear the document queue fast and never produce a non-compliant document."

> **Design implication:** Persona A needs *guidance and reassurance*; Persona B
> needs *speed and density*. The same screens must serve both — lean on smart
> defaults (so A is safe) plus keyboard flow and fast list/search (so B is
> fast). Don't optimize only for the first-time user.

### Workspace model
**Solo: one user = one company.** No teams, no roles, no inviting colleagues in
v1. (This was a deliberate scope decision — see §13.) A user signs up, fills in
their *one* company profile, and everything they create belongs to that company.

---

## 3. The service — what the product actually does

Five document/tool capabilities, all sharing one backbone (company profile +
customer book + item catalog + running-number engine + PDF export).

| # | Capability | Thai name | What it produces |
|---|---|---|---|
| 1 | **Quotation** | ใบเสนอราคา | A priced proposal with auto VAT |
| 2 | **Tax Invoice** | ใบกำกับภาษี | A legally-formatted VAT invoice (the marquee feature) |
| 3 | **Receipt** | ใบเสร็จรับเงิน | Proof of payment received |
| 4 | **WHT Certificate** | หนังสือรับรองการหักภาษี ณ ที่จ่าย | ภ.ง.ด.3 / ภ.ง.ด.53 withholding-tax certificate |
| 5 | **PIT Estimator** | ประมาณการภาษี ภ.ง.ด.90/91 | A personal income-tax calculation (planning tool, not a filing) |

Supporting capabilities that make the five work:

| Capability | Why it exists |
|---|---|
| **Company profile** | The "from" on every document — name, TIN, branch, address, logo, signature |
| **Customer book** | The "to" — reusable customers with TIN, address, juristic/individual flag |
| **Item catalog** | Reusable line items with price, VAT flag, optional WHT rate |
| **Dashboard** | At-a-glance: this month's invoices, VAT collected, WHT withheld, outstanding, trends, recent docs, top customers |
| **PDF export** | Every document downloads as a Thai-font A4 PDF |
| **Email to customer** | Send the PDF straight to the customer from inside the app |
| **Search & filter** | Find any document by number, customer, status, or date |

---

## 4. Information architecture (the map)

```
PUBLIC
└── /  (Thai default, /th and /en)
    ├── Landing (hero · services · about · FAQ · contact)
    ├── Login
    └── Sign up

WORKSPACE  (behind login)
├── Dashboard            ← lands here after login
├── Quotations           → list · new · detail
├── Invoices             → list · new · detail        (the core flow)
├── Receipts             → list · new · detail
├── WHT certificates     → list · new · detail
├── Tax estimator        ← single calculator page
├── Customers            ← table + add/edit dialog
├── Items                ← table + add/edit dialog
└── Settings             ← company profile (onboarding gate)
```

**Navigation pattern:** persistent left sidebar (9 items) + top bar (user
identity, language toggle, sign out). The first three document types
(Quotations / Invoices / Receipts) are siblings and behave identically — same
list, same form, same detail layout — so learning one teaches all three.

> **Design opportunity:** The sidebar has 9 items, which is a lot. Consider
> grouping: **Documents** (Quotations, Invoices, Receipts, WHT) vs **Tools**
> (Tax estimator) vs **Data** (Customers, Items) vs **Settings**. The grouping
> is yours to design.

---

## 5. Core user journeys

### Journey 1 — First-run onboarding (the activation moment)
```
Sign up (email+password or Google)
   ↓
Land on Dashboard — but it's empty, and a banner says
   "Set up your company info to start issuing documents"
   ↓
Any attempt to open Invoices/Customers/etc. redirects to Settings?onboarding=1
   ↓
Fill company profile (name, TIN, branch, address) → Save
   ↓
Banner clears. Workspace unlocks. Dashboard now reachable.
```
> **This is the single most important journey to get right.** If a user can't
> get through company setup, they never reach value. Right now it's a plain
> form with a banner. **Design the empty/onboarding states** — this is where a
> guided, friendly first-run experience would massively help Persona A.

### Journey 2 — Issue an invoice (the money flow)
```
Invoices → "New" 
   ↓
Pick customer (from book)   ·   set issue date (defaults today) + due date (+30d)
   ↓
Add line items:
   • "Add from catalog" → pick a saved item, row pre-fills
   • "Add free-text line" → type anything
   • per line: description · qty · unit price · discount % · VAT (0 or 7%)
   ↓
Live totals panel updates on every keystroke:
   Subtotal → VAT 7% → Total → (WHT if set) → Net Payable
   ↓
Optionally set doc-level WHT (0/1/3/5%) and notes
   ↓
"Issue document" → assigns running number (INV-2026-00042) → detail page
   ↓
From detail: Download PDF · Send to customer · (Receipt) · (WHT cert) · Void
```

### Journey 3 — Issue a WHT certificate (the compliance flow)
```
Two entry points:
  (a) WHT → New  (from scratch)
  (b) Invoice detail → "Issue WHT Certificate" (pre-fills from the invoice)
   ↓
Pick payee (customer). Form type auto-derives:
   individual → ภ.ง.ด.3 · juristic company → ภ.ง.ด.53   (overridable)
   ↓
Add income-type rows: type code (40(1)…40(8)) · gross · rate (auto-fills) · withheld (computed)
   ↓
Pick payment method (withheld / paid-by-payer / other) · notes
   ↓
"Issue" → running number (WHT-2026-00007) → detail → Download PDF (official layout)
```

### Journey 4 — Email a document to the customer
```
Any document detail → "Send to customer"
   ↓
Dialog opens with customer email pre-filled (editable)
   ↓
Send → PDF generated server-side → emailed via Resend
   ↓
Detail thereafter shows "Last sent: <when> to <email>"
```

### Journey 5 — Estimate personal income tax (planning)
```
Tax estimator (no document, no save)
   ↓
Enter annual income + WHT already paid
   ↓
Enter deductions (personal auto-applied, spouse, children, parents,
   social security, insurance, mortgage, donations…) — each shows its legal cap
   ↓
Live results: net income → bracket-by-bracket tax → refund (green) or due (red)
```

---

## 6. Screen inventory

Each screen below lists its **purpose**, **key elements**, and the **states**
a designer must handle (empty, loading, error, success, etc.).

### 6.1 Landing (public)
- **Purpose:** Sell the firm *and* funnel visitors into the web app.
- **Sections:** Hero (with a "✨ New: issue documents online" badge → Login),
  trust stats (10+ yrs, CPA, 200+ clients), 8 service cards, about, 8-item FAQ
  accordion, contact (currently a mailto form), footer.
- **States:** static; responsive down to mobile; TH/EN toggle.

### 6.2 Login / Sign up
- **Purpose:** Get the user authenticated.
- **Elements:** email + password, "Continue with Google", links between the two.
- **States:** idle · submitting · field errors · auth error ("invalid email or
  password") · password mismatch (signup).

### 6.3 Dashboard
- **Purpose:** The home base — orient the user and surface what needs attention.
- **Elements:** 4 KPI cards (Invoices this month, VAT collected, WHT withheld,
  Outstanding) · 6-month invoice **trend bar chart** · **Recent documents**
  table (all types incl. WHT) · **Top customers this month**.
- **States:** empty (new user, all zeros, "no invoices yet to chart") ·
  populated · onboarding banner if no company.

### 6.4 Document list (Quotations / Invoices / Receipts / WHT)
- **Purpose:** Find and open any document of that type.
- **Elements:** "New" button · **search** (running # or customer) · **status
  filter** (all/issued/void) · **date range** · table (running #, customer,
  date, total, status, actions).
- **States:** empty ("no documents yet — create your first") · filtered-empty
  ("no matches") · populated.

### 6.5 Document form (new) — *the most complex screen*
- **Purpose:** Compose and issue a document.
- **Elements:** customer picker · dates · **dynamic line-item table** (add from
  catalog / add free-text / delete / per-line VAT & discount) · doc-level WHT ·
  notes · **sticky live-totals panel** · PDF preview hint · Issue button.
- **States:** empty form · validating · line errors · submitting ("Saving…") ·
  success → redirect.
- **Design priority:** This screen makes or breaks Persona B's speed. The
  line-item table, the catalog picker, and the live totals are the heart of it.

### 6.6 Document detail (read-only)
- **Purpose:** Review an issued document and act on it.
- **Elements:** header (running #, status badge, dates) · customer block · line
  table · totals box · action buttons (Download PDF, Send to customer, and
  contextual: invoice→Receipt/WHT, void).
- **States:** issued · void (visually muted) · "sent" indicator after emailing.

### 6.7 WHT form & detail
- Same shape as document form/detail but with the **income-type table** and
  **ภ.ง.ด.3/53 form-type selector** instead of priced line items.

### 6.8 Tax estimator
- **Purpose:** Planning calculator. No save, no auth-sensitive data.
- **Elements:** income inputs · deduction inputs (each with cap hint) ·
  live results panel with bracket breakdown · refund/due with color semantics ·
  a disclaimer ("planning only, verify against the current ภ.ง.ด.90").
- **States:** live-recompute on every change.

### 6.9 Customers / Items
- **Purpose:** Manage the reusable data the forms draw from.
- **Elements:** table · "New" button · add/edit **dialog** with the entity form ·
  delete confirmation dialog.
- **States:** empty · populated · dialog open (create vs edit) · delete confirm.

### 6.10 Settings (company profile)
- **Purpose:** The single company record; also the onboarding gate.
- **Elements:** full company form (TH+EN name, TIN, branch, address, phone,
  email, logo URL, signature URL, default VAT rate, currency).
- **States:** first-run (empty + onboarding banner) · saved · field errors ·
  success banner.

---

## 6A. Wireframe sketches (low-fidelity)

> These are **structure, not style** — they show *what goes where* and the
> relationships between elements, deliberately leaving the visual language open.
> Treat them as a starting skeleton to redesign, not a spec to reproduce.

### Shared app shell
```
┌────────────┬──────────────────────────────────────────────────────────┐
│  ◧ Dsign   │  ยินดีต้อนรับ, somchai@dsign.co.th        [ 🌐 TH ▾ ] [ ออก ] │  ← top bar
│  Workspace ├──────────────────────────────────────────────────────────┤
│            │                                                            │
│ ▸ แดชบอร์ด   │                                                            │
│   ใบเสนอราคา │                  ( page content renders here )            │
│   ใบกำกับภาษี│                                                            │
│   ใบเสร็จ    │                                                            │
│   WHT       │                                                            │
│   ภาษี       │                                                            │
│   ลูกค้า      │                                                            │
│   สินค้า      │                                                            │
│   ตั้งค่า      │                                                            │
│            │                                                            │
└────────────┴──────────────────────────────────────────────────────────┘
   sidebar ~240px              content area (max ~1100px, centered)
```

### Dashboard
```
แดชบอร์ด
ภาพรวมเอกสารและยอดเงินเดือนนี้

┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐
│ Invoices  │ │ VAT       │ │ WHT       │ │ Outstanding│   ← 4 KPI cards
│   12      │ │ ฿29,550   │ │ ฿8,460    │ │ ฿182,900  │
│ ฿422,150  │ │ this month│ │ this month│ │ 6 unpaid  │
└───────────┘ └───────────┘ └───────────┘ └───────────┘

┌──────────────────────────────────┐ ┌──────────────────────────┐
│ Monthly invoice trend (6 mo)     │ │ Top customers this month │
│                                  │ │ 1. อาทิตย์อุทัย   ฿142,800 │
│   ▁    ▃    ▂    ▅    ▄    █     │ │ 2. ดวงดี          ฿96,000 │
│  ธค   มค   กพ   มีค  เมย พค       │ │ 3. สมชาย          ฿41,250 │
└──────────────────────────────────┘ └──────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Recent documents                                              │
│ เลขที่           ประเภท        ลูกค้า          มูลค่า     สถานะ │
│ INV-2026-00042  ใบกำกับภาษี   อาทิตย์อุทัย   ฿32,100  ●ออกแล้ว│
│ Q-2026-00018    ใบเสนอราคา    สมชาย          ฿18,750  ●ออกแล้ว│
│ WHT-2026-00007  WHT           ดวงดี          ฿1,800   ●ออกแล้ว│
│ INV-2026-00041  ใบกำกับภาษี   ทะเลทราย       ฿96,400  ○ยกเลิก │
└──────────────────────────────────────────────────────────────┘
```

### Document list (invoices / quotations / receipts / WHT)
```
ใบกำกับภาษี                                            [ + ออกใบกำกับภาษี ]

┌──────────────────────────────────────────────────────────────┐
│ [ 🔍 ค้นหาเลขที่/ลูกค้า ]   [ สถานะ: ทั้งหมด ▾ ]  [ จาก ▢ ] [ ถึง ▢ ]│  ← filter bar
├──────────────────────────────────────────────────────────────┤
│ เลขที่           ลูกค้า         วันที่        มูลค่า    สถานะ   ⋯ │
│ INV-2026-00042  อาทิตย์อุทัย  28 พ.ค.      ฿34,775  ●ออกแล้ว ⋯ │
│ INV-2026-00041  ทะเลทราย      25 พ.ค.      ฿96,400  ○ยกเลิก  ⋯ │
│ INV-2026-00040  ดวงดี         20 พ.ค.      ฿12,000  ●ออกแล้ว ⋯ │
└──────────────────────────────────────────────────────────────┘
        (empty state: "ยังไม่มีเอกสาร — สร้างฉบับแรกของคุณ")
```

### Document form — NEW INVOICE (the most complex screen)
```
ออกใบกำกับภาษีใหม่                              [ ยกเลิก ] [ ✓ ออกเอกสาร ]
เลขที่จะถูกสร้างอัตโนมัติเมื่อบันทึก

┌───────────────────────────────────────────┐ ┌────────────────────┐
│ ข้อมูลพื้นฐาน                                │ │ สรุปยอด  (sticky)   │
│ ลูกค้า*   [ อาทิตย์อุทัย — TIN 010… ▾ ]      │ │ ยอดก่อน VAT ฿32,500│
│ วันที่ออก* [2026-05-30]  ครบกำหนด [06-29]   │ │ VAT 7%      ฿2,275 │
│ หัก ณ ที่จ่าย [ 3% ▾ ]                       │ │ รวม         ฿34,775│
├───────────────────────────────────────────┤ │ WHT 3%      −฿975  │
│ รายการ                                      │ │ ─────────────────  │
│ รายละเอียด        จำนวน ราคา/นง VAT   มูลค่า │ │ สุทธิ      ฿33,800 │
│ [ค่าออกแบบเว็บ ] [1] [25000] [7▾] ฿25,000 ✕│ └────────────────────┘
│ [ค่าดูแลรายเดือน] [1] [ 7500] [7▾] ฿ 7,500 ✕│ ┌────────────────────┐
│ [+ เพิ่มบรรทัด] [⊞ เลือกจากแคตตาล็อก]        │ │ ตัวอย่าง PDF        │
├───────────────────────────────────────────┤ │ ┌──────────────┐   │
│ หมายเหตุ                                     │ │ │ ใบกำกับภาษี   │   │
│ [โปรดชำระภายในวันครบกำหนด………………… ]        │ │ │ INV-2026-…   │   │
└───────────────────────────────────────────┘ │ └──────────────┘   │
       main column (2/3)                       └────────────────────┘
                                                   side column (1/3)
```
> **The line-item table + live-totals panel are the heart of the product.**
> Persona B will live here all day. Optimize for keyboard flow, fast catalog
> insertion, and instant total feedback.

### Document detail (read-only)
```
ใบกำกับภาษี                          [ ✉ ส่งให้ลูกค้า ] [ ⬇ ดาวน์โหลด PDF ]
INV-2026-00042   ●ออกแล้ว
ออกเมื่อ 28 พ.ค. 2026 · ครบกำหนด 27 มิ.ย. 2026

┌────────────────────┐ ┌─────────────────────────────────────────┐
│ ลูกค้า              │ │ รายการ                                    │
│ อาทิตย์อุทัย จำกัด  │ │ รายละเอียด          จำนวน  ราคา    มูลค่า │
│ TIN 010… (00000)   │ │ ค่าออกแบบเว็บไซต์      1   ฿25,000 ฿25,000│
│ 121/45 สุขุมวิท…    │ │ ค่าดูแลรายเดือน        1   ฿7,500  ฿7,500 │
│ finance@…          │ │                  ยอดก่อน VAT       ฿32,500│
│ 02-123-4567        │ │                  VAT 7%            ฿2,275 │
└────────────────────┘ │                  หัก ณ ที่จ่าย 3%   −฿975 │
                       │                  สุทธิที่ต้องชำระ  ฿33,800│
                       └─────────────────────────────────────────┘
[ ออกใบเสร็จ ] [ ออกหนังสือรับรอง WHT ]            [ ยกเลิกเอกสาร ]
```

### WHT certificate form
```
ออกหนังสือรับรองการหักภาษี ณ ที่จ่าย                [ ✓ ออกเอกสาร ]

┌───────────────────────────────────────────┐ ┌────────────────────┐
│ ผู้ถูกหัก (payee)  [ ดวงดี ▾ ]              │ │ สรุป                │
│ ประเภทแบบ:  ( ) ภ.ง.ด.3   (●) ภ.ง.ด.53     │ │ ยอดจ่ายรวม ฿60,000 │
│   (auto: juristic → 53)                     │ │ ภาษีหักรวม  ฿1,800 │
│ วันที่จ่าย [2026-05-30]                      │ └────────────────────┘
├───────────────────────────────────────────┤
│ ประเภทเงินได้   รายละเอียด   ยอดจ่าย อัตรา  หัก│
│ [40(2) ▾]      [ค่านายหน้า] [60000] [3%] ฿1,800│
│ [+ เพิ่มประเภทเงินได้]                         │
├───────────────────────────────────────────┤
│ วิธีหัก: (●) หัก ณ ที่จ่าย ( ) ออกให้ ( ) อื่นๆ│
└───────────────────────────────────────────┘
```

### Tax estimator (PIT)
```
ประมาณการภาษีบุคคลธรรมดา (ภ.ง.ด.90/91)
เครื่องมือคำนวณ — ใช้สำหรับวางแผน ไม่ใช่การยื่นจริง

┌───────────────────────────────────────────┐ ┌────────────────────┐
│ ข้อมูลรายได้                                │ │ ผลการคำนวณ          │
│ รายได้รวมต่อปี*  [ 800,000 ]               │ │ รายได้รวม  ฿800,000│
│ WHT ที่ถูกหักแล้ว [ 24,000 ]                │ │ −ค่าใช้จ่าย −฿100,000│
├───────────────────────────────────────────┤ │ −ส่วนตัว    −฿60,000│
│ ค่าลดหย่อน                                  │ │ สุทธิ       ฿640,000│
│ ส่วนตัว [60,000✓] คู่สมรส [ 0 ]            │ │ ─────────────────  │
│ บุตร    [ 0 ]     บิดามารดา [ 0 ]          │ │ 0–150k (0%)    ฿0  │
│ ประกันสังคม [0] ประกันชีวิต [0]            │ │ 150–300k(5%) ฿7,500│
│   (each shows its legal cap as hint)        │ │ 300–500k(10%)฿20k  │
└───────────────────────────────────────────┘ │ 500–640k(15%)฿21k  │
                                               │ ภาษี        ฿48,500│
   ⚠ ใช้สำหรับวางแผนเบื้องต้นเท่านั้น           │ ขอคืน 🟢   ฿(refund)│
                                               └────────────────────┘
```

### First-run / onboarding (settings gate)
```
┌──────────────────────────────────────────────────────────────┐
│ ⚠ ตั้งค่าข้อมูลบริษัทเพื่อเริ่มออกเอกสาร                          │  ← banner
├──────────────────────────────────────────────────────────────┤
│ ตั้งค่าบริษัท                                                    │
│ ชื่อ (ไทย)*  [………………]   ชื่อ (อังกฤษ) [………………]               │
│ เลขผู้เสียภาษี* […13 หลัก…]  สาขา [00000]                        │
│ ที่อยู่ (ไทย)* [……………………………………]                            │
│ โทร [………]  อีเมล [………]                                       │
│ โลโก้ URL [………]  ลายเซ็น URL [………]                            │
│ VAT เริ่มต้น [7.00]  สกุลเงิน [THB]                              │
│                                          [ บันทึก ]             │
└──────────────────────────────────────────────────────────────┘
```
> **The activation moment.** Until this form is saved, the rest of the app is
> gated. This is the screen most worth a designer's love — it's the gap between
> "signed up" and "got value."

---

## 7. The document lifecycle (status model)

```
        ┌──────────┐   issue    ┌──────────┐
        │  (form)  │ ─────────► │  ISSUED  │
        └──────────┘            └────┬─────┘
                                     │ void
                                     ▼
                                ┌──────────┐
                                │   VOID   │   (kept for audit; greyed in UI)
                                └──────────┘
```

- Documents are **issued immediately** (no draft state in v1).
- **Void, never delete** — a voided document keeps its number and stays in
  history (Thai tax records must be auditable). Voided rows are excluded from
  dashboard totals.
- **Future states** (`paid`, partial payment) are not built — see §13. A
  designer should leave visual room for a richer status set (e.g. a status
  pill that could later show Paid / Overdue / Partially paid).

> **Design note — running numbers are sacred.** Every issued document gets a
> sequential, never-reused number (`INV-2026-00042`). This is a legal
> requirement, not a nicety. Surface the number prominently and immutably on
> every document and PDF.

---

## 8. Thai-compliance rules that shape the UI

These aren't optional polish — they're why the product exists. The UI must
respect them.

| Rule | UI consequence |
|---|---|
| A **tax invoice** must carry the literal words **"ใบกำกับภาษี"**, seller TIN + branch code, buyer TIN, a sequential number, and VAT shown separately | The invoice PDF and form must show these; VAT is always its own line |
| **VAT is 7%** | Default VAT on line items is 7%; 0% is the only alternative in v1 |
| **Withholding tax** is on the **pre-VAT** amount, rates **1/3/5%** (and 10% for dividends) | WHT calculator works off subtotal, not total; "Net Payable = Total − WHT" |
| **ภ.ง.ด.3** = individual payee, **ภ.ง.ด.53** = juristic payee | Form type auto-selects from the customer's juristic flag |
| **Income type codes 40(1)–40(8)** each have a default WHT rate | The WHT form's type dropdown auto-fills the rate |
| Tax years on official forms use **พ.ศ. (Buddhist Era = CE + 543)** | The WHT PDF shows BE on the Thai side, CE on the English side |
| Documents are **legal records → immutable** | We snapshot the company + customer + line data at issue time, so editing a profile later never rewrites old PDFs |
| **Branch code** (5 digits, `00000` = head office) | Captured on company + customer; appears on tax invoices |

> A designer doesn't need to memorize tax law — but should treat these as
> **fixed content requirements**, like a regulated form. The creative freedom
> is in *how* clearly and pleasantly we present mandatory fields, not *whether*
> to show them.

---

## 9. Design system (current state & direction)

### What's there now
The app is built with **Tailwind CSS + shadcn/ui** (default "slate" theme).
It's clean and functional but **intentionally generic — it has no brand
personality yet.** This is the biggest design opportunity.

### Brand & palette
- **Primary:** teal — inherited from the original site (`#17a2b8`) and used in
  the preview as a deeper, more modern teal (`#0d9488` / teal-600).
- **Neutrals:** slate grey scale (shadcn default).
- **Semantic:** emerald (success / refund), amber (warning / disclaimer),
  rose (danger / tax-due / void).

> **Open question for design:** Is teal the right brand color, or do we want a
> distinct identity for the *workspace* vs the *marketing site*? The marketing
> site can stay teal-traditional; the app could feel more like a modern SaaS
> tool. Your call — propose a direction.

### Typography
- **Headings:** Kanit (geometric Thai/Latin display).
- **Body:** Sarabun (highly legible Thai/Latin — also the PDF font, so screen
  and print match).
- Both are Google Fonts with full Thai glyph coverage.

### Components (from shadcn/ui, already in the codebase)
Button, Input, Label, Card, Dialog, Select, Checkbox, Textarea, Table, Alert,
Dropdown menu. These are unstyled-beyond-default — a designer can re-skin
tokens (radius, shadow, color, spacing) globally and every screen updates.

### Layout primitives
- App shell: fixed left sidebar (~240px) + top bar + content area.
- Cards everywhere for grouping.
- Forms: label-on-top, single or two-column.
- Tables for all lists.

> **Design deliverables that would help most:**
> 1. A **token set** (color, type scale, radius, shadow, spacing) as the brand layer over shadcn.
> 2. A **redesigned dashboard** — it's the home screen and currently the most generic.
> 3. The **document form** layout — the highest-frequency, highest-complexity screen.
> 4. **Empty & onboarding states** — currently plain; the activation moment.
> 5. The **PDF templates** — these are what the customer actually sees; they represent the user's brand to *their* clients.

---

## 10. Bilingual / internationalization

- **Thai is the default**; English is a toggle (`/th` and `/en` in the URL).
- Every UI string lives in `messages/th.json` + `messages/en.json` with
  identical keys — so **nothing is hardcoded**; design can assume any label can
  be swapped per locale.
- **The PDFs are intentionally bilingual regardless of UI language** — they
  show Thai *and* English labels together (e.g. "ใบกำกับภาษี / TAX INVOICE"),
  because a Thai tax document is often read by both local officials and foreign
  stakeholders.

> **Design implication:** Thai text runs longer and taller than English (taller
> line-height for vowel/tone marks). Design for the **Thai** case first — if it
> fits and breathes in Thai, English will be comfortable. Watch button widths
> and table headers especially.

---

## 11. Content & tone

- **Thai-first, warm but professional.** The audience is small-business owners,
  not enterprises. Avoid stiff legalese in the *UI* (the legal precision lives
  in the *documents*).
- **Reassure on compliance.** Microcopy like "VAT calculated automatically" or
  "We'll never reuse a document number" builds trust with Persona A.
- **Be explicit about the planning-only nature** of the tax estimator (it
  already carries a disclaimer — keep that prominent).

---

## 12. What's built vs. what's stubbed

| Area | State |
|---|---|
| Auth (email/password + Google), sessions | ✅ Built |
| Company / Customer / Item CRUD | ✅ Built |
| Quotation / Invoice / Receipt issue + PDF | ✅ Built |
| WHT certificate (ภ.ง.ด.3/53) + PDF | ✅ Built |
| PIT estimator | ✅ Built |
| Email PDF to customer (Resend) | ✅ Built |
| Dashboard (KPIs, trend, recent, top customers) | ✅ Built |
| Search / filter on lists | ✅ Built |
| **Mark invoice as paid / payment tracking** | ⛔ Not built (status stays "issued") |
| **Draft documents** | ⛔ Not built (issue is immediate) |
| **Logo / signature image upload** | ⚠️ URL field only (no uploader UI) |
| **Convert quotation→invoice, invoice→receipt** | ⚠️ Buttons present, wired partially |
| **Multi-currency, recurring invoices, teams** | ⛔ Out of scope for v1 |
| **Visual brand / polish** | ⛔ Generic shadcn — **this is the design work** |

---

## 13. Open design questions & opportunities

These are the decisions where a designer adds the most value:

1. **Brand identity for the workspace.** Keep the teal accounting-firm look, or
   give the *tool* its own modern-SaaS personality distinct from the marketing
   site?
2. **Onboarding.** The company-setup gate is functional but bare. Design a
   first-run experience that makes Nan feel guided, not blocked. A checklist?
   A wizard? Sample data?
3. **Sidebar grouping.** 9 flat items vs grouped sections — how should the nav
   be organized as the product grows?
4. **The document form.** Can the line-item + totals experience be made faster
   for Persona B (keyboard nav, inline catalog search, duplicate-last-line)?
5. **PDF templates.** These are the user's brand to *their* customers. They
   currently use a clean default. A polished, optionally-customizable template
   (accent color from the company profile?) would be a strong selling point.
6. **Status & payment.** Even though payment tracking isn't built, designing
   the status system now (Paid / Overdue / Partially paid pills, an "outstanding"
   view) sets the visual direction for the next build phase.
7. **Mobile.** Persona B works at a desk, but Persona A might issue an invoice
   from a phone after a meeting. How far down does the document form need to go?
8. **Empty states everywhere.** Every list, the dashboard, the customer/item
   books — each empty state is a chance to teach and reassure.

---

## 14. Appendix — data entities (light reference)

So the designer knows what fields exist to lay out.

- **Company:** nameTh, nameEn, tin (13-digit), branchCode (5-digit), addressTh,
  addressEn, phone, email, logoUrl, signatureUrl, defaultVatRate, defaultCurrency.
- **Customer:** name, tin (optional), branchCode, isJuristic (company vs
  individual), address, email, phone, notes.
- **Item:** name, description, unit, unitPrice, vatApplicable, whtRate
  (optional), isActive.
- **Document** (quotation/invoice/receipt): type, runningNumber, year, customer,
  issueDate, dueDate, status, line items, subtotal, vatAmount, whtAmount, total,
  netPayable, currency, notes, sentAt, lastSentTo, + frozen company/customer
  snapshots.
- **Document line:** description, quantity, unitPrice, discountPercent, vatRate,
  lineTotal.
- **WHT certificate:** formType (pnd3/pnd53), payee (customer), optional linked
  invoice, income-type rows (code, gross, rate, withheld), paymentDate,
  paymentMethod, totalGross, totalWithheld, notes, status, sentAt.

---

## 15. Reference links

- **Repo (fork with all code):** https://github.com/PomTanapat/Dsign-Acc
- **Upstream + open PRs (Phases 0–5):** https://github.com/POmz-Design/Dsign-Acc/pulls
- **Current live (old static site):** https://dsignaccounting.vercel.app
- **Visual preview (5 screens):** `preview/dsign-acc.html` in this repo —
  open in a browser or paste into claude.ai as an artifact.

---

*This brief describes a built-but-unstyled product. The engineering is done;
the experience is open. Design from here.*

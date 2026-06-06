# Phase 9 Spec — Plain-language money health

> **Status:** Spec / ready to build · **Strategy ref:** `STRATEGY.md` §4 (Group 1),
> the "understand my business" promise, the trust thesis.
>
> **Concept:** Reflect the user's own data back as a **demystified, plain-language
> picture** of their business — "money in, money out, what you kept, what to set
> aside for tax, what's coming back to you." No accounting jargon. This is the
> feature that delivers the brand promise: *our platform helps you understand
> your business.*

---

## 1. Why this exists

A scared beginner's two biggest fears are *"am I actually making money?"* and
*"will there be a surprise tax bill?"* Phase 9 answers both, gently. It turns the
income (docs) + expense (Phase 6) data into reassurance and understanding — which
is what earns the trust that sells the service.

---

## 2. What it shows

| Block | Plain-language framing |
|---|---|
| **Money in / out / kept** | "This month: money in ฿X, money out ฿Y, you kept ฿Z." (profit, but never call it that first) |
| **Set aside for tax** | "Put aside about ฿X so tax time isn't scary." — a running savings target |
| **Coming back to you** | "Companies have withheld ฿X in tax for you this year — you'll claim it back when you file." (the WHT-received credit) |
| **VAT position** *(if registered)* | "You collected ฿X VAT, can claim ฿Y — you'd owe about ฿Z." |
| **What's next** | Upcoming obligations in plain words, with "we can handle this →" |

---

## 3. The headline: "what you owe / what's coming back"

One clear, friendly summary at the top — money kept, estimated tax to set aside,
and WHT credit coming back. Color and tone reassuring, never alarming.

---

## 4. The tax set-aside nudge (high-value trust feature)

The single most reassuring thing for a beginner: *"set aside ฿X each month and
tax season won't hurt."* A simple, conservative estimate based on their profit
and the PIT (or corporate) logic already built. It removes the #1 fear — the
surprise bill — and costs us nothing but math.

> This is pure trust-building: we're helping them avoid pain, not selling. It's
> the emotional core of "we understand your business."

---

## 5. Plain language rules

- "Money you spent," not "expenses/accounts payable."
- "What you kept," not "net profit" (then teach the real term gently).
- "Tax to set aside," not "estimated tax liability."
- Every number expandable into "how we got this" for the curious.
- Respect Guided/Fast mode (Phase 7): Fast can show the terser, real-term version.

---

## 6. Visuals

Simple and friendly — reuse the dashboard's dependency-free CSS bars and cards.
No dense charts. The goal is *calm clarity*, not a finance terminal.

---

## 7. Foreign owner note

For foreign owners, frame their Thai obligations in **English plain language**:
corporate tax set-aside, VAT position, dividend WHT when repatriating profit,
personal tax if they draw a salary. Link to `foreign-owner-context.md` for depth.

---

## 8. Connections

- **Consumes:** issued documents (income), Phase-6 expenses, WHT-received slips.
- **Feeds:** the upsell — when the picture gets complex or the set-aside grows
  large, gently surface "want a real accountant to handle this? →" (honest, per
  the principle).
- **Reuses:** the built PIT engine for the set-aside estimate.

---

## 9. Data model

Mostly **derived** from existing data — little new storage. Optionally a
`taxSetAsideRate`/preference and a lightweight monthly snapshot for trend
continuity.

---

## 10. Scope / open questions

**In:** money-in/out/kept view, tax set-aside nudge, WHT-coming-back, VAT
position, plain-language framing, foreign-owner English variant.

**Open:** how conservative the set-aside estimate should be (under-promise);
whether to let users "stash" the set-aside virtually; how much to teach real
terms vs keep it simple; accuracy disclaimers (estimate, confirm with us).

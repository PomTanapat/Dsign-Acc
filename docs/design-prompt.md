# Design prompt — for claude.ai (or any design tool)

> Paste the block below into claude.ai. It points at the strategy + specs by URL
> so the tool reads the full context, then designs the **guidance-first,
> trust-led** product — not prettier versions of the generic built screens.

---

```
You are a senior product designer. Design the visual direction and key screens
for a Thai accounting web app aimed at scared, first-time solo entrepreneurs —
and at foreign owners running Thai companies.

Read these first (they define the product):
- Strategy:  https://raw.githubusercontent.com/PomTanapat/Dsign-Acc/preview/design-overview/docs/STRATEGY.md
- Built product + wireframes:  https://raw.githubusercontent.com/PomTanapat/Dsign-Acc/preview/design-overview/docs/PRODUCT.md
- Guidance + onboarding spec:  https://raw.githubusercontent.com/PomTanapat/Dsign-Acc/preview/design-overview/docs/specs/phase-7-guidance-onboarding.md

THE PRODUCT IN ONE LINE
The easiest way for a Thai solo business to send a quote, bill a client, and
never get in trouble with the Revenue Department — with real accountants one
tap away when they grow.

WHO IT'S FOR
- A scared beginner who doesn't know what VAT or withholding tax is, and avoids
  apps like PEAK/FlowAccount because they're terrifying cockpits.
- A foreign owner who needs Thai tax explained in clear English.
(Also a confident "Fast mode" user who wants speed — but design for the beginner first.)

NON-NEGOTIABLE PRINCIPLES (from the strategy)
- Remove FEAR, not just clicks. Every tax term is explained the moment it appears.
- Honest, never pushy. We even tell people "don't incorporate yet, save your money."
  Show costs openly, day one.
- Thai-first layout (taller line-heights for Thai); English equally clean.
- It should feel like a friendly accountant sitting next to you, not a form.

DELIVERABLE
A single interactive HTML/React artifact that:
1. Opens with a "Design tokens" panel — color palette, type scale (Kanit headings
   + Sarabun body), radius, shadow, spacing — in TWO distinct directions to choose from.
2. Applies the chosen direction to THREE guidance-first screens:
   a. The onboarding interview (industry + comfort-level questions that feel human).
   b. A "Guided mode" invoice form — with inline plain-language explainers on the
      VAT and withholding-tax fields (e.g. "VAT 7% — only if your sales pass ฿1.8M;
      you're under, so it's off ✓"), and a live totals panel.
   c. A plain-language "money health" view — "money in / out / kept this month,
      set aside ฿X for tax, ฿Y is coming back to you" — calm and reassuring.
Use realistic Thai sample data. Show one explainer in its expanded (Guided) state.

Give me the 2 token directions first, then build the 3 screens in the one I should pick.
```

---

## Scoped variants

- **Brand only:** replace the deliverable with *"just the 2 token directions + a
  component sheet (button, input, card, table, badge, dialog, the `<Explainer>`
  component in both Guided and Fast states)."*
- **Foreign-owner angle:** *"design the English-first onboarding + a 'Thai tax for
  foreign owners' knowledge panel"* (see `specs/foreign-owner-context.md`).
- **The incorporation assessment:** *"design the 6-driver 'Should I incorporate?'
  result screen — qualitative drivers first, tax math as support, full cost shown
  honestly"* (see `specs/phase-10-should-i-incorporate.md`).

# Dsign Accounting Workspace — documentation

The product concept, strategy, and specs in one place. Start here.

---

## The concept in five lines

A **free, radically-easy document tool** for Thai solo entrepreneurs (and foreign
owners of Thai companies) who are afraid of tax. It's the **front door**; Dsign's
accounting **service** is the business. Every document a user creates is also
clean bookkeeping data the firm harvests — so the easy tool and the data engine
are the same act. We win on **removing fear, not price**, and on **honesty** — we
even tell people not to incorporate when it isn't right for them.

> Front (issue documents + understand my business) feeds Back (file, keep books,
> advise). The front is free; the back is the revenue.

---

## Read in this order

| # | Doc | What it is |
|---|---|---|
| 1 | [STRATEGY.md](STRATEGY.md) | **North star** — wedge model, positioning, business model, the 6 reasons people incorporate, 4 user groups, scope, honesty principle, 6 locked decisions, roadmap |
| 2 | [PRODUCT.md](PRODUCT.md) | The **built product** — personas, service, IA, journeys, screen inventory, 8 wireframes, design-system direction |
| 3 | [design-prompt.md](design-prompt.md) | Ready-to-paste **design prompt** for claude.ai, guidance-first |
| 4 | [specs/foreign-owner-context.md](specs/foreign-owner-context.md) | The **foreign-owner persona** + the Thai-tax context we give them in English (cross-cutting) |

### Phase specs (the unbuilt roadmap)
| Phase | Doc | Scope |
|---|---|---|
| 6 | [specs/phase-6-expense-capture.md](specs/phase-6-expense-capture.md) | Snap supplier receipts → real money-in/out data |
| 7 | [specs/phase-7-guidance-onboarding.md](specs/phase-7-guidance-onboarding.md) | **Highest priority** — guidance modes, plain-language explainers, industry onboarding · [build prompt + file list](specs/phase-7-build-prompt.md) |
| 8 | [specs/phase-8-accountant-backoffice.md](specs/phase-8-accountant-backoffice.md) | Internal cross-client cockpit + honest upsell triggers |
| 9 | [specs/phase-9-money-health.md](specs/phase-9-money-health.md) | Plain-language "money health" + tax set-aside |
| 10 | [specs/phase-10-should-i-incorporate.md](specs/phase-10-should-i-incorporate.md) | 6-driver incorporation **assessment** (not a tax calculator) |
| 11 | [specs/phase-11-formation-service.md](specs/phase-11-formation-service.md) | Company **formation service** — honest, cost-transparent, two tracks |

**Visual preview:** [`../preview/dsign-acc.html`](../preview/dsign-acc.html) — open
in a browser or paste into claude.ai (5 clickable screens of the current build).

---

## Status: built vs planned

**Built (Phases 0–5, on GitHub as PRs):** auth, company/customer/item data, issue
quotation/invoice/receipt + Thai PDF, WHT certificates (ภ.ง.ด.3/53), PIT estimator,
email, basic dashboard. *This is the document-issuance front-end.*

**Planned (specs above):** the guidance layer, expense capture, money health, the
accountant back-office, the incorporation assessment, and the formation service —
i.e. the parts that turn the front-end into the wedge-and-service engine.

**Recommended build order:** `7 → 10 → 6 → 8 → 11 → 9`
(guidance first — it's what makes the built features usable by a scared beginner).

---

## Locked decisions

1. "Accountant" = **internal Dsign team only** (back-office over many clients).
2. **Capture expenses** (snap receipts), not just issued documents.
3. **Free tool, paid service** — monetize bookkeeping/filing/consulting.
4. **Tailor per industry** (café ≠ contractor).
5. **Incorporation wedge** — catch founders at formation (the acquisition chokepoint).
6. **Cover foreign-owned formation too** — premium specialist track.

Plus the cross-cutting principle: **honest advice, not a hard sell — full cost shown day one.**

---

## The six reasons people actually incorporate (lead with these, not tax)

🛡 Limited liability · 🛡 Asset management/succession · 📈 B2B credibility ·
📈 Financing/expansion · 🤝 Partners · 🧮 Tax *(the only quantifiable one — and rarely the trigger)*

---

## Repo notes

- Code lives on the fork **PomTanapat/Dsign-Acc**; Phases 0–5 are open PRs to
  **POmz-Design/Dsign-Acc**.
- These docs + the preview live on the `preview/design-overview` branch.

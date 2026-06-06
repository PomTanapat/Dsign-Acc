# Phase 8 Spec — Accountant back-office + upsell triggers

> **Status:** Spec / ready to build · **Strategy ref:** `STRATEGY.md` §6 (accountant
> pains), Decision #1 (internal team only), Decision #3 (free tool → paid service).
>
> **Concept:** The internal Dsign cockpit across **all** client companies. It
> turns the activity that end-users generate into (a) efficient bookkeeping with
> no data-chasing, and (b) perfectly-timed, honest upsell signals. This is the
> monetization engine — "we know what the customer does, so we can serve them."

---

## 1. Why this exists

End-users (Groups 1 & 2) generate clean data by using the free tool. Phase 8 is
where Dsign's accountants (Group 3) **consume** it: do the books, watch the
deadlines, and spot who needs which paid service — at the right moment, honestly.

---

## 2. Who uses it & access model

- **Internal Dsign staff only** (Decision #1). A separate **staff role**, distinct
  from the solo end-user model.
- This is the **one surface that sees across companies** — so it must be tightly
  access-controlled, audited, and never exposed to end-user accounts.
- Keep the end-user solo model intact; staff access is an additive role layer.

---

## 3. Cross-client dashboard

A list/grid of all client companies with at-a-glance health:

| Column | Meaning |
|---|---|
| Company | Client name + entity type (individual / juristic) |
| Activity | Docs + expenses logged this month |
| Data completeness | Are income & expenses present? Gaps flagged |
| Flags | Threshold approaching · missing docs · deadline near |
| Service status | Free user / paying client / lead |
| Next deadline | Soonest filing due |

Sort/filter by flag, deadline, service status. Click → per-client view.

---

## 4. Per-client view

Everything for one company: issued documents, expenses, income vs expense
summary, what's missing for clean books, upcoming deadlines, and the lead/upsell
signals for this client. A "request from client" action (ask them to upload a
missing receipt, confirm an ambiguous item).

---

## 5. Data completeness / chase list

The accountant's recurring pain is chasing documents. Surface, per client, what's
missing for the period (e.g. "3 bank transfers with no matching receipt",
"expenses logged but no attachment"). One-click nudge to the client.

---

## 6. Upsell trigger engine (honest, not pushy)

Signals computed from the data — each becomes an actionable, *honest* prompt:

| Trigger | Signal | Suggested action |
|---|---|---|
| VAT threshold approaching | Trailing 12-mo revenue nears ฿1.8M | Offer VAT registration |
| First hire / paying others | WHT-issuing or payroll activity appears | Offer payroll + WHT filing |
| Incorporation-fit | Phase-10 assessment says "company fits" | Offer formation (Phase 11) — only if genuinely right |
| Year-end approaching | Filing season near | Offer annual filing / statements |
| Complexity rising | Many docs, mixed VAT, contested WHT | Offer bookkeeping / consulting |

> **Honesty principle (STRATEGY §3A) applies here too:** a trigger is a *prompt to
> help*, not a quota. Staff reach out human-first, and recommend the service only
> when it genuinely benefits the client.

---

## 7. The handoff

Trigger → a Dsign person reaches out (human-first builds trust) → if the client
says yes, the service is activated and (for formation) Phase 11 kicks in. Track
outcomes, including honest "not yet" — follow up later.

---

## 8. Deadline calendar

Per-client Thai filing deadlines: monthly VAT (ภ.พ.30, by ~15th), WHT remittance
(ภ.ง.ด.3/53, by ~7th), half-year corporate (ภ.ง.ด.51), annual (ภ.ง.ด.50), DBD
statements, social security. A consolidated staff calendar so nothing slips.
*(Verify exact dates with the team.)*

---

## 9. Bookkeeping feed / export

A clean, structured export (or direct feed) of each client's income + expenses in
the shape the firm's accounting software needs — so "doing the books" is review,
not re-entry. Confirm the target format with the accounting team.

---

## 10. Foreign owner note

Flag foreign-owned clients for the specialist track; surface their extra
obligations (work-permit-linked filings, foreign-shareholder dividend WHT,
treaty considerations). See `foreign-owner-context.md`.

---

## 11. Data model

`staffUsers` (or a role flag + a `staff_company_access` join for cross-company
access), `leads`/`triggers` (companyId, type, detectedAt, status, outcome,
assignedStaffId). Reuse existing `documents`/`expenses` for the activity data.

---

## 12. Scope / open questions

**In:** cross-client dashboard, per-client view, completeness/chase list, trigger
engine, deadline calendar, bookkeeping export, staff access model.

**Open:** staff roles/permissions granularity; exact bookkeeping export format;
how triggers are tuned (avoid alert fatigue); whether clients see any of this or
it's purely internal; verified filing-deadline dates.

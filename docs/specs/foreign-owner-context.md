# Spec — Foreign owner: Thai tax context (cross-cutting)

> **Status:** Spec / cross-cutting (touches Phases 7, 9, 11 + the marketing) ·
> **Strategy ref:** `STRATEGY.md` §4 (user groups), Decision #6 (foreign-owned track).
>
> **Concept:** A foreigner running a Thai business doesn't know Thai tax — the
> rules are genuinely foreign to them, and almost every Thai accounting tool is
> Thai-only. We give them **enough Thai tax context, in clear English, to operate
> confidently and stay compliant** — and that context itself is a differentiator
> and a trust-builder that leads to the service.

---

## 1. The persona — "the foreign owner"

| | |
|---|---|
| Who | An expat/foreigner who owns or runs a Thai company (Bangkok/Phuket/Chiang Mai are full of them) |
| Mindset | Competent in business, **lost in Thai tax & bureaucracy**, often burned by Thai-only software or opaque local accountants |
| Language | English (our EN locale is their default) |
| Entity reality | Usually operates through a **Thai company**, not as a sole proprietor — work-permit and Foreign Business Act rules make individual operation hard |
| What they need | Plain-English explanation of Thai obligations, deadlines, and "what do I actually have to do?" — plus a trustworthy human when it gets specialist |

> **Why this is a wedge of its own:** foreign owners are underserved, higher-value,
> and intensely loyal to whoever finally makes Thai compliance make sense to them.
> Being the clear, honest, English-first option is a strong differentiator.

---

## 2. The Thai tax context we must give them (the knowledge layer)

This is the content the product surfaces (English, plain language, with "this is
context, not advice — confirm with us"). Verify specifics with the team each year.

| Topic | What to explain |
|---|---|
| **Entity choice** | Why most foreigners operate via a Thai Limited Company, not as an individual (work permit + Foreign Business Act). |
| **Foreign ownership limits** | Foreign Business Act generally caps foreign ownership at **49%** for restricted activities — unless **BOI promotion**, a **Foreign Business License**, or a treaty (e.g. **US–Thai Amity**) allows more/100%. |
| **Corporate income tax (CIT)** | 20% standard; SME rates (0% ≤฿300k, 15% to ฿3M, 20% above) if capital ≤฿5M & revenue ≤฿30M. Half-year **ภ.ง.ด.51** + annual **ภ.ง.ด.50**. |
| **VAT** | 7%; register once revenue passes **฿1.8M**; monthly **ภ.พ.30** filing; input vs output VAT. |
| **Withholding tax** | Both directions: the company withholds when paying for services/rent (remit via ภ.ง.ด.3/53); customers withhold when paying the company. |
| **Personal income tax (the owner)** | If they draw a salary, Thai PIT applies (progressive to 35%). **Tax residency = 183+ days/year**; affects how income is taxed. |
| **Work permit & visa** | Tied to the company; rule-of-thumb **฿2M registered capital per work permit** and ~**4 Thai employees per foreign work permit**; Non-B visa. |
| **Dividends / repatriating profit** | Dividends to foreign shareholders carry **10% withholding tax**; profit can be remitted subject to that. |
| **Double-tax treaties** | Thailand has many; may reduce/avoid double taxation with the owner's home country. |
| **Audit & statements** | **Mandatory annual audit** by a Thai CPA; financial statements filed (in Thai) to the DBD. |
| **Key deadlines** | A plain-English calendar of the above (monthly VAT/WHT, half-year, annual, audit). |

---

## 3. How it shows up in the product

| Surface | Foreign-owner treatment |
|---|---|
| **Onboarding (Phase 7)** | A "Are you / your shareholders Thai?" branch → foreign-owner flavor: extra Thai-tax context, English default, route specialist needs to a human |
| **Guidance / glossary (Phase 7)** | Expanded English explanations of every Thai concept; a dedicated "Thai tax for foreign owners" knowledge section |
| **Money health (Phase 9)** | Obligations framed in English: CIT set-aside, VAT position, dividend WHT on repatriation, personal tax if salaried |
| **Formation service (Phase 11)** | The **foreign-owned track** — specialist-led, BOI/FBL/work-permit handling, law-firm partner where needed |
| **Marketing** | An English landing angle: "Run a Thai company without the tax confusion." |

---

## 4. Tone & guardrails

- **Plain English, not legalese.** "You must register for VAT once you pass ฿1.8M
  in sales" — not a statute citation.
- **Context, not advice.** Persistent disclaimer: *"This explains how Thai tax
  generally works — it's not formal tax/legal advice. Confirm your situation with
  us."* Foreign-owner situations (treaties, BOI, residency) are individual.
- **Honesty principle still applies** — when something needs a specialist or
  isn't worth it, say so; route to a human.
- **Bilingual documents already help** — our PDFs are Thai+English, which foreign
  owners need for their own records and home-country accountants.

---

## 5. Scope / open questions

**In:** the foreign-owner persona, the English Thai-tax knowledge layer, the
onboarding branch, the money-health English framing, the formation foreign track
linkage.

**Open:**
- How deep does the in-app knowledge go vs "talk to our specialist"?
- Which foreign-ownership structures we actively support (BOI categories, FBL,
  Amity) vs partner out.
- Tax-residency guidance is sensitive — how much to surface vs defer to a human.
- Verify every figure (capital-per-permit, employee ratios, treaty specifics)
  with the team; these change and have exceptions.

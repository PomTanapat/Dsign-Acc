/**
 * Shape guards for the ported glossary — catches locale drift (a term
 * edited in one language only) and icon-mapping mistakes (an undefined
 * lucide import is a runtime crash in both RSC and client trees).
 */
import { describe, it, expect } from "vitest";

import { GLOSSARY, GLOSSARY_KEYS, glossaryEntry } from "./glossary";

describe("GLOSSARY", () => {
  it("has 18 terms, 7 of them foreign-owner-specific", () => {
    expect(GLOSSARY_KEYS).toHaveLength(18);
    expect(GLOSSARY_KEYS.filter((k) => GLOSSARY[k].foreign)).toHaveLength(7);
  });

  it("every term is draft and has parallel locale shapes", () => {
    for (const k of GLOSSARY_KEYS) {
      const g = GLOSSARY[k];
      expect(g.draft, k).toBe(true);
      expect(g.icon, `${k} icon import`).toBeDefined();
      for (const entry of [g.th, g.en]) {
        expect(entry.plain.length, k).toBeGreaterThan(0);
        expect(entry.real.length, k).toBeGreaterThan(0);
        expect(Array.isArray(entry.facts), k).toBe(true);
      }
      // rates/notes must exist in both locales or neither.
      expect(Boolean(g.th.rates), k).toBe(Boolean(g.en.rates));
      expect(Boolean(g.th.notes), k).toBe(Boolean(g.en.notes));
    }
  });

  it("only whtIssued carries a rates table", () => {
    expect(GLOSSARY_KEYS.filter((k) => GLOSSARY[k].th.rates)).toEqual([
      "whtIssued",
    ]);
    expect(GLOSSARY.whtIssued.en.rates).toHaveLength(4);
    expect(GLOSSARY.whtIssued.en.notes).toHaveLength(2);
  });

  it("glossaryEntry resolves locale with th fallback", () => {
    expect(glossaryEntry("vat", "en").entry).toBe(GLOSSARY.vat.en);
    expect(glossaryEntry("vat", "th").entry).toBe(GLOSSARY.vat.th);
    expect(glossaryEntry("vat", "fr").entry).toBe(GLOSSARY.vat.th);
  });

  it("no copy asserts the reading user's current configuration", () => {
    // The honesty rule from plan D5 — phrases like "we've kept it off for
    // you" lie to a registered user whose VAT is on.
    const forbidden = [/we've (kept|done|turned|set)/i, /เราตั้งให้แล้ว/];
    for (const k of GLOSSARY_KEYS) {
      const g = GLOSSARY[k];
      for (const s of [g.th.plain, g.en.plain]) {
        for (const re of forbidden) {
          expect(re.test(s), `${k}: "${s}"`).toBe(false);
        }
      }
    }
  });
});

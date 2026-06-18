/**
 * The drivers-first verdict rules (plan D7) — especially the edge cases the
 * adversarial review flagged: tax-only and unsure-only answers must land in
 * the neutral "numbers" state, never a verdict the Phase 10 assessment
 * could later reverse.
 */
import { describe, it, expect } from "vitest";

import { buildTeaser } from "./incorporation-teaser";

describe("buildTeaser", () => {
  it("tax-only answers get the neutral numbers state, regardless of profit", () => {
    for (const netProfit of ["low", "vhigh", "unsure", undefined] as const) {
      const r = buildTeaser({ whyIncorporate: ["tax"], netProfit });
      expect(r.verdict).toBe("numbers");
    }
  });

  it("unsure-only answers get the numbers state (they asked for help)", () => {
    expect(buildTeaser({ whyIncorporate: ["unsure"] }).verdict).toBe("numbers");
    expect(
      buildTeaser({ whyIncorporate: ["tax", "unsure"] }).verdict,
    ).toBe("numbers");
  });

  it("corp-client signal lifts tax-only out of the numbers state", () => {
    const r = buildTeaser({ whyIncorporate: ["tax"], clientType: "corp" });
    expect(r.verdict).toBe("considering");
  });

  it("several strong drivers → likely", () => {
    const r = buildTeaser({
      whyIncorporate: ["corpClients", "liability", "funding"],
      clientType: "corp",
    });
    expect(r.verdict).toBe("likely");
    expect(r.score).toBeGreaterThanOrEqual(4);
  });

  it("a single soft driver → considering", () => {
    expect(
      buildTeaser({ whyIncorporate: ["credibility"] }).verdict,
    ).toBe("considering");
  });

  it("netProfit NEVER changes the verdict — only the smeRates pro line", () => {
    const base = { whyIncorporate: ["liability"] as ["liability"] };
    const low = buildTeaser({ ...base, netProfit: "low" });
    const vhigh = buildTeaser({ ...base, netProfit: "vhigh" });
    expect(low.verdict).toBe(vhigh.verdict);
    expect(low.score).toBe(vhigh.score);
    expect(low.pros).not.toContain("smeRates");
    expect(vhigh.pros).toContain("smeRates");
  });

  it("empty driver set (not reachable from the wizard) → soft none", () => {
    expect(buildTeaser({ whyIncorporate: [] }).verdict).toBe("none");
  });

  it("cons are the three unconditional facts about company life", () => {
    expect(buildTeaser({ whyIncorporate: ["tax"] }).cons).toEqual([
      "cost",
      "discipline",
      "dividends",
    ]);
  });
});

/**
 * Tests for the PIT calculator. Run with `npm test` (Vitest installed in
 * Phase 7).
 */
import { describe, it, expect } from "vitest";

import { calculatePit, type PitDeductions } from "./pit-calc";
import { calculatePIT } from "./pit-brackets";

function emptyDeductions(): PitDeductions {
  return {
    spouse: false,
    children: 0,
    parents: 0,
    disabled: 0,
    socialSecurity: 0,
    providentFund: 0,
    mortgageInterest: 0,
    lifeInsurance: 0,
    healthInsurance: 0,
    parentHealthInsurance: 0,
    charityDonations: 0,
    educationDonations: 0,
  };
}

describe("calculatePIT (bracket walk)", () => {
  it("returns zero tax below the first taxable bracket", () => {
    const r = calculatePIT(150_000);
    expect(r.totalTax).toBe(0);
    // The 0% bracket is included — the UI renders the full breakdown,
    // "0–150k (0%) ฿0" first.
    expect(r.bracketResults).toHaveLength(1);
    expect(r.bracketResults[0]).toMatchObject({
      rate: 0,
      taxableInBracket: 150_000,
      taxInBracket: 0,
    });
  });

  it("applies 5% in the second bracket only", () => {
    // Net 200k → 150k @ 0 + 50k @ 5% = 2,500.
    const r = calculatePIT(200_000);
    expect(r.totalTax).toBe(2500);
  });

  it("walks every bracket up to the 35% one", () => {
    // Net 6m. Walk: 0-150 free + 150-300 5% (7,500) + 300-500 10% (20,000)
    //   + 500-750 15% (37,500) + 750-1m 20% (50,000) + 1m-2m 25% (250,000)
    //   + 2m-5m 30% (900,000) + 5m-6m 35% (350,000) = 1,615,000.
    const r = calculatePIT(6_000_000);
    expect(r.totalTax).toBe(1_615_000);
    // All 8 brackets touched, including the 0% one (rendered in the UI).
    expect(r.bracketResults).toHaveLength(8);
  });
});

describe("calculatePit (full pipeline)", () => {
  it("50k annual salary worker pays zero tax", () => {
    const r = calculatePit({
      formType: "pnd91",
      grossIncome: 50_000,
      withholdingPaid: 0,
      deductions: emptyDeductions(),
    });
    // Expense ded = min(25k, 100k) = 25k; allowances = 60k personal.
    // 50k - 25k - 60k → clamped to 0. Tax = 0.
    expect(r.netIncome).toBe(0);
    expect(r.taxBefore).toBe(0);
    expect(r.taxRefundOrDue).toBe(0);
  });

  it("600k freelancer with minimal deductions lands in 15% bracket", () => {
    const r = calculatePit({
      formType: "pnd90",
      grossIncome: 600_000,
      withholdingPaid: 0,
      deductions: emptyDeductions(),
    });
    // Expense ded = 100k (capped); allowances = 60k personal.
    // Net = 600k - 100k - 60k = 440k. Tax: 150@0 + 150@5%=7,500 +
    //   140@10% = 14,000 → total 21,500.
    expect(r.expenseDeduction).toBe(100_000);
    expect(r.netIncome).toBe(440_000);
    expect(r.taxBefore).toBe(21_500);
    expect(r.taxRefundOrDue).toBe(-21_500);
  });

  it("millionaire with full allowances", () => {
    const d = emptyDeductions();
    d.spouse = true; // +60k
    d.children = 2; // +60k
    d.socialSecurity = 9_000; // capped at 9k
    d.lifeInsurance = 100_000; // at cap
    d.healthInsurance = 25_000; // at cap
    const r = calculatePit({
      formType: "pnd90",
      grossIncome: 3_000_000,
      withholdingPaid: 500_000,
      deductions: d,
    });
    // Expense ded = 100k (capped).
    // Allowances: 60 personal + 60 spouse + 60 children + 9 SS +
    //   100 life + 25 health = 314k.
    // Net = 3,000,000 - 100,000 - 314,000 = 2,586,000.
    // Tax walk through brackets:
    //   0–150k: 0
    //   150–300k: 7,500
    //   300–500k: 20,000
    //   500–750k: 37,500
    //   750k–1m: 50,000
    //   1m–2m: 250,000
    //   2m–2.586m: 586,000 * 30% = 175,800
    //   Total: 540,800.
    expect(r.expenseDeduction).toBe(100_000);
    expect(r.totalAllowances).toBe(314_000);
    expect(r.netIncome).toBe(2_586_000);
    expect(r.taxBefore).toBe(540_800);
    // WHT 500k, tax 540,800 → owes 40,800 (negative refund).
    expect(r.taxRefundOrDue).toBe(-40_800);
  });

  it("caps donation deduction at 10% of post-allowance income", () => {
    const d = emptyDeductions();
    d.charityDonations = 1_000_000; // huge — should be clamped.
    const r = calculatePit({
      formType: "pnd90",
      grossIncome: 1_000_000,
      withholdingPaid: 0,
      deductions: d,
    });
    // After expense (100k) + personal (60k) = 840k pre-donation net.
    // Donation cap = 84,000. So total allowances = 60k + 84k = 144k.
    expect(r.totalAllowances).toBe(144_000);
    expect(r.netIncome).toBe(756_000);
  });
});

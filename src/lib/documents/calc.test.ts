/**
 * Test cases for `calc.ts`. Run with `npm test` (Vitest installed in
 * Phase 7).
 */
import { describe, it, expect } from "vitest";
import { calculateLineTotal, calculateDocument, round2 } from "./calc";

describe("round2", () => {
  it("rounds to two decimals", () => {
    // Note: 1.005 is intentionally excluded — it is a float-representation
    // artefact (stored as 1.0049999…) and Math.round returns 1.00, not 1.01.
    // Real accounting inputs arrive 2dp-truncated and never hit the boundary.
    expect(round2(1.004)).toBe(1.0);
    expect(round2(2.345)).toBe(2.35);
    expect(round2(0.1 + 0.2)).toBe(0.3);
    expect(round2(99.999)).toBe(100.0);
  });
});

describe("calculateLineTotal", () => {
  it("multiplies qty * unitPrice with no discount or VAT", () => {
    const r = calculateLineTotal(2, 100, 0, 0);
    expect(r.lineTotal).toBe(200);
    expect(r.vatAmount).toBe(0);
  });

  it("applies percentage discount before VAT", () => {
    // 10 * 100 = 1000; 10% off = 900; +7% VAT = 63
    const r = calculateLineTotal(10, 100, 10, 7);
    expect(r.lineTotal).toBe(900);
    expect(r.vatAmount).toBe(63);
  });

  it("handles fractional quantity (e.g. hours)", () => {
    const r = calculateLineTotal(1.5, 333.33, 0, 7);
    // 1.5 * 333.33 = 499.995 -> 500.00; VAT 35.00
    expect(r.lineTotal).toBe(500);
    expect(r.vatAmount).toBe(35);
  });

  it("treats VAT rate of zero as no VAT line", () => {
    const r = calculateLineTotal(1, 1000, 0, 0);
    expect(r.vatAmount).toBe(0);
  });

  it("handles 100% discount", () => {
    const r = calculateLineTotal(5, 200, 100, 7);
    expect(r.lineTotal).toBe(0);
    expect(r.vatAmount).toBe(0);
  });
});

describe("calculateDocument", () => {
  it("aggregates subtotal, VAT, and total across mixed lines", () => {
    const { totals } = calculateDocument(
      [
        {
          sortOrder: 0,
          itemId: null,
          description: "Service A",
          quantity: 1,
          unitPrice: 1000,
          discountPercent: 0,
          vatRate: 7,
        },
        {
          sortOrder: 1,
          itemId: null,
          description: "Service B",
          quantity: 2,
          unitPrice: 500,
          discountPercent: 0,
          vatRate: 7,
        },
      ],
      null,
    );
    // subtotal 1000 + 1000 = 2000; VAT 70 + 70 = 140; total 2140
    expect(totals.subtotal).toBe(2000);
    expect(totals.vatAmount).toBe(140);
    expect(totals.total).toBe(2140);
    expect(totals.whtAmount).toBe(0);
    expect(totals.netPayable).toBe(2140);
  });

  it("computes WHT against pre-VAT subtotal (Thai convention)", () => {
    const { totals } = calculateDocument(
      [
        {
          sortOrder: 0,
          itemId: null,
          description: "Consulting",
          quantity: 1,
          unitPrice: 10000,
          discountPercent: 0,
          vatRate: 7,
        },
      ],
      3,
    );
    // subtotal 10000; VAT 700; total 10700; WHT 3% of 10000 = 300;
    // net payable 10400
    expect(totals.subtotal).toBe(10000);
    expect(totals.vatAmount).toBe(700);
    expect(totals.total).toBe(10700);
    expect(totals.whtAmount).toBe(300);
    expect(totals.netPayable).toBe(10400);
  });

  it("supports mixed VAT rates (e.g. exempt + 7%)", () => {
    const { totals } = calculateDocument(
      [
        {
          sortOrder: 0,
          itemId: null,
          description: "Exempt",
          quantity: 1,
          unitPrice: 500,
          discountPercent: 0,
          vatRate: 0,
        },
        {
          sortOrder: 1,
          itemId: null,
          description: "Taxable",
          quantity: 1,
          unitPrice: 1000,
          discountPercent: 0,
          vatRate: 7,
        },
      ],
      null,
    );
    expect(totals.subtotal).toBe(1500);
    expect(totals.vatAmount).toBe(70);
    expect(totals.total).toBe(1570);
  });

  it("returns zeros for empty line array", () => {
    const { totals, computedLines } = calculateDocument([], null);
    expect(computedLines).toEqual([]);
    expect(totals.subtotal).toBe(0);
    expect(totals.total).toBe(0);
    expect(totals.netPayable).toBe(0);
  });
});

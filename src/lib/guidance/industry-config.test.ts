/**
 * Sidebar tailoring rules (plan D8) — the "main" badge follows
 * primaryDocType (the prototype's unshift bug gave it to Quotations), and
 * a doc type with existing data is never hidden.
 */
import { describe, it, expect } from "vitest";

import {
  buildDocNav,
  industryConfig,
  showWhtNav,
} from "./industry-config";

const none = { quotation: 0, invoice: 0, receipt: 0, wht: 0 };

describe("buildDocNav", () => {
  it("invoice-primary with quotations: workflow order, badge on INVOICES", () => {
    const nav = buildDocNav(industryConfig("freelance"), none);
    expect(nav.map((i) => i.key)).toEqual([
      "quotations",
      "invoices",
      "receipts",
    ]);
    expect(nav.find((i) => i.primary)?.key).toBe("invoices");
  });

  it("quotation-primary (contractor): quotations first AND badged", () => {
    const nav = buildDocNav(industryConfig("contractor"), none);
    expect(nav[0]).toMatchObject({ key: "quotations", primary: true });
  });

  it("receipt-primary (food): receipts badged, quotations hidden", () => {
    const nav = buildDocNav(industryConfig("food"), none);
    expect(nav.map((i) => i.key)).toEqual(["receipts", "invoices"]);
    expect(nav[0].primary).toBe(true);
  });

  it("never hides a doc type with existing documents", () => {
    const nav = buildDocNav(industryConfig("food"), {
      ...none,
      quotation: 3,
    });
    expect(nav.map((i) => i.key)).toContain("quotations");
    // appended at the end, unbadged
    expect(nav[nav.length - 1]).toMatchObject({
      key: "quotations",
      primary: false,
    });
  });
});

describe("showWhtNav", () => {
  it("requires both the industry flag and paysOthers=yes", () => {
    expect(showWhtNav(industryConfig("freelance"), "yes", 0)).toBe(true);
    expect(showWhtNav(industryConfig("freelance"), "no", 0)).toBe(false);
    expect(showWhtNav(industryConfig("food"), "yes", 0)).toBe(false);
  });

  it("existing certificates override the hide", () => {
    expect(showWhtNav(industryConfig("food"), "no", 2)).toBe(true);
  });
});

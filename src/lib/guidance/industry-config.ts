// Pillar C — per-industry tailoring map (phase-7 spec §7), ported from the
// prototype's INDUSTRIES (p7-data.jsx). The sidebar order/visibility, the
// dashboard's KPI emphasis, the "new document" default, and list empty
// states all read from here.
//
// Notes from the port:
// - `hide` and the booleans are NOT mutually derivable (online hides only
//   quotation yet also has showWhtIssuing=false) — both are kept.
// - `defaultVat` is ported for completeness but the document form derives
//   VAT from `vatRegistered` (plan D11), exactly like the prototype did.
// - Labels/hints live in the `Industries` i18n namespace.

import type { DocType, Industry } from "@/lib/db/schema";

export type DashboardEmphasis = "sales" | "billing" | "projects";

export type IndustryConfig = {
  primaryDocType: DocType;
  showQuotation: boolean;
  showWhtIssuing: boolean;
  defaultVat: 0 | 7;
  hide: ("quotation" | "wht")[];
  dashboardEmphasis: DashboardEmphasis;
};

export const INDUSTRY_CONFIG: Record<Industry, IndustryConfig> = {
  freelance: {
    primaryDocType: "invoice",
    showQuotation: true,
    showWhtIssuing: true,
    defaultVat: 7,
    hide: [],
    dashboardEmphasis: "sales",
  },
  online: {
    primaryDocType: "receipt",
    showQuotation: false,
    showWhtIssuing: false,
    defaultVat: 0,
    hide: ["quotation"],
    dashboardEmphasis: "billing",
  },
  food: {
    primaryDocType: "receipt",
    showQuotation: false,
    showWhtIssuing: false,
    defaultVat: 0,
    hide: ["quotation", "wht"],
    dashboardEmphasis: "billing",
  },
  retail: {
    primaryDocType: "invoice",
    showQuotation: true,
    showWhtIssuing: true,
    defaultVat: 7,
    hide: [],
    dashboardEmphasis: "sales",
  },
  prof: {
    primaryDocType: "invoice",
    showQuotation: true,
    showWhtIssuing: true,
    defaultVat: 7,
    hide: [],
    dashboardEmphasis: "sales",
  },
  contractor: {
    primaryDocType: "quotation",
    showQuotation: true,
    showWhtIssuing: true,
    defaultVat: 7,
    hide: [],
    dashboardEmphasis: "projects",
  },
  salon: {
    primaryDocType: "receipt",
    showQuotation: false,
    showWhtIssuing: false,
    defaultVat: 0,
    hide: ["quotation", "wht"],
    dashboardEmphasis: "billing",
  },
  other: {
    // "Other / not sure" keeps every tool available with safe defaults.
    primaryDocType: "invoice",
    showQuotation: true,
    showWhtIssuing: true,
    defaultVat: 0,
    hide: [],
    dashboardEmphasis: "sales",
  },
};

export function industryConfig(industry: Industry | null | undefined): IndustryConfig {
  return INDUSTRY_CONFIG[industry ?? "other"] ?? INDUSTRY_CONFIG.other;
}

export type DocNavCounts = {
  quotation: number;
  invoice: number;
  receipt: number;
  wht: number;
};

export type DocNavItem = {
  key: "quotations" | "invoices" | "receipts";
  type: DocType;
  /** The industry's main document — gets the badge + the "new" default. */
  primary: boolean;
};

/**
 * Document nav for the sidebar, in workflow order (quotation → invoice →
 * receipt where applicable), with the prototype's badge bug fixed: the
 * "main" badge follows primaryDocType, never mere list position.
 *
 * Safety override (plan D8): a doc type with existing documents is NEVER
 * hidden — invisible data reads as data loss. It appends at the end,
 * unbadged.
 */
export function buildDocNav(
  cfg: IndustryConfig,
  counts: DocNavCounts,
): DocNavItem[] {
  const order: DocType[] =
    cfg.primaryDocType === "receipt"
      ? ["receipt", "invoice"]
      : cfg.showQuotation
        ? ["quotation", "invoice", "receipt"]
        : ["invoice", "receipt"];

  const items: DocNavItem[] = order.map((type) => ({
    key: `${type}s` as DocNavItem["key"],
    type,
    primary: type === cfg.primaryDocType,
  }));

  for (const type of ["quotation", "invoice", "receipt"] as const) {
    if (!items.some((i) => i.type === type) && counts[type] > 0) {
      items.push({
        key: `${type}s` as DocNavItem["key"],
        type,
        primary: false,
      });
    }
  }
  return items;
}

/** WHT-certificates nav visibility — issued-side tools (plan D8 override). */
export function showWhtNav(
  cfg: IndustryConfig,
  paysOthers: string | null | undefined,
  whtCount: number,
): boolean {
  return (cfg.showWhtIssuing && paysOthers === "yes") || whtCount > 0;
}

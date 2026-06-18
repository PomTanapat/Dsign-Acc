// VAT-threshold watch (plan D9) — the proactive nudge's data source, and
// later the same signal Phase 8's back-office trigger consumes.
//
// Revenue basis: non-void INVOICES + RECEIPTS over the trailing 12 months.
// Invoice-only would be structurally blind for the cash/receipt segments
// (online sellers, cafés, salons) the nudge exists to protect. Known
// limitation: a receipt issued against an invoice double-counts — there is
// no link column between them yet. The error direction is conservative
// (warn early, never late); the basis is on the CPA review list, and a
// proper de-dup lands when invoice→receipt conversion gets a link field.

import "server-only";

import { and, gte, inArray, ne, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { requireCompany } from "@/lib/queries/company";
import {
  evaluateVatThreshold,
  type VatThresholdStatus,
} from "@/lib/guidance/threshold-logic";

export async function getVatThresholdStatus(): Promise<VatThresholdStatus> {
  const { company } = await requireCompany();
  if (!company || company.vatRegistered === "yes") {
    return { revenue12m: 0, ratio: 0, shouldNudge: false };
  }

  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 365);
  const sinceIso = since.toISOString().slice(0, 10);

  const rows = await db
    .select({ total: documents.total })
    .from(documents)
    .where(
      and(
        eq(documents.companyId, company.id),
        inArray(documents.type, ["invoice", "receipt"]),
        ne(documents.status, "void"),
        gte(documents.issueDate, sinceIso),
      ),
    );

  const revenue12m = rows.reduce((s, r) => s + Number(r.total), 0);
  return evaluateVatThreshold(revenue12m);
}

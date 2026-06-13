"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { companies, leadEvents } from "@/lib/db/schema";
import { requireCompany } from "@/lib/queries/company";
import type { DismissedNudges } from "@/lib/guidance/threshold-logic";

/**
 * Persist a nudge dismissal (plan D9). The VAT-threshold nudge records the
 * ratio it was dismissed at so the re-arm rules can compare; the WHT info
 * card dismisses permanently (it's educational, not a deadline).
 */
export async function dismissNudge(input: {
  id: "vatThreshold" | "whtInfo";
  atRatio?: number;
}): Promise<void> {
  const { company } = await requireCompany();
  if (!company) return;

  const current = (company.dismissedNudges ?? {}) as DismissedNudges;
  const next: DismissedNudges =
    input.id === "vatThreshold"
      ? {
          ...current,
          vatThreshold: {
            dismissedAt: new Date().toISOString(),
            atRatio: input.atRatio ?? 0,
          },
        }
      : { ...current, whtInfo: { dismissedAt: new Date().toISOString() } };

  await db
    .update(companies)
    .set({ dismissedNudges: next, updatedAt: new Date() })
    .where(eq(companies.id, company.id));

  revalidatePath("/", "layout");
}

/** The nudge's "have us register your VAT" click — a warm lead (Phase 8). */
export async function logVatThresholdCta(): Promise<void> {
  try {
    const { userId, company } = await requireCompany();
    await db.insert(leadEvents).values({
      userId,
      companyId: company?.id ?? null,
      kind: "vat_threshold_cta",
      surface: "dashboard",
    });
  } catch (err) {
    console.error("logVatThresholdCta failed", err);
  }
}

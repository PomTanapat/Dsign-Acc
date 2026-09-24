"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { companies, leadEvents } from "@/lib/db/schema";
import { buildTeaser } from "@/lib/guidance/incorporation-teaser";
import {
  businessProfileSchema,
  onboardingInputSchema,
} from "@/lib/validation/onboarding";

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

/**
 * Onboarding Finish (plan D1): creates the companies row — BEFORE any legal
 * details exist (nameTh/tin/addressTh stay null until the user completes
 * them in Settings; document issuance is gated on that separately).
 *
 * Raw answers are stored versioned in `onboardingAnswers` for Phase 8 lead
 * context and Phase 10 assessment prefill — app behavior reads only the
 * typed columns.
 */
export async function completeOnboarding(input: unknown): Promise<ActionResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "unauthorized" };

  const parsed = onboardingInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "validation",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }
  const data = parsed.data;

  const foreignOwned = data.nationality === "foreign";
  const profile = {
    industry: data.industry,
    entityType: data.entityType,
    revenueBand: data.revenueBand,
    vatRegistered: data.vatRegistered,
    paysOthers: data.paysOthers,
    // guided2 ("know the basics") collapses to guided — the raw answer
    // stays in onboardingAnswers for future signal use (plan D4).
    guidanceMode: data.guidanceMode === "fast" ? ("fast" as const) : ("guided" as const),
    foreignOwned,
    ownershipStructure: foreignOwned ? (data.ownershipStructure ?? null) : null,
    workPermitNeed: foreignOwned ? (data.workPermitNeed ?? null) : null,
    onboardingAnswers: { version: 1, answers: data },
    onboardingCompletedAt: new Date(),
    updatedAt: new Date(),
  };

  const [company] = await db
    .insert(companies)
    .values({ userId, ...profile })
    .onConflictDoUpdate({ target: companies.userId, set: profile })
    .returning({ id: companies.id });

  // Warm-lead signal for the Phase 8 back-office: they engaged with the
  // incorporation questions. Surface carries the drivers-first verdict.
  if (data.whyIncorporate && data.whyIncorporate.length > 0) {
    const teaser = buildTeaser({
      whyIncorporate: data.whyIncorporate,
      clientType: data.clientType,
      netProfit: data.netProfit,
    });
    await db.insert(leadEvents).values({
      userId,
      companyId: company.id,
      kind: "incorporation_interest",
      surface: teaser.verdict,
    });
  }

  // Re-tailors the shell (guidance mode, sidebar, dashboard) everywhere.
  revalidatePath("/", "layout");
  return { success: true };
}

/**
 * Settings → Business profile: the editable slice of the onboarding
 * answers. Saving re-tailors the sidebar, dashboard, and form defaults on
 * the next render (revalidatePath busts the layout).
 */
export async function updateBusinessProfile(
  input: unknown,
): Promise<ActionResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "unauthorized" };

  const parsed = businessProfileSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "validation" };

  await db
    .update(companies)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(companies.userId, userId));

  revalidatePath("/", "layout");
  return { success: true };
}

/**
 * Skip-all must never strand the user (plan D14): it writes the minimal
 * safe profile and stamps `onboardingCompletedAt`, otherwise the workspace
 * gate would bounce them straight back into the wizard.
 */
export async function skipOnboarding(): Promise<ActionResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "unauthorized" };

  const existing = await db.query.companies.findFirst({
    where: eq(companies.userId, userId),
    columns: { id: true, onboardingCompletedAt: true },
  });

  if (existing) {
    if (!existing.onboardingCompletedAt) {
      await db
        .update(companies)
        .set({ onboardingCompletedAt: new Date(), updatedAt: new Date() })
        .where(eq(companies.id, existing.id));
    }
  } else {
    await db.insert(companies).values({
      userId,
      industry: "other",
      entityType: "individual",
      vatRegistered: "no",
      paysOthers: "no",
      guidanceMode: "guided",
      onboardingAnswers: { version: 1, skipped: true },
      onboardingCompletedAt: new Date(),
    });
  }

  revalidatePath("/", "layout");
  return { success: true };
}

import "server-only";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { companies, type Company } from "@/lib/db/schema";

/**
 * Resolves the authed user's company. Returns null when the user hasn't
 * onboarded yet (no row in `companies`). Callers decide whether to redirect
 * to the settings onboarding flow.
 *
 * Redirects to the login page when there is no session — this is a server
 * helper, so calling it from a page or action is safe.
 */
export async function requireCompany(): Promise<{
  userId: string;
  company: Company | null;
}> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    redirect("/login");
  }

  const company =
    (await db.query.companies.findFirst({
      where: eq(companies.userId, userId),
    })) ?? null;

  return { userId, company };
}

/**
 * Like `requireCompany` but throws when there is no company. Useful inside
 * server actions that are only reachable after onboarding.
 */
export async function requireCompanyOrFail(): Promise<{
  userId: string;
  company: Company;
}> {
  const { userId, company } = await requireCompany();
  if (!company) {
    throw new Error("NO_COMPANY");
  }
  return { userId, company };
}

// -------------------- Phase 7: two orthogonal gates --------------------
//
// "Onboarded" (interview finished) and "legal-complete" (company legal
// details present) are independent axes: onboarding finishes before legal
// details exist, and a backfilled pre-Phase-7 company is legal-complete
// without ever seeing the wizard. The workspace gate uses the first; only
// document issuance requires the second.

/** A company whose legal fields are present — safe to issue documents. */
export type LegalCompleteCompany = Company & {
  nameTh: string;
  tin: string;
  addressTh: string;
};

export function isOnboarded(company: Company | null): company is Company {
  return Boolean(company?.onboardingCompletedAt);
}

export function isLegalComplete(
  company: Company | null,
): company is LegalCompleteCompany {
  return Boolean(company?.nameTh && company?.tin && company?.addressTh);
}

/**
 * Workspace gate: redirects to the onboarding wizard until the interview
 * has been completed (or skipped — skip also stamps the timestamp).
 *
 * NOTE: pages still use the legacy company-row gate until the wizard route
 * ships; the flip to this helper happens atomically with that deploy.
 */
export async function requireOnboarded(locale: string): Promise<{
  userId: string;
  company: Company;
}> {
  const { userId, company } = await requireCompany();
  if (!company || !isOnboarded(company)) {
    redirect(`/${locale}/onboarding`);
  }
  return { userId, company };
}

import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

import { requireCompany, isOnboarded } from "@/lib/queries/company";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Already onboarded (incl. backfilled pre-Phase-7 users) → straight to
  // the workspace; profile edits live in Settings. Phase 11's re-run for a
  // newly formed company will revisit this.
  const { company } = await requireCompany();
  if (isOnboarded(company)) {
    redirect(`/${locale}/dashboard`);
  }

  return <OnboardingWizard />;
}

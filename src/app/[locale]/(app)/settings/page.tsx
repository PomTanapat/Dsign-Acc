import { getTranslations, setRequestLocale } from "next-intl/server";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { BusinessProfileForm } from "@/components/forms/business-profile-form";
import { CompanyForm } from "@/components/forms/company-form";
import { requireOnboarded } from "@/lib/queries/company";
import { getWorkspaceCounts } from "@/lib/queries/dashboard";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ onboarding?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { company } = await requireOnboarded(locale);
  const t = await getTranslations("Settings");

  const { onboarding } = await searchParams;
  // requireOnboarded guarantees a company row, so the banner is driven by the
  // ?onboarding=1 flag alone (legal-completion nudge from the issuing pages).
  const showOnboardingBanner = onboarding === "1";

  // "You seem comfortable — switch to Fast?" only after real usage
  // (≥5 issued documents), never as a day-one nag.
  const counts = await getWorkspaceCounts();
  const issuedCount =
    counts.quotation + counts.invoice + counts.receipt + counts.wht;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {showOnboardingBanner && (
        <Alert variant="info">
          <AlertDescription>{t("onboardingBanner")}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-lg border bg-background p-6">
        <BusinessProfileForm
          industry={company.industry}
          vatRegistered={company.vatRegistered}
          paysOthers={company.paysOthers}
          guidanceMode={company.guidanceMode}
          suggestFast={issuedCount >= 5}
        />
      </div>

      <div className="rounded-lg border bg-background p-6">
        <CompanyForm initialValues={company} />
      </div>
    </div>
  );
}

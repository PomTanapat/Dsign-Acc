import { getTranslations, setRequestLocale } from "next-intl/server";

import { PitForm } from "@/components/forms/pit-form";
import { requireOnboarded } from "@/lib/queries/company";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireOnboarded(locale);
  const t = await getTranslations({ locale, namespace: "PitForm" });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>
      <PitForm />
    </div>
  );
}

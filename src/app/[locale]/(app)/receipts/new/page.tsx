import { redirect } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";

import { DocumentForm } from "@/components/forms/document-form";
import { getCustomers } from "@/app/actions/customers";
import { getItems } from "@/app/actions/items";
import { isLegalComplete, requireOnboarded } from "@/lib/queries/company";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { company } = await requireOnboarded(locale);
  // Issuing needs the company's legal identity — finish it in Settings first.
  if (!isLegalComplete(company)) redirect(`/${locale}/settings?onboarding=1`);

  const t = await getTranslations("Receipts");
  const [customers, items] = await Promise.all([getCustomers(), getItems()]);

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-semibold">{t("newTitle")}</h1>
      <DocumentForm type="receipt" customers={customers} items={items} />
    </div>
  );
}

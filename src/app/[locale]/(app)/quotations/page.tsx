import { setRequestLocale } from "next-intl/server";

import { DocumentsClient } from "@/components/app/documents-client";
import { getDocuments } from "@/app/actions/documents";
import { requireOnboarded } from "@/lib/queries/company";
import { industryConfig } from "@/lib/guidance/industry-config";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { company } = await requireOnboarded(locale);

  const docs = await getDocuments("quotation");
  const isPrimary =
    industryConfig(company.industry).primaryDocType === "quotation";
  return (
    <DocumentsClient type="quotation" documents={docs} isPrimary={isPrimary} />
  );
}

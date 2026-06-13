import { setRequestLocale } from "next-intl/server";

import { DocumentsClient } from "@/components/app/documents-client";
import { getDocuments } from "@/app/actions/documents";
import { requireOnboarded } from "@/lib/queries/company";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireOnboarded(locale);

  const docs = await getDocuments("receipt");
  return <DocumentsClient type="receipt" documents={docs} />;
}

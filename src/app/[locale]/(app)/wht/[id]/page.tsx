import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { WhtDetailClient } from "@/components/app/wht-detail-client";
import { getWhtCertificate } from "@/app/actions/wht";
import { requireOnboarded } from "@/lib/queries/company";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  await requireOnboarded(locale);

  const certificate = await getWhtCertificate(id);
  if (!certificate) notFound();

  return <WhtDetailClient certificate={certificate} locale={locale} />;
}

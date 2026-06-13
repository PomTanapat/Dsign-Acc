import { setRequestLocale } from "next-intl/server";

import { WhtClient } from "@/components/app/wht-client";
import { getWhtCertificates } from "@/app/actions/wht";
import { requireOnboarded } from "@/lib/queries/company";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireOnboarded(locale);

  const certificates = await getWhtCertificates();
  return <WhtClient certificates={certificates} />;
}

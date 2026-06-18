import { setRequestLocale } from "next-intl/server";

import { CustomersClient } from "@/components/app/customers-client";
import { getCustomers } from "@/app/actions/customers";
import { requireOnboarded } from "@/lib/queries/company";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Workspace gate: the onboarding interview must be completed (or skipped)
  // first. Kept per-page (not in the layout) to avoid duplicate auth()
  // round-trips — see the original design note.
  await requireOnboarded(locale);

  const customers = await getCustomers();
  return <CustomersClient customers={customers} />;
}

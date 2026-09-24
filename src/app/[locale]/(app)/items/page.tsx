import { setRequestLocale } from "next-intl/server";

import { ItemsClient } from "@/components/app/items-client";
import { getItems } from "@/app/actions/items";
import { requireOnboarded } from "@/lib/queries/company";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  await requireOnboarded(locale);

  const items = await getItems();
  return <ItemsClient items={items} />;
}

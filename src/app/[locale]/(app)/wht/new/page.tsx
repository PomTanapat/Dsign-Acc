import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { setRequestLocale, getTranslations } from "next-intl/server";

import { WhtForm, type InvoicePrefill } from "@/components/forms/wht-form";
import { getCustomers } from "@/app/actions/customers";
import { isLegalComplete, requireOnboarded } from "@/lib/queries/company";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import type { CustomerSnapshot } from "@/lib/documents/types";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ fromInvoice?: string }>;
}) {
  const { locale } = await params;
  const { fromInvoice } = await searchParams;
  setRequestLocale(locale);
  const { company } = await requireOnboarded(locale);
  // Issuing needs the company's legal identity — finish it in Settings first.
  if (!isLegalComplete(company)) redirect(`/${locale}/settings?onboarding=1`);

  const t = await getTranslations("Wht");
  const customers = await getCustomers();

  // Optional prefill from an invoice. We pull the invoice once on the
  // server and pass a small projection down to the client form.
  let prefill: InvoicePrefill | null = null;
  if (fromInvoice) {
    const inv = await db.query.documents.findFirst({
      where: and(
        eq(documents.id, fromInvoice),
        eq(documents.companyId, company.id),
        eq(documents.type, "invoice"),
      ),
    });
    if (inv) {
      const snap = inv.customerSnapshot as CustomerSnapshot;
      // jsonPayload carries the doc-level whtRate captured at issuance.
      const payload = inv.jsonPayload as { whtRate?: number | null };
      prefill = {
        invoiceId: inv.id,
        runningNumber: inv.runningNumber,
        customerId: inv.customerId ?? "",
        customerName: snap?.name ?? "",
        subtotal: Number(inv.subtotal),
        whtRate: payload?.whtRate ?? null,
      };
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-semibold">{t("newTitle")}</h1>
      <WhtForm customers={customers} prefill={prefill} locale={locale} />
    </div>
  );
}

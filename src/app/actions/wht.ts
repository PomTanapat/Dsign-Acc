"use server";

import { revalidatePath } from "next/cache";
import { and, desc, eq, ne } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  customers,
  documents,
  whtCertificates,
  type WhtCertificateRow,
  type WhtIncomeLine,
} from "@/lib/db/schema";
import { isLegalComplete, requireCompany } from "@/lib/queries/company";
import { whtCertificateInputSchema } from "@/lib/validation/wht";
import { calculateWhtLine, calculateWhtTotals } from "@/lib/documents/wht-calc";
import { nextRunningNumber } from "@/lib/documents/numbering";
import type {
  CompanySnapshot,
  CustomerSnapshot,
} from "@/lib/documents/types";

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function getWhtCertificates(): Promise<WhtCertificateRow[]> {
  const { company } = await requireCompany();
  if (!company) return [];

  return db.query.whtCertificates.findMany({
    where: eq(whtCertificates.companyId, company.id),
    orderBy: [desc(whtCertificates.issuedAt), desc(whtCertificates.createdAt)],
  });
}

export async function getWhtCertificate(
  id: string,
): Promise<WhtCertificateRow | null> {
  const { company } = await requireCompany();
  if (!company) return null;

  const row = await db.query.whtCertificates.findFirst({
    where: and(
      eq(whtCertificates.id, id),
      eq(whtCertificates.companyId, company.id),
    ),
  });
  return row ?? null;
}

export async function createWhtCertificate(
  input: unknown,
): Promise<ActionResult<{ certificateId: string }>> {
  const { company } = await requireCompany();
  if (!company) return { success: false, error: "noCompany" };
  // Issuing needs the legal identity on the certificate — name, TIN, address.
  // (Phase 7: onboarding can finish before these exist.)
  if (!isLegalComplete(company)) {
    return { success: false, error: "companyIncomplete" };
  }

  const parsed = whtCertificateInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "validation",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }
  const data = parsed.data;

  // Cross-tenant safety: customer must belong to this company.
  const customer = await db.query.customers.findFirst({
    where: and(
      eq(customers.id, data.customerId),
      eq(customers.companyId, company.id),
    ),
  });
  if (!customer) return { success: false, error: "customerNotFound" };

  // Verify the linked invoice (if any) belongs to this company *and* is
  // actually an invoice — receipts/quotations don't trigger WHT.
  if (data.invoiceId) {
    const invoice = await db.query.documents.findFirst({
      where: and(
        eq(documents.id, data.invoiceId),
        eq(documents.companyId, company.id),
        eq(documents.type, "invoice"),
      ),
    });
    if (!invoice) return { success: false, error: "invoiceNotFound" };
  }

  // Sanity: spec passes formType explicitly. Reject if it contradicts the
  // customer's juristic status to prevent forms going out under the wrong
  // ภ.ง.ด. number. A juristic payee must be on ภ.ง.ด. 53; natural on 3.
  const expected = customer.isJuristic ? "pnd53" : "pnd3";
  if (data.formType !== expected) {
    return { success: false, error: "formTypeMismatch" };
  }

  // Recompute every line server-side — never trust client math.
  const canonicalLines: WhtIncomeLine[] = data.lines.map((l) => {
    const { withheldAmount } = calculateWhtLine(l.grossAmount, l.rate);
    return {
      code: l.code as WhtIncomeLine["code"],
      description: l.description,
      paymentDate: l.paymentDate,
      grossAmount: l.grossAmount,
      rate: l.rate,
      withheldAmount,
    };
  });
  const totals = calculateWhtTotals(canonicalLines);

  const customerSnapshot: CustomerSnapshot = {
    name: customer.name,
    tin: customer.tin,
    branchCode: customer.branchCode,
    isJuristic: customer.isJuristic,
    address: customer.address,
    email: customer.email,
    phone: customer.phone,
  };
  const companySnapshot: CompanySnapshot = {
    nameTh: company.nameTh,
    nameEn: company.nameEn,
    tin: company.tin,
    branchCode: company.branchCode,
    addressTh: company.addressTh,
    addressEn: company.addressEn,
    phone: company.phone,
    email: company.email,
    logoUrl: company.logoUrl,
    signatureUrl: company.signatureUrl,
  };

  const year = new Date(data.paymentDate).getUTCFullYear();

  try {
    const certificateId = await db.transaction(async (tx) => {
      const runningNumber = await nextRunningNumber(
        tx,
        company.id,
        "wht",
        year,
      );

      const [inserted] = await tx
        .insert(whtCertificates)
        .values({
          companyId: company.id,
          customerId: customer.id,
          invoiceId: data.invoiceId,
          runningNumber,
          year,
          formType: data.formType,
          customerSnapshot,
          companySnapshot,
          incomeTypes: canonicalLines,
          paymentDate: data.paymentDate,
          paymentMethod: data.paymentMethod,
          totalGross: totals.totalGross.toFixed(2),
          totalWithheld: totals.totalWithheld.toFixed(2),
          notes: data.notes,
          status: "issued",
          issuedAt: new Date(),
        })
        .returning({ id: whtCertificates.id });

      return inserted.id;
    });

    revalidatePath("/", "layout");
    return { success: true, data: { certificateId } };
  } catch (err) {
    console.error("createWhtCertificate failed", err);
    return { success: false, error: "generic" };
  }
}

export async function voidWhtCertificate(id: string): Promise<ActionResult> {
  const { company } = await requireCompany();
  if (!company) return { success: false, error: "noCompany" };

  try {
    // `ne(status, "void")` guards against double-void from a stale UI or
    // a direct API call. Mirrors the Phase 2 `voidDocument` contract.
    const [row] = await db
      .update(whtCertificates)
      .set({ status: "void", updatedAt: new Date() })
      .where(
        and(
          eq(whtCertificates.id, id),
          eq(whtCertificates.companyId, company.id),
          ne(whtCertificates.status, "void"),
        ),
      )
      .returning({ id: whtCertificates.id });
    if (!row) return { success: false, error: "notFound" };
    revalidatePath("/", "layout");
    return { success: true };
  } catch {
    return { success: false, error: "generic" };
  }
}

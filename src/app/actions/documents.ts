"use server";

import { revalidatePath } from "next/cache";
import { and, asc, desc, eq, ne } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  customers,
  documents,
  documentLines,
  type DocType,
  type DocumentRow,
  type DocumentLineRow,
} from "@/lib/db/schema";
import { isLegalComplete, requireCompany } from "@/lib/queries/company";
import { documentInputSchema } from "@/lib/validation/document";
import { calculateDocument } from "@/lib/documents/calc";
import { nextRunningNumber } from "@/lib/documents/numbering";
import type {
  CompanySnapshot,
  CustomerSnapshot,
  DocumentPayload,
} from "@/lib/documents/types";

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function getDocuments(type?: DocType): Promise<DocumentRow[]> {
  const { company } = await requireCompany();
  if (!company) return [];

  const where = type
    ? and(eq(documents.companyId, company.id), eq(documents.type, type))
    : eq(documents.companyId, company.id);

  return db.query.documents.findMany({
    where,
    orderBy: [desc(documents.issueDate), desc(documents.createdAt)],
  });
}

export async function getDocument(
  id: string,
): Promise<{ document: DocumentRow; lines: DocumentLineRow[] } | null> {
  const { company } = await requireCompany();
  if (!company) return null;

  const doc = await db.query.documents.findFirst({
    where: and(eq(documents.id, id), eq(documents.companyId, company.id)),
  });
  if (!doc) return null;

  const lines = await db.query.documentLines.findMany({
    where: eq(documentLines.documentId, doc.id),
    orderBy: [asc(documentLines.sortOrder)],
  });

  return { document: doc, lines };
}

export async function createDocument(input: unknown): Promise<
  ActionResult<{ documentId: string }>
> {
  const { company } = await requireCompany();
  if (!company) return { success: false, error: "noCompany" };
  // Issuing needs the legal identity on the document — name, TIN, address.
  // (Phase 7: onboarding can finish before these exist.)
  if (!isLegalComplete(company)) {
    return { success: false, error: "companyIncomplete" };
  }

  const parsed = documentInputSchema.safeParse(input);
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

  // Verify the customer belongs to this company (cross-tenant safety).
  const customer = await db.query.customers.findFirst({
    where: and(
      eq(customers.id, data.customerId),
      eq(customers.companyId, company.id),
    ),
  });
  if (!customer) return { success: false, error: "customerNotFound" };

  const { computedLines, totals } = calculateDocument(data.lines, data.whtRate);

  // Plan D10 — the real "can't issue an invalid doc" guarantee (the client
  // confirm dialog is bypassable). Issuing a document that charges VAT
  // without VAT registration is unlawful; "unsure" blocks too — the safe
  // default routes to help, not to a maybe-illegal document.
  if (totals.vatAmount > 0 && company.vatRegistered !== "yes") {
    return { success: false, error: "vatNotRegistered" };
  }

  // Snapshots — frozen at issuance so the PDF stays reproducible.
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

  const year = new Date(data.issueDate).getUTCFullYear();
  const currency = company.defaultCurrency;

  try {
    const documentId = await db.transaction(async (tx) => {
      const runningNumber = await nextRunningNumber(
        tx,
        company.id,
        data.type,
        year,
      );

      const payload: DocumentPayload = {
        type: data.type,
        runningNumber,
        issueDate: data.issueDate,
        dueDate: data.dueDate,
        currency,
        notes: data.notes,
        company: companySnapshot,
        customer: customerSnapshot,
        lines: computedLines,
        totals,
        whtRate: data.whtRate,
      };

      const [inserted] = await tx
        .insert(documents)
        .values({
          companyId: company.id,
          type: data.type,
          runningNumber,
          year,
          customerId: customer.id,
          issueDate: data.issueDate,
          dueDate: data.dueDate,
          status: "issued",
          customerSnapshot,
          companySnapshot,
          notes: data.notes,
          subtotal: totals.subtotal.toFixed(2),
          vatAmount: totals.vatAmount.toFixed(2),
          whtAmount: totals.whtAmount.toFixed(2),
          total: totals.total.toFixed(2),
          netPayable: totals.netPayable.toFixed(2),
          currency,
          jsonPayload: payload,
          issuedAt: new Date(),
        })
        .returning({ id: documents.id });

      // Insert lines in their declared sortOrder.
      await tx.insert(documentLines).values(
        computedLines.map((l) => ({
          documentId: inserted.id,
          sortOrder: l.sortOrder,
          itemId: l.itemId,
          description: l.description,
          quantity: l.quantity.toString(),
          unitPrice: l.unitPrice.toFixed(2),
          discountPercent: l.discountPercent.toFixed(2),
          vatRate: l.vatRate.toFixed(2),
          lineTotal: l.lineTotal.toFixed(2),
        })),
      );

      return inserted.id;
    });

    revalidatePath("/", "layout");
    return { success: true, data: { documentId } };
  } catch (err) {
    console.error("createDocument failed", err);
    return { success: false, error: "generic" };
  }
}

export async function voidDocument(id: string): Promise<ActionResult> {
  const { company } = await requireCompany();
  if (!company) return { success: false, error: "noCompany" };

  try {
    // ne(status, "void") prevents double-void on a concurrent double-click or
    // a direct API call that bypasses the UI guard. The status machine in
    // Phase 3+ depends on this being enforced at the DB layer.
    const [row] = await db
      .update(documents)
      .set({ status: "void", updatedAt: new Date() })
      .where(
        and(
          eq(documents.id, id),
          eq(documents.companyId, company.id),
          ne(documents.status, "void"),
        ),
      )
      .returning({ id: documents.id });
    if (!row) return { success: false, error: "notFound" };
    revalidatePath("/", "layout");
    return { success: true };
  } catch {
    return { success: false, error: "generic" };
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  documents,
  whtCertificates,
} from "@/lib/db/schema";
import { requireCompany } from "@/lib/queries/company";
import { getEmailFrom, getResend } from "@/lib/email/client";
import { buildDocumentEmail } from "@/lib/email/templates/document-email";
import {
  renderDocumentPdfBuffer,
  renderWhtPdfBuffer,
} from "@/lib/pdf/render";
import type {
  CompanySnapshot,
  CustomerSnapshot,
  DocumentPayload,
} from "@/lib/documents/types";
import type { WhtCertificatePdfData } from "@/components/pdf/wht-certificate-pdf";
import type {
  WhtFormType,
  WhtIncomeLine,
  WhtPaymentMethod,
} from "@/lib/documents/wht-types";

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

// Tiny RFC-5322-ish guard so we fail fast before involving Resend. Real
// validation lives at the provider; this only catches obvious typos.
function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

type SendDocumentInput = {
  documentId: string;
  toEmail?: string | null;
};

export async function sendDocumentEmail(
  input: SendDocumentInput,
): Promise<ActionResult<{ sentTo: string; sentAt: string }>> {
  const { company } = await requireCompany();
  if (!company) return { success: false, error: "noCompany" };

  const doc = await db.query.documents.findFirst({
    where: and(
      eq(documents.id, input.documentId),
      eq(documents.companyId, company.id),
    ),
  });
  if (!doc) return { success: false, error: "notFound" };
  if (doc.status === "void") return { success: false, error: "voided" };

  const snap = doc.customerSnapshot as CustomerSnapshot;
  const recipient = (input.toEmail ?? snap.email ?? "").trim();
  if (!recipient) return { success: false, error: "noEmail" };
  if (!isValidEmail(recipient)) return { success: false, error: "invalidEmail" };

  const payload = doc.jsonPayload as DocumentPayload;
  let pdfBuffer: Buffer;
  try {
    pdfBuffer = await renderDocumentPdfBuffer(payload);
  } catch (err) {
    console.error("sendDocumentEmail: PDF render failed", err);
    return { success: false, error: "pdfFailed" };
  }

  const email = buildDocumentEmail({
    type: { kind: "document", docType: payload.type },
    runningNumber: doc.runningNumber,
    company: doc.companySnapshot as CompanySnapshot,
    customer: snap,
  });

  try {
    const resend = getResend();
    const res = await resend.emails.send({
      from: getEmailFrom(),
      to: recipient,
      subject: email.subject,
      html: email.html,
      text: email.text,
      attachments: [
        {
          filename: `${doc.runningNumber}.pdf`,
          // Resend's attachment typing has flip-flopped between
          // string | Uint8Array and string | Buffer across SDK versions —
          // Buffer.from() satisfies both and is correct at runtime.
          content: Buffer.from(pdfBuffer),
        },
      ],
    });
    if (res.error) {
      console.error("sendDocumentEmail: Resend error", res.error);
      return { success: false, error: "sendFailed" };
    }
  } catch (err) {
    console.error("sendDocumentEmail: unexpected", err);
    return { success: false, error: "sendFailed" };
  }

  // Audit-trail write. We've already delivered the email, so any failure
  // here is data-trail-only — log loudly and still report success so the
  // UI matches reality ("the email was sent"). Operators can grep for the
  // warning to reconcile.
  const now = new Date();
  try {
    await db
      .update(documents)
      .set({ sentAt: now, lastSentTo: recipient, updatedAt: now })
      .where(eq(documents.id, doc.id));
  } catch (err) {
    console.error(
      "sendDocumentEmail: email delivered but audit-trail update failed",
      { documentId: doc.id, recipient, err },
    );
  }

  revalidatePath("/", "layout");
  return {
    success: true,
    data: { sentTo: recipient, sentAt: now.toISOString() },
  };
}

type SendWhtInput = {
  certificateId: string;
  toEmail?: string | null;
};

export async function sendWhtEmail(
  input: SendWhtInput,
): Promise<ActionResult<{ sentTo: string; sentAt: string }>> {
  const { company } = await requireCompany();
  if (!company) return { success: false, error: "noCompany" };

  const cert = await db.query.whtCertificates.findFirst({
    where: and(
      eq(whtCertificates.id, input.certificateId),
      eq(whtCertificates.companyId, company.id),
    ),
  });
  if (!cert) return { success: false, error: "notFound" };
  if (cert.status === "void") return { success: false, error: "voided" };

  const snap = cert.customerSnapshot as CustomerSnapshot;
  const recipient = (input.toEmail ?? snap.email ?? "").trim();
  if (!recipient) return { success: false, error: "noEmail" };
  if (!isValidEmail(recipient)) return { success: false, error: "invalidEmail" };

  const data: WhtCertificatePdfData = {
    runningNumber: cert.runningNumber,
    formType: cert.formType as WhtFormType,
    year: cert.year,
    paymentDate: cert.paymentDate,
    paymentMethod: cert.paymentMethod as WhtPaymentMethod,
    notes: cert.notes,
    totalGross: Number(cert.totalGross),
    totalWithheld: Number(cert.totalWithheld),
    company: cert.companySnapshot as CompanySnapshot,
    customer: snap,
    lines: cert.incomeTypes as WhtIncomeLine[],
  };

  let pdfBuffer: Buffer;
  try {
    pdfBuffer = await renderWhtPdfBuffer(data);
  } catch (err) {
    console.error("sendWhtEmail: PDF render failed", err);
    return { success: false, error: "pdfFailed" };
  }

  const email = buildDocumentEmail({
    type: { kind: "wht" },
    runningNumber: cert.runningNumber,
    company: cert.companySnapshot as CompanySnapshot,
    customer: snap,
  });

  try {
    const resend = getResend();
    const res = await resend.emails.send({
      from: getEmailFrom(),
      to: recipient,
      subject: email.subject,
      html: email.html,
      text: email.text,
      attachments: [
        {
          filename: `${cert.runningNumber}.pdf`,
          // See the document-email attachment note: Buffer.from() satisfies
          // every Resend SDK typing variant and is correct at runtime.
          content: Buffer.from(pdfBuffer),
        },
      ],
    });
    if (res.error) {
      console.error("sendWhtEmail: Resend error", res.error);
      return { success: false, error: "sendFailed" };
    }
  } catch (err) {
    console.error("sendWhtEmail: unexpected", err);
    return { success: false, error: "sendFailed" };
  }

  // Same audit-trail-only fallthrough as sendDocumentEmail above.
  const now = new Date();
  try {
    await db
      .update(whtCertificates)
      .set({ sentAt: now, lastSentTo: recipient, updatedAt: now })
      .where(eq(whtCertificates.id, cert.id));
  } catch (err) {
    console.error(
      "sendWhtEmail: email delivered but audit-trail update failed",
      { certificateId: cert.id, recipient, err },
    );
  }

  revalidatePath("/", "layout");
  return {
    success: true,
    data: { sentTo: recipient, sentAt: now.toISOString() },
  };
}

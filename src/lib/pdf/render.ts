import "server-only";

import { Readable } from "node:stream";
import React from "react";
import { renderToStream, type DocumentProps } from "@react-pdf/renderer";

import { DocumentPDF } from "@/components/pdf/document-pdf";
import {
  WhtCertificatePDF,
  type WhtCertificatePdfData,
} from "@/components/pdf/wht-certificate-pdf";
import type { DocumentPayload } from "@/lib/documents/types";

/**
 * Render a document/WHT certificate PDF to an in-memory Buffer.
 *
 * Used by both the HTTP route (which then streams the Buffer back as
 * NextResponse) and the email action (which passes the Buffer to Resend
 * as an attachment). Centralising it here means future tweaks to the PDF
 * shape only touch this file, and keeps the email action from having to
 * spawn an internal HTTP request just to render.
 */
async function streamToBuffer(
  stream: NodeJS.ReadableStream,
): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(
      typeof chunk === "string" ? Buffer.from(chunk) : (chunk as Buffer),
    );
  }
  return Buffer.concat(chunks);
}

export async function renderDocumentPdfBuffer(
  payload: DocumentPayload,
): Promise<Buffer> {
  // renderToStream's typing wants ReactElement<DocumentProps>, but our
  // components wrap <Document> one level down — the cast is safe.
  const stream = await renderToStream(
    React.createElement(DocumentPDF, {
      payload,
    }) as unknown as React.ReactElement<DocumentProps>,
  );
  return streamToBuffer(stream as unknown as Readable);
}

export async function renderWhtPdfBuffer(
  data: WhtCertificatePdfData,
): Promise<Buffer> {
  const stream = await renderToStream(
    React.createElement(WhtCertificatePDF, {
      data,
    }) as unknown as React.ReactElement<DocumentProps>,
  );
  return streamToBuffer(stream as unknown as Readable);
}

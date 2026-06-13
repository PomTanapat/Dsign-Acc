"use server";

import { eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { companies, leadEvents } from "@/lib/db/schema";
import { getEmailFrom, getResend } from "@/lib/email/client";
import { buildTalkRequestEmail } from "@/lib/email/templates/talk-request-email";
import { talkRequestSchema } from "@/lib/validation/lead";

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

/**
 * Funnel signal: the user opened the Talk-to-us dialog. Fire-and-forget —
 * callers must never await this on the UI path.
 */
export async function logTalkOpen(surface?: string): Promise<void> {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return;
    const company = await db.query.companies.findFirst({
      where: eq(companies.userId, userId),
      columns: { id: true },
    });
    await db.insert(leadEvents).values({
      userId,
      companyId: company?.id ?? null,
      kind: "talk_open",
      surface: surface ?? null,
    });
  } catch (err) {
    // A lost open-signal must never surface to the user.
    console.error("logTalkOpen failed", err);
  }
}

/**
 * The "we will be in charge" handoff (plan D19): persist the lead FIRST so
 * a request can never vanish, then notify the firm by email and stamp
 * `emailedAt` on success. Returns `emailed` so the dialog can fall back to
 * "call us now" when the notification path is down.
 */
export async function submitTalkRequest(
  input: unknown,
): Promise<ActionResult<{ emailed: boolean }>> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "unauthorized" };

  const parsed = talkRequestSchema.safeParse(input);
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

  const company = await db.query.companies.findFirst({
    where: eq(companies.userId, userId),
  });

  const [lead] = await db
    .insert(leadEvents)
    .values({
      userId,
      companyId: company?.id ?? null,
      kind: "talk_request",
      surface: data.surface ?? null,
      message: data.message?.trim() || null,
      contactChannel: data.contactChannel,
      contactValue: data.contactValue,
    })
    .returning({ id: leadEvents.id });

  // Notify the firm. The inbox is the de-facto lead queue until Phase 8 —
  // but the lead row above survives even if this send fails.
  let emailed = false;
  try {
    const to = process.env.TALK_TO_US_EMAIL;
    if (!to) throw new Error("TALK_TO_US_EMAIL is not set");
    const email = buildTalkRequestEmail({
      userEmail: session?.user?.email ?? "(no email)",
      companyName: company?.nameTh ?? company?.nameEn ?? null,
      surface: data.surface ?? null,
      message: data.message ?? null,
      contactChannel: data.contactChannel,
      contactValue: data.contactValue,
    });
    const res = await getResend().emails.send({
      from: getEmailFrom(),
      to,
      subject: email.subject,
      html: email.html,
      text: email.text,
    });
    if (res.error) throw res.error;
    emailed = true;
    await db
      .update(leadEvents)
      .set({ emailedAt: new Date() })
      .where(eq(leadEvents.id, lead.id));
  } catch (err) {
    console.error("submitTalkRequest: notification email failed", err);
  }

  return { success: true, data: { emailed } };
}

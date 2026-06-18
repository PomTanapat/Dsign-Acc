import { NextResponse, type NextRequest } from "next/server";
import { and, asc, eq, gte } from "drizzle-orm";

import { db } from "@/lib/db";
import { leadEvents, users } from "@/lib/db/schema";
import { getEmailFrom, getResend } from "@/lib/email/client";

// Daily digest of unhandled "Talk to us" leads (plan D19): until the Phase 8
// back-office exists, the firm's inbox is the lead queue — this catches any
// lead whose per-request notification email failed (emailedAt null) plus
// everything still status='new', so nothing rots unseen in the table.
//
// Trigger via scheduler (Railway cron / external pinger):
//   GET /api/cron/leads-digest  with  Authorization: Bearer $CRON_SECRET
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  // Without a configured secret the endpoint plays dead — never exposed.
  if (!secret) return new NextResponse("Not found", { status: 404 });
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const to = process.env.TALK_TO_US_EMAIL;
  if (!to) {
    return NextResponse.json(
      { error: "TALK_TO_US_EMAIL is not set" },
      { status: 500 },
    );
  }

  // ponytail: rolling 48h window instead of all status='new'. Nothing flips
  // status to 'handled' until Phase 8, so an all-time query would re-send the
  // same backlog every day until the firm tunes it out. 48h tolerates one
  // missed run; daily cadence means no lead is skipped.
  const cutoff = new Date(Date.now() - 1000 * 60 * 60 * 48);
  const open = await db
    .select({ lead: leadEvents, email: users.email })
    .from(leadEvents)
    .leftJoin(users, eq(users.id, leadEvents.userId))
    .where(and(eq(leadEvents.status, "new"), gte(leadEvents.createdAt, cutoff)))
    .orderBy(asc(leadEvents.createdAt));
  // talk_open rows are funnel telemetry, not actionable requests.
  const actionable = open.filter((r) => r.lead.kind !== "talk_open");

  if (actionable.length === 0) {
    return NextResponse.json({ sent: false, count: 0 });
  }

  const lines = actionable.map(({ lead: l, email }) => {
    // Soft signals (incorporation_interest) carry no contactValue — fall back
    // to the account email so the firm can always reach the person.
    const reach = l.contactValue
      ? `${l.contactChannel ?? "?"}: ${l.contactValue}`
      : email
        ? `email: ${email}`
        : "no contact captured";
    const flag = l.emailedAt ? "" : " [no instant email — digest only]";
    return `- [${l.kind}] ${l.createdAt.toISOString()} · ${reach} · surface: ${l.surface ?? "—"}${l.message ? ` · "${l.message}"` : ""}${flag}`;
  });

  const res = await getResend().emails.send({
    from: getEmailFrom(),
    to,
    subject: `New leads (last 48h): ${actionable.length}`,
    text: [
      `${actionable.length} lead(s) from the last 48 hours:`,
      "",
      ...lines,
      "",
      "Reach out within a business day. (Phase 8 back-office will track status; for now this digest re-lists the rolling window.)",
    ].join("\n"),
  });
  if (res.error) {
    return NextResponse.json({ error: String(res.error) }, { status: 502 });
  }

  return NextResponse.json({ sent: true, count: actionable.length });
}

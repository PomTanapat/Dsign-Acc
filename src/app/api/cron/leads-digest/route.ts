import { NextResponse, type NextRequest } from "next/server";
import { asc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { leadEvents } from "@/lib/db/schema";
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

  const open = await db.query.leadEvents.findMany({
    where: eq(leadEvents.status, "new"),
    orderBy: [asc(leadEvents.createdAt)],
  });
  // talk_open rows are funnel telemetry, not actionable requests.
  const actionable = open.filter((l) => l.kind !== "talk_open");

  if (actionable.length === 0) {
    return NextResponse.json({ sent: false, count: 0 });
  }

  const lines = actionable.map((l) => {
    const reach = l.contactValue
      ? `${l.contactChannel ?? "?"}: ${l.contactValue}`
      : "no contact captured";
    const flag = l.emailedAt ? "" : " [notification email failed]";
    return `- [${l.kind}] ${l.createdAt.toISOString()} · ${reach} · surface: ${l.surface ?? "—"}${l.message ? ` · "${l.message}"` : ""}${flag}`;
  });

  const res = await getResend().emails.send({
    from: getEmailFrom(),
    to,
    subject: `Open talk-to-us leads: ${actionable.length}`,
    text: [
      `There are ${actionable.length} unhandled lead(s):`,
      "",
      ...lines,
      "",
      "Mark them handled in the database (lead_events.status) until the Phase 8 back-office ships.",
    ].join("\n"),
  });
  if (res.error) {
    return NextResponse.json({ error: String(res.error) }, { status: 502 });
  }

  return NextResponse.json({ sent: true, count: actionable.length });
}

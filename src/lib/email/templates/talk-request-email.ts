// Internal notification to the firm when a user asks for help. Plain and
// scannable — this lands in the inbox that acts as the lead queue until the
// Phase 8 back-office exists.

export type TalkRequestEmailInput = {
  userEmail: string;
  companyName: string | null;
  surface: string | null;
  message: string | null;
  contactChannel: string;
  contactValue: string;
};

function esc(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function buildTalkRequestEmail(input: TalkRequestEmailInput): {
  subject: string;
  html: string;
  text: string;
} {
  const who = input.companyName ?? input.userEmail;
  const subject = `Talk-to-us request — ${who}`;

  const rows: Array<[string, string]> = [
    ["From", `${who} (${input.userEmail})`],
    ["Reach them via", `${input.contactChannel}: ${input.contactValue}`],
    ["Where they got stuck", input.surface ?? "—"],
    ["Message", input.message?.trim() || "—"],
  ];

  const html = `
    <div style="font-family: sans-serif; max-width: 560px;">
      <h2 style="color: #106070;">Talk-to-us request</h2>
      <p>A workspace user asked for help — first consult is free; please reach out within 1 business day.</p>
      <table style="border-collapse: collapse; width: 100%;">
        ${rows
          .map(
            ([k, v]) =>
              `<tr><td style="padding: 6px 12px 6px 0; color: #6b7e86; vertical-align: top; white-space: nowrap;">${esc(k)}</td><td style="padding: 6px 0;">${esc(v)}</td></tr>`,
          )
          .join("")}
      </table>
    </div>`;

  const text = [
    "Talk-to-us request",
    ...rows.map(([k, v]) => `${k}: ${v}`),
  ].join("\n");

  return { subject, html, text };
}

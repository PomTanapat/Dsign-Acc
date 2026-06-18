// Draft-badge gate (plan D6): glossary copy ships flagged `draft: true`
// until a Dsign CPA signs each term off. Badges render only while this env
// flag is on — keep it "true" in dev/staging; production launch requires
// every term reviewed, at which point the flag goes off (or all flags are
// false and the badges disappear on their own).
//
// NEXT_PUBLIC_* is inlined at build time, so this is safe on the client.
export const SHOW_DRAFT_BADGES =
  process.env.NEXT_PUBLIC_SHOW_DRAFT_BADGES === "true";

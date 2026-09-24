// Dsign service pricing shown on the onboarding Finish screen.
//
// EVERY figure here is a FIRST-PASS ESTIMATE pending the firm's sign-off
// (plan D7b) — day-one cost transparency is the concrete proof of the
// honesty principle, so publishing the firm's own wrong prices would be
// worse than none. PRICING_CONFIRMED gates an "estimate" watermark on every
// surface that renders these numbers; flipping it to true is a deliberate,
// reviewable act of the firm confirming its prices.
//
// TODO(owner): verify each figure with the firm, then flip PRICING_CONFIRMED.
export const PRICING_CONFIRMED = false;

export const DSIGN_PRICING = {
  /** Company registration with Dsign — incl. government fees + VAT/employer registration when needed. */
  setupRegistration: 20_000,
  /** Bookkeeping + monthly tax filings (PP30, PND 1/3/53) — from ฿2,500/mo. */
  recurringBookkeeping: 30_000,
  /** Year-end financial statements — CIT return (PND 50) + DBD filing. */
  recurringYearEnd: 8_000,
  /** Statutory CPA audit — required by law for every company, even loss years. */
  recurringAudit: 8_000,
} as const;

export const PRICING_RECURRING_TOTAL =
  DSIGN_PRICING.recurringBookkeeping +
  DSIGN_PRICING.recurringYearEnd +
  DSIGN_PRICING.recurringAudit;

export const PRICING_YEAR1_TOTAL =
  DSIGN_PRICING.setupRegistration + PRICING_RECURRING_TOTAL;

/** '฿' + en-US thousands format, matching the prototype's obBaht(). */
export function baht(n: number): string {
  return "฿" + n.toLocaleString("en-US");
}

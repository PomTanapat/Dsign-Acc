// Drivers-first incorporation "fit indication" for the onboarding Finish
// screen (plan D7, owner-confirmed 2026-06-12).
//
// WHY THIS IS NOT THE PROTOTYPE'S buildEvaluation():
//   The prototype scored revenue/profit BANDS into a verdict. A band-based
//   verdict can be contradicted later by the full Phase 10 assessment
//   (compareIncorporation() with real expenses/take-home) — "we said yes,
//   now we say no" is the exact honesty failure the product cannot afford.
//   So the verdict here derives ONLY from qualitative drivers (liability,
//   credibility, funding, corp clients, hiring) — stable signals no tax
//   computation can overturn — and the tax question routes to the real
//   calculation instead of getting a guessed answer:
//     · tax-only / unsure-only answers → the neutral "numbers" state
//       ("let's run your numbers"), never an amber "probably not yet".
//   netProfit is stored for Phase 10 prefill but NEVER affects the verdict.
//
// Phase 10 absorbs this module: its assessment replaces the "numbers" CTA
// with the live compareIncorporation() result.

export type TeaserVerdict = "likely" | "considering" | "numbers" | "none";

export type IncorporationDriver =
  | "corpClients"
  | "credibility"
  | "liability"
  | "funding"
  | "tax"
  | "hiring"
  | "unsure";

export type TeaserInput = {
  whyIncorporate: IncorporationDriver[];
  clientType?: "corp" | "mixed" | "individual";
  netProfit?: "low" | "mid" | "high" | "vhigh" | "unsure";
};

export type ProKey =
  | "corpClients"
  | "corpCustomers"
  | "credibility"
  | "liability"
  | "funding"
  | "hiring"
  | "smeRates";

export type ConKey = "cost" | "discipline" | "dividends";

export type TeaserResult = {
  verdict: TeaserVerdict;
  /** Qualitative-driver score — documented so the owner can review the mapping. */
  score: number;
  pros: ProKey[];
  cons: ConKey[];
};

const QUALITATIVE: ReadonlySet<IncorporationDriver> = new Set([
  "corpClients",
  "credibility",
  "liability",
  "funding",
  "hiring",
]);

export function buildTeaser(input: TeaserInput): TeaserResult {
  const why = input.whyIncorporate;
  const ct = input.clientType;
  const has = (k: IncorporationDriver) => why.includes(k);

  // Qualitative weights only (prototype weights, minus every netProfit term).
  let score = 0;
  if (has("corpClients")) score += 2;
  if (ct === "corp") score += 2;
  if (ct === "mixed") score += 1;
  if (has("funding")) score += 2;
  if (has("liability")) score += 1;
  if (has("credibility")) score += 1;
  if (has("hiring")) score += 1;

  const pros: ProKey[] = [];
  if (has("corpClients") || ct === "corp" || ct === "mixed")
    pros.push("corpClients");
  if (ct === "corp") pros.push("corpCustomers");
  if (has("credibility")) pros.push("credibility");
  if (has("liability")) pros.push("liability");
  if (has("funding")) pros.push("funding");
  if (has("hiring")) pros.push("hiring");
  // Factual rate information pointing at the real calculation — included as
  // a pro line, deliberately excluded from the score.
  if (input.netProfit === "high" || input.netProfit === "vhigh")
    pros.push("smeRates");

  // Cons are unconditional facts about running a company. (The prototype's
  // "individual may pay less tax" con lives in the counterpoints instead —
  // it is a tax-direction claim, not a fact about company life.)
  const cons: ConKey[] = ["cost", "discipline", "dividends"];

  const qualitativeAnswered =
    why.some((k) => QUALITATIVE.has(k)) || ct === "corp" || ct === "mixed";

  let verdict: TeaserVerdict;
  if (!qualitativeAnswered && (has("tax") || has("unsure"))) {
    // They asked about the numbers (or asked for help) — answer with the
    // calculation path, not a guessed verdict in either direction.
    verdict = "numbers";
  } else if (score >= 4) {
    verdict = "likely";
  } else if (score >= 1) {
    verdict = "considering";
  } else {
    verdict = "none";
  }

  return { verdict, score, pros, cons };
}

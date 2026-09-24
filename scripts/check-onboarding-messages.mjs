// One-shot verification that the Onboarding/Industries message catalogs
// cover every key the wizard + finish report consume, in BOTH locales.
// Run: node scripts/check-onboarding-messages.mjs
import { readFileSync } from "node:fs";

const en = JSON.parse(readFileSync("messages/en.json", "utf8"));
const th = JSON.parse(readFileSync("messages/th.json", "utf8"));

const get = (obj, path) =>
  path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);

// ---- the question config, mirrored (keep in sync with onboarding-questions.ts) ----
const QUESTIONS = {
  industry: [], // labels via Industries namespace
  nationality: ["thai", "foreign"],
  entityType: ["individual", "juristic", "thinking"],
  revenueBand: ["under", "near", "over", "unsure"],
  vatRegistered: ["yes", "no", "unsure"],
  paysOthers: ["yes", "no"],
  guidanceMode: ["guided", "guided2", "fast"],
  ownershipStructure: ["thaiMajority", "boi", "amity", "branch", "unsure"],
  workPermitNeed: ["yes", "no", "unsure"],
  decideOffer: ["yes", "skip"],
  whyIncorporate: [
    "corpClients",
    "credibility",
    "liability",
    "funding",
    "tax",
    "hiring",
    "unsure",
  ],
  clientType: ["corp", "mixed", "individual"],
  netProfit: ["low", "mid", "high", "vhigh", "unsure"],
};
const NO_SUB = new Set(["whyIncorporate"]);
// Options whose sub-copy is deliberately blank in the design.
const NO_SUB_OPTS = new Set([
  "revenueBand.over",
  "clientType.mixed",
  "netProfit.mid",
  "netProfit.vhigh",
]);

const keys = [
  "Onboarding.aside.title",
  "Onboarding.aside.intro",
  "Onboarding.aside.reassure1",
  "Onboarding.aside.reassure2",
  "Onboarding.aside.reassure3",
  "Onboarding.progress.counter",
  "Onboarding.nav.back",
  "Onboarding.nav.next",
  "Onboarding.nav.finish",
  "Onboarding.nav.skipAll",
  "Onboarding.resume.title",
  "Onboarding.resume.sub",
  "Onboarding.resume.continue",
  "Onboarding.resume.startOver",
  "Onboarding.foreignNote",
  "Onboarding.foreignTag",
  "Onboarding.multiNote",
];

for (const [id, opts] of Object.entries(QUESTIONS)) {
  keys.push(`Onboarding.stepLabels.${id}`);
  keys.push(`Onboarding.q.${id}.q`, `Onboarding.q.${id}.help`);
  for (const val of opts) {
    keys.push(`Onboarding.q.${id}.opts.${val}.label`);
    if (!NO_SUB.has(id) && !NO_SUB_OPTS.has(`${id}.${val}`))
      keys.push(`Onboarding.q.${id}.opts.${val}.sub`);
  }
}

const F = "Onboarding.finish";
keys.push(
  `${F}.kickerAssessment`,
  `${F}.kickerSummary`,
  `${F}.titleAssessment`,
  `${F}.titleSummary`,
  `${F}.prosTitle`,
  `${F}.consTitle`,
  `${F}.prosEmpty`,
  `${F}.enterWorkspace`,
  `${F}.talkCpa`,
  `${F}.disclaimer`,
  `${F}.error`,
);
for (const v of ["likely", "considering", "numbers", "none", "foreign", "juristic"])
  keys.push(`${F}.verdict.${v}.label`, `${F}.verdict.${v}.headline`, `${F}.verdict.${v}.body`);
for (const p of ["corpClients", "corpCustomers", "credibility", "liability", "funding", "hiring", "smeRates"])
  keys.push(`${F}.pros.${p}`);
for (const c of ["cost", "discipline", "dividends"]) keys.push(`${F}.cons.${c}`);
for (const k of [
  "kicker", "titleIf", "titleAlready", "providerBadge", "estimateBadge",
  "oneTimeTitle", "yearlyTitle", "setupLabel", "setupNote",
  "bookkeepingLabel", "bookkeepingNote", "yearEndLabel", "yearEndNote",
  "auditLabel", "auditNote", "year1Total", "yearlyTotal", "perYear",
  "foreignSetupNote", "counterIndividual", "counterForeign", "counterScale",
])
  keys.push(`${F}.cost.${k}`);
for (const k of ["title", "industry", "guidance", "guidanceGuided", "guidanceFast", "vat", "vatOn", "vatOff", "wht", "whtOn", "whtOff"])
  keys.push(`${F}.configured.${k}`);
keys.push(`${F}.foreignEss.title`, `${F}.foreignEss.sub`, `${F}.foreignEss.tagSetup`, `${F}.foreignEss.tagTax`);
for (const o of ["thaiMajority", "boi", "amity", "branch", "unsure"])
  keys.push(`${F}.foreignEss.ownership.${o}.t`, `${F}.foreignEss.ownership.${o}.d`);
for (const p of ["yes", "no", "unsure"])
  keys.push(`${F}.foreignEss.permit.${p}.t`, `${F}.foreignEss.permit.${p}.d`);
keys.push(`${F}.foreignEss.cit.t`, `${F}.foreignEss.cit.d`, `${F}.foreignEss.dividend.t`, `${F}.foreignEss.dividend.d`);

for (const ind of ["freelance", "online", "food", "retail", "prof", "contractor", "salon", "other"])
  keys.push(`Industries.${ind}.label`);

let missing = 0;
for (const k of keys) {
  for (const [name, obj] of [["en", en], ["th", th]]) {
    const v = get(obj, k);
    if (typeof v !== "string" || v.length === 0) {
      console.log(`MISSING [${name}] ${k}`);
      missing++;
    }
  }
}
console.log(missing === 0 ? `ok — ${keys.length} keys × 2 locales` : `${missing} missing`);
process.exit(missing === 0 ? 0 : 1);

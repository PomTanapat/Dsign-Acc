// Onboarding interview config — the typed port of the prototype's
// OB_Q / OB_FOREIGN / OB_DECIDE (p7-strings.jsx). Question `id` IS the
// profile field it sets; all labels/help/notes live in the `Onboarding`
// i18n namespace under `q.{id}.*` (options: `q.{id}.opts.{val}.label|sub`).
//
// Deviation from the prototype (plan D17, owner-confirmed): the three
// incorporation-decision questions are appended only for users "thinking
// about a company". Users who answered "just myself" get ONE optional offer
// screen (`decideOffer`) instead of three mandatory extra questions — the
// salon owner still onboards in under 3 minutes, and nobody gets a
// why-incorporate interview they didn't ask for.

import type { LucideIcon } from "lucide-react";
import {
  Award,
  BadgeCheck,
  Briefcase,
  Building,
  Building2,
  ChartColumn,
  Circle,
  CircleCheck,
  CircleHelp,
  Coffee,
  Flag,
  Globe,
  HandHeart,
  Handshake,
  HardHat,
  Landmark,
  Lightbulb,
  Palette,
  Percent,
  Scissors,
  Shield,
  ShoppingBag,
  SkipForward,
  Sparkles,
  Store,
  TrendingUp,
  User,
  Users,
  UsersRound,
  Zap,
} from "lucide-react";

import type { GlossaryTermKey } from "@/lib/guidance/glossary";

export type QuestionKind = "single" | "multi";

export type QuestionOption = {
  val: string;
  icon: LucideIcon;
  /** A few options have deliberately blank sub-copy in the design. */
  noSub?: true;
};

export type OnboardingQuestion = {
  id: string;
  kind: QuestionKind;
  /** Renders an inline guided Explainer under the question. */
  term?: GlossaryTermKey;
  /** Option grid columns on desktop (industry uses 2). */
  cols?: 1 | 2;
  options: QuestionOption[];
};

export const INDUSTRY_ORDER = [
  "freelance",
  "online",
  "food",
  "retail",
  "prof",
  "contractor",
  "salon",
  "other",
] as const;

export const INDUSTRY_ICONS: Record<
  (typeof INDUSTRY_ORDER)[number],
  LucideIcon
> = {
  freelance: Palette,
  online: ShoppingBag,
  food: Coffee,
  retail: Store,
  prof: Briefcase,
  contractor: HardHat,
  salon: Scissors,
  other: CircleHelp,
};

export const BASE_QUESTIONS: OnboardingQuestion[] = [
  {
    id: "industry",
    kind: "single",
    cols: 2,
    options: INDUSTRY_ORDER.map((k) => ({ val: k, icon: INDUSTRY_ICONS[k] })),
  },
  {
    id: "nationality",
    kind: "single",
    options: [
      { val: "thai", icon: Flag },
      { val: "foreign", icon: Globe },
    ],
  },
  {
    id: "entityType",
    kind: "single",
    term: "juristic",
    options: [
      { val: "individual", icon: User },
      { val: "juristic", icon: Building2 },
      { val: "thinking", icon: Lightbulb },
    ],
  },
  {
    id: "revenueBand",
    kind: "single",
    term: "vatThreshold",
    options: [
      { val: "under", icon: Circle },
      { val: "near", icon: TrendingUp },
      { val: "over", icon: ChartColumn, noSub: true },
      { val: "unsure", icon: CircleHelp },
    ],
  },
  {
    id: "vatRegistered",
    kind: "single",
    term: "vat",
    options: [
      { val: "yes", icon: CircleCheck },
      { val: "no", icon: Circle },
      { val: "unsure", icon: CircleHelp },
    ],
  },
  {
    id: "paysOthers",
    kind: "single",
    term: "whtIssued",
    options: [
      { val: "yes", icon: UsersRound },
      { val: "no", icon: User },
    ],
  },
  {
    id: "guidanceMode",
    kind: "single",
    options: [
      { val: "guided", icon: HandHeart },
      { val: "guided2", icon: BadgeCheck },
      { val: "fast", icon: Zap },
    ],
  },
];

export const FOREIGN_QUESTIONS: OnboardingQuestion[] = [
  {
    id: "ownershipStructure",
    kind: "single",
    term: "foreignBusinessAct",
    options: [
      { val: "thaiMajority", icon: Users },
      { val: "boi", icon: Award },
      { val: "amity", icon: Handshake },
      { val: "branch", icon: Building },
      { val: "unsure", icon: CircleHelp },
    ],
  },
  {
    id: "workPermitNeed",
    kind: "single",
    term: "workPermit",
    options: [
      { val: "yes", icon: BadgeCheck },
      { val: "no", icon: Globe },
      { val: "unsure", icon: CircleHelp },
    ],
  },
];

export const DECIDE_OFFER: OnboardingQuestion = {
  id: "decideOffer",
  kind: "single",
  options: [
    { val: "yes", icon: Sparkles },
    { val: "skip", icon: SkipForward },
  ],
};

export const DECIDE_QUESTIONS: OnboardingQuestion[] = [
  {
    id: "whyIncorporate",
    kind: "multi",
    options: [
      { val: "corpClients", icon: Building2 },
      { val: "credibility", icon: BadgeCheck },
      { val: "liability", icon: Shield },
      { val: "funding", icon: Landmark },
      { val: "tax", icon: Percent },
      { val: "hiring", icon: Users },
      { val: "unsure", icon: CircleHelp },
    ],
  },
  {
    id: "clientType",
    kind: "single",
    options: [
      { val: "corp", icon: Building2 },
      { val: "mixed", icon: UsersRound, noSub: true },
      { val: "individual", icon: User },
    ],
  },
  {
    id: "netProfit",
    kind: "single",
    options: [
      { val: "low", icon: Circle },
      { val: "mid", icon: TrendingUp, noSub: true },
      { val: "high", icon: ChartColumn },
      { val: "vhigh", icon: ChartColumn, noSub: true },
      { val: "unsure", icon: CircleHelp },
    ],
  },
];

export type OnboardingAnswers = Record<string, string | string[] | undefined>;

/**
 * Assemble the question list for the current answers. Recomputed from
 * answers on every render and navigated BY QUESTION ID, not index — this
 * kills the prototype's `willTotal` compensation hack and survives every
 * branch flip (foreign → thai, entityType changes via Back).
 *
 * Branches:
 * - nationality = foreign → the two foreign questions slot in right after,
 *   and OB_DECIDE never appears (foreign owners operate via a company).
 * - entityType = thinking → the three incorporation questions append.
 * - entityType = individual → one optional offer screen; accepting appends
 *   the three questions (D17).
 */
export function buildQuestionList(
  ans: OnboardingAnswers,
): OnboardingQuestion[] {
  const isForeign = ans.nationality === "foreign";
  const list: OnboardingQuestion[] = [];
  for (const q of BASE_QUESTIONS) {
    list.push(q);
    if (q.id === "nationality" && isForeign) list.push(...FOREIGN_QUESTIONS);
  }
  if (!isForeign) {
    if (ans.entityType === "thinking") {
      list.push(...DECIDE_QUESTIONS);
    } else if (ans.entityType === "individual") {
      list.push(DECIDE_OFFER);
      if (ans.decideOffer === "yes") list.push(...DECIDE_QUESTIONS);
    }
  }
  return list;
}

const ALL_QUESTIONS: OnboardingQuestion[] = [
  ...BASE_QUESTIONS,
  ...FOREIGN_QUESTIONS,
  DECIDE_OFFER,
  ...DECIDE_QUESTIONS,
];

/**
 * Sanitize a restored draft against the CURRENT question config — a deploy
 * that renames a question id or option value must not resurrect invalid
 * answers into `onboardingAnswers` (Phase 8/10 consume that jsonb).
 */
export function sanitizeAnswers(raw: unknown): OnboardingAnswers {
  if (typeof raw !== "object" || raw === null) return {};
  const ans: OnboardingAnswers = {};
  for (const q of ALL_QUESTIONS) {
    const v = (raw as Record<string, unknown>)[q.id];
    if (v == null) continue;
    const valid = new Set(q.options.map((o) => o.val));
    if (q.kind === "multi") {
      if (Array.isArray(v)) {
        const kept = v.filter(
          (x): x is string => typeof x === "string" && valid.has(x),
        );
        if (kept.length > 0) ans[q.id] = kept;
      }
    } else if (typeof v === "string" && valid.has(v)) {
      ans[q.id] = v;
    }
  }
  return ans;
}

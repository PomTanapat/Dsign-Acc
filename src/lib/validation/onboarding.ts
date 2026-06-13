import { z } from "zod";

// Onboarding finish payload. The wizard can't submit unanswered required
// questions (Next stays disabled), so failures here mean a tampered or
// stale-draft payload — error keys, not prose.

const industryEnum = z.enum([
  "freelance",
  "online",
  "food",
  "retail",
  "prof",
  "contractor",
  "salon",
  "other",
]);

const driverEnum = z.enum([
  "corpClients",
  "credibility",
  "liability",
  "funding",
  "tax",
  "hiring",
  "unsure",
]);

export const onboardingInputSchema = z
  .object({
    industry: industryEnum,
    nationality: z.enum(["thai", "foreign"]),
    ownershipStructure: z
      .enum(["thaiMajority", "boi", "amity", "branch", "unsure"])
      .optional(),
    workPermitNeed: z.enum(["yes", "no", "unsure"]).optional(),
    entityType: z.enum(["individual", "juristic", "thinking"]),
    revenueBand: z.enum(["under", "near", "over", "unsure"]),
    vatRegistered: z.enum(["yes", "no", "unsure"]),
    paysOthers: z.enum(["yes", "no"]),
    guidanceMode: z.enum(["guided", "guided2", "fast"]),
    decideOffer: z.enum(["yes", "skip"]).optional(),
    whyIncorporate: z.array(driverEnum).max(7).optional(),
    clientType: z.enum(["corp", "mixed", "individual"]).optional(),
    netProfit: z.enum(["low", "mid", "high", "vhigh", "unsure"]).optional(),
  })
  .superRefine((v, ctx) => {
    if (v.nationality === "foreign") {
      if (!v.ownershipStructure) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["ownershipStructure"],
          message: "required",
        });
      }
      if (!v.workPermitNeed) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["workPermitNeed"],
          message: "required",
        });
      }
    }
  });

export type OnboardingInput = z.infer<typeof onboardingInputSchema>;

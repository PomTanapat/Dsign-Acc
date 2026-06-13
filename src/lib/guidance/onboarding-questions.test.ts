/**
 * Dynamic question-list assembly (id-based, plan D17) and draft
 * sanitization (deploy-safe localStorage restore, plan D12).
 */
import { describe, it, expect } from "vitest";

import {
  buildQuestionList,
  sanitizeAnswers,
} from "./onboarding-questions";

const ids = (ans: Parameters<typeof buildQuestionList>[0]) =>
  buildQuestionList(ans).map((q) => q.id);

describe("buildQuestionList", () => {
  it("thai + juristic → the 7 base questions only", () => {
    expect(ids({ nationality: "thai", entityType: "juristic" })).toHaveLength(7);
  });

  it("thai + thinking → base + the 3 incorporation questions (10)", () => {
    const list = ids({ nationality: "thai", entityType: "thinking" });
    expect(list).toHaveLength(10);
    expect(list.slice(-3)).toEqual(["whyIncorporate", "clientType", "netProfit"]);
  });

  it("thai + individual → base + ONE optional offer (8), not three forced questions", () => {
    const list = ids({ nationality: "thai", entityType: "individual" });
    expect(list).toHaveLength(8);
    expect(list[list.length - 1]).toBe("decideOffer");
  });

  it("individual accepting the offer appends the 3 questions (11)", () => {
    const list = ids({
      nationality: "thai",
      entityType: "individual",
      decideOffer: "yes",
    });
    expect(list).toHaveLength(11);
  });

  it("foreign → the 2 foreign questions slot in after nationality; never OB_DECIDE", () => {
    const list = ids({ nationality: "foreign", entityType: "individual" });
    expect(list).toHaveLength(9);
    expect(list[1]).toBe("nationality");
    expect(list[2]).toBe("ownershipStructure");
    expect(list[3]).toBe("workPermitNeed");
    expect(list).not.toContain("whyIncorporate");
    expect(list).not.toContain("decideOffer");
  });

  it("flipping foreign → thai removes the foreign questions cleanly", () => {
    expect(ids({ nationality: "thai" })).not.toContain("ownershipStructure");
  });
});

describe("sanitizeAnswers", () => {
  it("keeps valid answers, drops unknown ids and stale option values", () => {
    const clean = sanitizeAnswers({
      industry: "salon",
      vatRegistered: "maybe-later", // renamed/invalid option value
      renamedQuestion: "yes", // question no longer exists
      whyIncorporate: ["liability", "oldDriver", 42],
    });
    expect(clean).toEqual({
      industry: "salon",
      whyIncorporate: ["liability"],
    });
  });

  it("handles garbage input without throwing", () => {
    expect(sanitizeAnswers(null)).toEqual({});
    expect(sanitizeAnswers("nonsense")).toEqual({});
    expect(sanitizeAnswers(undefined)).toEqual({});
  });
});

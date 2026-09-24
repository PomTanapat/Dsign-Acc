/**
 * VAT-threshold nudge rules (plan D9): fires from 85%, re-arms after 30
 * days or another 5% of revenue — a legal deadline can't be dismissed away.
 */
import { describe, it, expect } from "vitest";

import {
  evaluateVatThreshold,
  isVatNudgeArmed,
} from "./threshold-logic";

describe("evaluateVatThreshold", () => {
  it("fires from 85% of ฿1.8M", () => {
    expect(evaluateVatThreshold(1_529_999).shouldNudge).toBe(false);
    expect(evaluateVatThreshold(1_530_000).shouldNudge).toBe(true);
    expect(evaluateVatThreshold(2_000_000).shouldNudge).toBe(true);
  });

  it("reports the uncapped ratio", () => {
    expect(evaluateVatThreshold(900_000).ratio).toBeCloseTo(0.5);
    expect(evaluateVatThreshold(3_600_000).ratio).toBeCloseTo(2);
  });
});

describe("isVatNudgeArmed", () => {
  const now = new Date("2026-06-13T00:00:00Z");

  it("armed when never dismissed", () => {
    expect(isVatNudgeArmed(undefined, 0.9, now)).toBe(true);
  });

  it("stays dismissed within 30 days at similar revenue", () => {
    expect(
      isVatNudgeArmed(
        { dismissedAt: "2026-06-01T00:00:00Z", atRatio: 0.9 },
        0.91,
        now,
      ),
    ).toBe(false);
  });

  it("re-arms after 30 days", () => {
    expect(
      isVatNudgeArmed(
        { dismissedAt: "2026-05-01T00:00:00Z", atRatio: 0.9 },
        0.9,
        now,
      ),
    ).toBe(true);
  });

  it("re-arms early when revenue climbs another 5% of the threshold", () => {
    expect(
      isVatNudgeArmed(
        { dismissedAt: "2026-06-10T00:00:00Z", atRatio: 0.86 },
        0.92,
        now,
      ),
    ).toBe(true);
  });

  it("treats corrupted dismissal data as armed (fail-safe)", () => {
    expect(
      isVatNudgeArmed({ dismissedAt: "garbage", atRatio: 0.9 }, 0.9, now),
    ).toBe(true);
  });
});

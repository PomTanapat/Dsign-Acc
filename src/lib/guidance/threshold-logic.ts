// Pure VAT-threshold rules — separated from the query so they're unit-
// testable and shareable with Phase 8's trigger engine later.

export const VAT_THRESHOLD_BAHT = 1_800_000;

/** Nudge from 85% of the threshold onward. */
export const VAT_NUDGE_RATIO = 0.85;

/** A dismissal re-arms after 30 days — a legal deadline must not be
    permanently dismissible. */
export const NUDGE_REARM_DAYS = 30;

/** …or sooner, when revenue has climbed another 5% of the threshold. */
export const NUDGE_REARM_RATIO_STEP = 0.05;

export type VatThresholdStatus = {
  revenue12m: number;
  /** revenue / ฿1.8M, uncapped (can exceed 1). */
  ratio: number;
  shouldNudge: boolean;
};

export function evaluateVatThreshold(revenue12m: number): VatThresholdStatus {
  const ratio = revenue12m / VAT_THRESHOLD_BAHT;
  return { revenue12m, ratio, shouldNudge: ratio >= VAT_NUDGE_RATIO };
}

export type VatNudgeDismissal = {
  dismissedAt: string; // ISO
  atRatio: number;
};

export type DismissedNudges = {
  vatThreshold?: VatNudgeDismissal;
  whtInfo?: { dismissedAt: string };
};

/**
 * Is the VAT nudge armed despite a previous dismissal? Re-arms after 30
 * days or when revenue climbed another 5% of the threshold since dismissal.
 */
export function isVatNudgeArmed(
  dismissal: VatNudgeDismissal | undefined,
  currentRatio: number,
  now: Date,
): boolean {
  if (!dismissal) return true;
  const dismissedAt = Date.parse(dismissal.dismissedAt);
  if (Number.isNaN(dismissedAt)) return true;
  const ageDays = (now.getTime() - dismissedAt) / 86_400_000;
  if (ageDays >= NUDGE_REARM_DAYS) return true;
  return currentRatio >= dismissal.atRatio + NUDGE_REARM_RATIO_STEP;
}

"use client";

import { useState } from "react";
import {
  CircleHelp,
  HandHeart,
  Scissors,
  TrendingUp,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { dismissNudge } from "@/app/actions/nudges";
import { useGuidance } from "@/components/guidance/guidance-provider";
import { baht } from "@/lib/guidance/pricing";
import { VAT_THRESHOLD_BAHT } from "@/lib/guidance/threshold-logic";
import { Link } from "@/i18n/routing";

/**
 * Proactive nudges (plan D9) — computed from REAL trailing-12-month data,
 * passed in by the dashboard. Dismissal hides instantly client-side and
 * persists server-side; the VAT nudge re-arms (legal deadline), the WHT
 * info card doesn't (educational).
 */
export function VatThresholdNudge({
  revenue12m,
  ratio,
}: {
  revenue12m: number;
  ratio: number;
}) {
  const t = useTranslations("Nudges");
  const { openTalk } = useGuidance();
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;

  const remaining = Math.max(0, VAT_THRESHOLD_BAHT - revenue12m);
  const pct = Math.min(100, Math.round(ratio * 100));

  function dismiss() {
    setHidden(true);
    void dismissNudge({ id: "vatThreshold", atRatio: ratio }).catch(() => {});
  }

  return (
    <div className="relative flex gap-3 rounded-xl border border-warning/40 bg-warning-soft p-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-white text-warning">
        <TrendingUp className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-heading text-[14px] font-semibold">
          {t("vatThreshold.title")}
        </div>
        <p className="mt-0.5 text-[13px] leading-relaxed text-foreground/75">
          {t("vatThreshold.body", {
            amount: baht(Math.round(revenue12m)),
            remaining: baht(Math.round(remaining)),
          })}
        </p>
        <div className="relative mt-3 h-2 overflow-hidden rounded-full bg-white">
          <div
            className="h-full rounded-full bg-gradient-to-r from-warning/70 to-warning"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-1 text-right text-[11.5px] tabular-nums text-muted-foreground">
          {t("vatThreshold.barLabel", { amount: baht(Math.round(revenue12m)) })}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => openTalk("vat_threshold")}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[12.5px] font-medium text-primary-foreground transition-colors hover:bg-brand"
          >
            <HandHeart className="h-3.5 w-3.5" />
            {t("vatThreshold.cta")}
          </button>
          <Link
            href="/glossary#vatThreshold"
            className="inline-flex items-center gap-1 text-[12.5px] text-muted-foreground transition-colors hover:text-primary"
          >
            <CircleHelp className="h-3.5 w-3.5" />
            {t("vatThreshold.learn")}
          </Link>
        </div>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label={t("dismiss")}
        className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-white hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function WhtInfoCard() {
  const t = useTranslations("Nudges");
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;

  function dismiss() {
    setHidden(true);
    void dismissNudge({ id: "whtInfo" }).catch(() => {});
  }

  return (
    <div className="relative flex gap-3 rounded-xl border border-info-border bg-info-soft p-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-white text-primary">
        <Scissors className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-heading text-[14px] font-semibold">
          {t("whtInfo.title")}
        </div>
        <p className="mt-0.5 text-[13px] leading-relaxed text-foreground/75">
          {t("whtInfo.body")}
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="mt-2 text-[12.5px] font-medium text-primary hover:underline"
        >
          {t("whtInfo.dismiss")}
        </button>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label={t("dismiss")}
        className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-white hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

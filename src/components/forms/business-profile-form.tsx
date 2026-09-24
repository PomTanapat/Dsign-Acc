"use client";

import { useEffect, useState, useTransition } from "react";
import { HandHeart, Zap } from "lucide-react";
import { useTranslations } from "next-intl";

import { updateBusinessProfile } from "@/app/actions/onboarding";
import type { GuidanceMode, Industry, TriState } from "@/lib/db/schema";
import { INDUSTRY_ORDER } from "@/lib/guidance/onboarding-questions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const SUGGEST_DISMISS_KEY = "dsign_suggest_fast_dismissed";

/**
 * Settings → Business profile + guidance mode (Step 4). Editing these
 * re-tailors the sidebar, dashboard, and form defaults — the same answers
 * the onboarding interview captured, now editable any time.
 */
export function BusinessProfileForm({
  industry: initialIndustry,
  vatRegistered: initialVat,
  paysOthers: initialPays,
  guidanceMode: initialMode,
  suggestFast,
}: {
  industry: Industry;
  vatRegistered: TriState;
  paysOthers: TriState;
  guidanceMode: GuidanceMode;
  /** ≥5 documents issued and still in guided mode — offer Fast once. */
  suggestFast: boolean;
}) {
  const t = useTranslations("Settings");
  const ti = useTranslations("Industries");
  const [industry, setIndustry] = useState<Industry>(initialIndustry);
  const [vatRegistered, setVatRegistered] = useState<TriState>(initialVat);
  const [paysOthers, setPaysOthers] = useState<TriState>(initialPays);
  const [mode, setMode] = useState<GuidanceMode>(initialMode);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const [suggestDismissed, setSuggestDismissed] = useState(true);

  useEffect(() => {
    try {
      setSuggestDismissed(localStorage.getItem(SUGGEST_DISMISS_KEY) === "1");
    } catch {
      // localStorage unavailable → suggestion stays hidden, nothing breaks
    }
  }, []);

  function save(next?: Partial<{ guidanceMode: GuidanceMode }>) {
    startTransition(async () => {
      const res = await updateBusinessProfile({
        industry,
        vatRegistered,
        paysOthers,
        guidanceMode: next?.guidanceMode ?? mode,
      });
      setSaved(res.success);
    });
  }

  function dismissSuggest() {
    setSuggestDismissed(true);
    try {
      localStorage.setItem(SUGGEST_DISMISS_KEY, "1");
    } catch {}
  }

  const showSuggest = suggestFast && mode === "guided" && !suggestDismissed;

  return (
    <div className="space-y-6">
      {showSuggest ? (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-info-border bg-info-soft px-4 py-3">
          <Zap className="h-4 w-4 shrink-0 text-primary" />
          <span className="flex-1 text-sm text-foreground/80">
            {t("guidanceSection.suggestFast")}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setMode("fast");
              dismissSuggest();
              save({ guidanceMode: "fast" });
            }}
          >
            {t("guidanceSection.suggestYes")}
          </Button>
          <button
            type="button"
            onClick={dismissSuggest}
            className="text-[13px] text-muted-foreground hover:text-foreground"
          >
            {t("guidanceSection.suggestNo")}
          </button>
        </div>
      ) : null}

      {/* guidance mode */}
      <div>
        <h2 className="font-heading text-base font-semibold">
          {t("guidanceSection.title")}
        </h2>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {(
            [
              {
                id: "guided" as const,
                icon: HandHeart,
                title: t("guidanceSection.guidedTitle"),
                desc: t("guidanceSection.guidedDesc"),
              },
              {
                id: "fast" as const,
                icon: Zap,
                title: t("guidanceSection.fastTitle"),
                desc: t("guidanceSection.fastDesc"),
              },
            ]
          ).map(({ id, icon: Icon, title, desc }) => (
            <button
              key={id}
              type="button"
              onClick={() => setMode(id)}
              aria-pressed={mode === id}
              className={cn(
                "flex gap-3 rounded-lg border bg-card p-3.5 text-left transition-colors",
                mode === id
                  ? "border-primary bg-info-soft"
                  : "hover:border-primary/50",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md",
                  mode === id
                    ? "bg-primary text-primary-foreground"
                    : "bg-info-soft text-primary",
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-sm font-medium">{title}</span>
                <span className="mt-0.5 block text-[12.5px] leading-relaxed text-muted-foreground">
                  {desc}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* business profile */}
      <div>
        <h2 className="font-heading text-base font-semibold">
          {t("profileSection.title")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("profileSection.sub")}
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>{t("profileSection.industry")}</Label>
            <Select
              value={industry}
              onValueChange={(v) => setIndustry(v as Industry)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRY_ORDER.map((k) => (
                  <SelectItem key={k} value={k}>
                    {ti(`${k}.label`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{t("profileSection.vatStatus")}</Label>
            <Select
              value={vatRegistered}
              onValueChange={(v) => setVatRegistered(v as TriState)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">{t("profileSection.vatYes")}</SelectItem>
                <SelectItem value="no">{t("profileSection.vatNo")}</SelectItem>
                <SelectItem value="unsure">
                  {t("profileSection.vatUnsure")}
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[12px] leading-relaxed text-muted-foreground">
              {t("profileSection.vatRateHint")}
            </p>
          </div>
          <div className="space-y-1.5">
            <Label>{t("profileSection.paysOthers")}</Label>
            <Select
              value={paysOthers === "unsure" ? "no" : paysOthers}
              onValueChange={(v) => setPaysOthers(v as TriState)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">{t("profileSection.paysYes")}</SelectItem>
                <SelectItem value="no">{t("profileSection.paysNo")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Button onClick={() => save()} disabled={pending}>
            {t("profileSection.save")}
          </Button>
          {saved ? (
            <span className="text-sm text-success">
              {t("profileSection.saved")}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

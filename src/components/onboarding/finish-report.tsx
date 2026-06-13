"use client";

import { useState, useTransition } from "react";
import {
  Award,
  Building,
  Building2,
  BadgeCheck,
  Calculator,
  CalendarClock,
  Check,
  CircleCheck,
  CircleHelp,
  CirclePause,
  ClipboardCheck,
  Coins,
  Compass,
  Flag,
  Globe,
  HandHeart,
  Handshake,
  Info,
  Landmark,
  Lock,
  Percent,
  Phone,
  Scale,
  ScrollText,
  Shield,
  ShieldCheck,
  ThumbsUp,
  TriangleAlert,
  Users,
  Wallet,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { completeOnboarding } from "@/app/actions/onboarding";
import {
  buildTeaser,
  type ConKey,
  type IncorporationDriver,
  type ProKey,
  type TeaserVerdict,
} from "@/lib/guidance/incorporation-teaser";
import {
  INDUSTRY_ICONS,
  INDUSTRY_ORDER,
  type OnboardingAnswers,
} from "@/lib/guidance/onboarding-questions";
import {
  DSIGN_PRICING,
  PRICING_CONFIRMED,
  PRICING_RECURRING_TOTAL,
  PRICING_YEAR1_TOTAL,
  baht,
} from "@/lib/guidance/pricing";
import { DSIGN_PHONE_TEL } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type Variant = TeaserVerdict | "foreign" | "juristic" | "summary";

const VERDICT_ICON: Record<Exclude<Variant, "summary">, LucideIcon> = {
  likely: CircleCheck,
  considering: Scale,
  numbers: Calculator,
  none: CirclePause,
  foreign: Globe,
  juristic: Building2,
};

const VERDICT_TONE: Record<Exclude<Variant, "summary">, string> = {
  likely: "border-success/40 bg-success-soft",
  considering: "border-info-border bg-info-soft",
  numbers: "border-info-border bg-info-soft",
  none: "border-border bg-muted/40",
  foreign: "border-info-border bg-info-soft",
  juristic: "border-info-border bg-info-soft",
};

const PRO_ICONS: Record<ProKey, LucideIcon> = {
  corpClients: Building2,
  corpCustomers: Handshake,
  credibility: BadgeCheck,
  liability: Shield,
  funding: Landmark,
  hiring: Users,
  smeRates: Percent,
};

const CON_ICONS: Record<ConKey, LucideIcon> = {
  cost: Wallet,
  discipline: CalendarClock,
  dividends: Lock,
};

export function FinishReport({
  answers,
  onBack,
  clearDraft,
}: {
  answers: OnboardingAnswers;
  onBack: () => void;
  clearDraft: () => void;
}) {
  const t = useTranslations("Onboarding.finish");
  const tn = useTranslations("Onboarding.nav");
  const ti = useTranslations("Industries");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(false);

  const foreign = answers.nationality === "foreign";
  const juristic = answers.entityType === "juristic";
  const why = Array.isArray(answers.whyIncorporate)
    ? (answers.whyIncorporate as IncorporationDriver[])
    : [];
  const decided = why.length > 0;

  const teaser = decided
    ? buildTeaser({
        whyIncorporate: why,
        clientType: answers.clientType as
          | "corp"
          | "mixed"
          | "individual"
          | undefined,
        netProfit: answers.netProfit as
          | "low"
          | "mid"
          | "high"
          | "vhigh"
          | "unsure"
          | undefined,
      })
    : null;

  const variant: Variant = foreign
    ? "foreign"
    : juristic
      ? "juristic"
      : teaser
        ? teaser.verdict
        : "summary";

  const showCost = variant !== "summary";
  const isAssessment = teaser !== null;

  function enterWorkspace() {
    startTransition(async () => {
      const res = await completeOnboarding(answers);
      if (res.success) {
        clearDraft();
        router.replace("/dashboard");
      } else {
        setError(true);
      }
    });
  }

  const industry = (
    INDUSTRY_ORDER as readonly string[]
  ).includes(answers.industry as string)
    ? (answers.industry as (typeof INDUSTRY_ORDER)[number])
    : "other";
  const IndustryIcon = INDUSTRY_ICONS[industry];
  const fast = answers.guidanceMode === "fast";
  const vatOn = answers.vatRegistered === "yes";
  const whtOn = answers.paysOthers === "yes";

  const configured: { icon: LucideIcon; label: string; value: string }[] = [
    { icon: IndustryIcon, label: t("configured.industry"), value: ti(`${industry}.label`) },
    {
      icon: fast ? Zap : HandHeart,
      label: t("configured.guidance"),
      value: fast ? t("configured.guidanceFast") : t("configured.guidanceGuided"),
    },
    {
      icon: Percent,
      label: t("configured.vat"),
      value: vatOn ? t("configured.vatOn") : t("configured.vatOff"),
    },
    {
      icon: ScrollText,
      label: t("configured.wht"),
      value: whtOn ? t("configured.whtOn") : t("configured.whtOff"),
    },
  ];

  const OWNERSHIP_ICONS: Record<string, LucideIcon> = {
    thaiMajority: Users,
    boi: Award,
    amity: Handshake,
    branch: Building,
    unsure: Compass,
  };
  const PERMIT_ICONS: Record<string, LucideIcon> = {
    yes: BadgeCheck,
    no: Globe,
    unsure: CircleHelp,
  };
  const ownershipKey =
    typeof answers.ownershipStructure === "string"
      ? answers.ownershipStructure
      : "unsure";
  const permitKey =
    typeof answers.workPermitNeed === "string"
      ? answers.workPermitNeed
      : "unsure";

  const VIcon = variant === "summary" ? null : VERDICT_ICON[variant];

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-10 sm:px-8">
      {/* header */}
      <div className="text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-info-soft text-primary">
          <ClipboardCheck className="h-6 w-6" />
        </span>
        <div className="mt-3 font-heading text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">
          {isAssessment ? t("kickerAssessment") : t("kickerSummary")}
        </div>
        <h1 className="mt-1 font-heading text-2xl font-semibold">
          {isAssessment ? t("titleAssessment") : t("titleSummary")}
        </h1>
      </div>

      {/* verdict */}
      {variant !== "summary" && VIcon ? (
        <div
          className={cn(
            "mt-6 flex gap-3 rounded-xl border p-4",
            VERDICT_TONE[variant],
          )}
        >
          <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-md bg-white text-primary">
            <VIcon className="h-5 w-5" />
          </span>
          <div>
            <div className="font-heading text-[15px] font-semibold">
              {t(`verdict.${variant}.label`)}
            </div>
            <div className="text-sm font-medium text-foreground/80">
              {t(`verdict.${variant}.headline`)}
            </div>
            <p className="mt-1 text-[13px] leading-relaxed text-foreground/70">
              {t(`verdict.${variant}.body`)}
            </p>
          </div>
        </div>
      ) : null}

      {/* pros / cons */}
      {teaser ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-1.5 font-heading text-[13px] font-semibold text-success">
              <ThumbsUp className="h-3.5 w-3.5" />
              {t("prosTitle")}
            </div>
            {teaser.pros.length === 0 ? (
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                {t("prosEmpty")}
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {teaser.pros.map((k) => {
                  const Icon = PRO_ICONS[k];
                  return (
                    <li
                      key={k}
                      className="flex items-start gap-2 text-[13px] leading-relaxed text-foreground/80"
                    >
                      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                      {t(`pros.${k}`)}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-1.5 font-heading text-[13px] font-semibold text-warning">
              <TriangleAlert className="h-3.5 w-3.5" />
              {t("consTitle")}
            </div>
            <ul className="mt-2 space-y-2">
              {teaser.cons.map((k) => {
                const Icon = CON_ICONS[k];
                return (
                  <li
                    key={k}
                    className="flex items-start gap-2 text-[13px] leading-relaxed text-foreground/80"
                  >
                    <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
                    {t(`cons.${k}`)}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      ) : null}

      {/* transparent cost */}
      {showCost ? (
        <div className="mt-4 overflow-hidden rounded-xl border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/40 px-4 py-3">
            <div>
              <div className="font-heading text-[11.5px] font-semibold uppercase tracking-[0.14em] text-primary">
                {t("cost.kicker")}
              </div>
              <div className="font-heading text-[15px] font-semibold">
                {juristic ? t("cost.titleAlready") : t("cost.titleIf")}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {!PRICING_CONFIRMED ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-warning-soft px-2 py-0.5 text-[11.5px] font-medium text-warning">
                  <Flag className="h-3 w-3" />
                  {t("cost.estimateBadge")}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1 rounded-full bg-info-soft px-2 py-0.5 text-[11.5px] font-medium text-brand">
                <ShieldCheck className="h-3 w-3" />
                {t("cost.providerBadge")}
              </span>
            </div>
          </div>

          <div className="px-4 py-3">
            {/* one-time block: hidden for already-juristic; replaced by the
                case-by-case note for foreign owners (plan D7) */}
            {!juristic && !foreign ? (
              <>
                <div className="font-heading text-[12px] font-semibold text-muted-foreground">
                  {t("cost.oneTimeTitle")}
                </div>
                <CostRow
                  label={t("cost.setupLabel")}
                  note={t("cost.setupNote")}
                  amount={baht(DSIGN_PRICING.setupRegistration)}
                />
              </>
            ) : null}
            {foreign ? (
              <div className="flex items-start gap-2 rounded-md bg-info-soft px-3 py-2 text-[13px] leading-relaxed text-brand">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {t("cost.foreignSetupNote")}
              </div>
            ) : null}

            <div className="mt-3 font-heading text-[12px] font-semibold text-muted-foreground">
              {t("cost.yearlyTitle")}
            </div>
            <CostRow
              label={t("cost.bookkeepingLabel")}
              note={t("cost.bookkeepingNote")}
              amount={baht(DSIGN_PRICING.recurringBookkeeping)}
            />
            <CostRow
              label={t("cost.yearEndLabel")}
              note={t("cost.yearEndNote")}
              amount={baht(DSIGN_PRICING.recurringYearEnd)}
            />
            <CostRow
              label={t("cost.auditLabel")}
              note={t("cost.auditNote")}
              amount={baht(DSIGN_PRICING.recurringAudit)}
            />

            <div className="mt-3 space-y-1 border-t pt-3">
              {!juristic && !foreign ? (
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("cost.year1Total")}
                  </span>
                  <span className="font-medium tabular-nums">
                    {baht(PRICING_YEAR1_TOTAL)}
                  </span>
                </div>
              ) : null}
              <div className="flex items-baseline justify-between">
                <span className="font-medium">{t("cost.yearlyTotal")}</span>
                <span className="font-heading text-lg font-semibold tabular-nums text-brand">
                  {baht(PRICING_RECURRING_TOTAL)}
                  <span className="ml-0.5 text-[12px] font-normal text-muted-foreground">
                    {t("cost.perYear")}
                  </span>
                </span>
              </div>
            </div>

            <div className="mt-3 space-y-1.5 border-t pt-3">
              {(!foreign && !juristic
                ? (["counterIndividual", "counterScale"] as const)
                : foreign
                  ? (["counterForeign", "counterScale"] as const)
                  : (["counterScale"] as const)
              ).map((k) => (
                <div
                  key={k}
                  className="flex items-start gap-2 text-[12.5px] leading-relaxed text-muted-foreground"
                >
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
                  {t(`cost.${k}`)}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {/* what we configured */}
      <div className="mt-4 rounded-xl border bg-card p-4">
        <div className="flex items-center gap-1.5 font-heading text-[13px] font-semibold">
          <CircleCheck className="h-4 w-4 text-success" />
          {t("configured.title")}
        </div>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {configured.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex items-center gap-2.5 rounded-md bg-muted/40 px-3 py-2"
            >
              <Icon className="h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0">
                <div className="text-[11.5px] text-muted-foreground">
                  {label}
                </div>
                <div className="text-[13px] font-medium">{value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* foreign essentials */}
      {foreign ? (
        <div className="mt-4 rounded-xl border bg-card p-4">
          <div className="flex items-center gap-1.5 font-heading text-[13px] font-semibold">
            <Globe className="h-4 w-4 text-primary" />
            {t("foreignEss.title")}
          </div>
          <p className="mt-0.5 text-[12.5px] text-muted-foreground">
            {t("foreignEss.sub")}
          </p>
          <div className="mt-2 space-y-2">
            {(
              [
                {
                  icon: OWNERSHIP_ICONS[ownershipKey] ?? Compass,
                  tag: t("foreignEss.tagSetup"),
                  tKey: `foreignEss.ownership.${ownershipKey}.t`,
                  dKey: `foreignEss.ownership.${ownershipKey}.d`,
                },
                {
                  icon: PERMIT_ICONS[permitKey] ?? CircleHelp,
                  tag: t("foreignEss.tagSetup"),
                  tKey: `foreignEss.permit.${permitKey}.t`,
                  dKey: `foreignEss.permit.${permitKey}.d`,
                },
                {
                  icon: Building,
                  tag: t("foreignEss.tagTax"),
                  tKey: "foreignEss.cit.t",
                  dKey: "foreignEss.cit.d",
                },
                {
                  icon: Coins,
                  tag: t("foreignEss.tagTax"),
                  tKey: "foreignEss.dividend.t",
                  dKey: "foreignEss.dividend.d",
                },
              ] as const
            ).map(({ icon: Icon, tag, tKey, dKey }) => (
              <div key={tKey} className="flex items-start gap-2.5">
                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md bg-info-soft text-primary">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium">{t(tKey)}</span>
                    <span className="rounded-full bg-muted px-1.5 py-px text-[10.5px] text-muted-foreground">
                      {tag}
                    </span>
                  </div>
                  <div className="text-[12.5px] text-muted-foreground">
                    {t(dKey)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* CTAs */}
      {error ? (
        <p className="mt-4 text-center text-sm text-destructive">
          {t("error")}
        </p>
      ) : null}
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Button
          size="lg"
          className="flex-1"
          onClick={enterWorkspace}
          disabled={pending}
        >
          <Check className="mr-2 h-4 w-4" />
          {t("enterWorkspace")}
        </Button>
        <Button size="lg" variant="outline" asChild className="flex-1">
          <a href={DSIGN_PHONE_TEL}>
            <Phone className="mr-2 h-4 w-4" />
            {t("talkCpa")}
          </a>
        </Button>
      </div>
      <button
        type="button"
        onClick={onBack}
        className="mx-auto mt-3 block text-[13px] text-muted-foreground transition-colors hover:text-foreground"
      >
        {tn("back")}
      </button>

      {/* disclaimer */}
      <p className="mt-6 flex items-start justify-center gap-1.5 text-center text-[12px] leading-relaxed text-muted-foreground">
        <Flag className="mt-0.5 h-3 w-3 shrink-0 text-warning" />
        {t("disclaimer")}
      </p>
    </div>
  );
}

function CostRow({
  label,
  note,
  amount,
}: {
  label: string;
  note: string;
  amount: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <div className="min-w-0">
        <div className="text-[13px] font-medium">{label}</div>
        <div className="text-[12px] text-muted-foreground">{note}</div>
      </div>
      <div className="shrink-0 text-sm font-medium tabular-nums">{amount}</div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { BookOpen, Check, CircleHelp, Flag, MessageCircle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import {
  GLOSSARY,
  type GlossaryLocaleEntry,
  type GlossaryTerm,
  type GlossaryTermKey,
} from "@/lib/guidance/glossary";
import { SHOW_DRAFT_BADGES } from "@/lib/guidance/draft-mode";
import { useGuidance } from "@/components/guidance/guidance-provider";
import { RateTable } from "@/components/guidance/rate-table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/**
 * The single most-reused guidance pattern (plan Pillar B): one component,
 * two renderings driven by the guidance mode.
 *
 * - Guided: an always-open coaching card under the field.
 * - Fast: a quiet "term?" trigger that opens a popover on hover or tap.
 *
 * Every tax term in the app appears WITH its Explainer — plain language
 * first, the real term second.
 */
export function Explainer({
  term,
  compact,
}: {
  term: GlossaryTermKey;
  compact?: boolean;
}) {
  const { mode } = useGuidance();
  const locale = useLocale();
  const g = GLOSSARY[term];
  if (!g) return null; // unknown term must never break a form
  const entry = locale === "en" ? g.en : g.th;

  if (mode === "guided") {
    return <GuidedCard term={term} g={g} entry={entry} />;
  }
  return <FastPopover term={term} g={g} entry={entry} compact={compact} />;
}

function GuidedCard({
  term,
  g,
  entry,
}: {
  term: GlossaryTermKey;
  g: GlossaryTerm;
  entry: GlossaryLocaleEntry;
}) {
  const t = useTranslations("Guidance");
  const Icon = g.icon;

  return (
    <div className="mt-2 flex gap-2.5 rounded-lg border border-info-border bg-info-soft p-3">
      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-white text-primary">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="font-heading text-[13px] font-semibold text-brand">
            {entry.real}
          </span>
          {g.draft && SHOW_DRAFT_BADGES ? (
            <Flag
              className="h-3 w-3 cursor-help text-warning"
              aria-label={t("draftTooltip")}
            >
              <title>{t("draftTooltip")}</title>
            </Flag>
          ) : null}
        </div>
        <p className="mt-0.5 text-[13px] leading-relaxed text-foreground/80">
          {entry.plain}
        </p>
        <FactChips entry={entry} />
        <RateTable entry={entry} />
        <ExplainerLinks term={term} entry={entry} />
      </div>
    </div>
  );
}

function FastPopover({
  term,
  g,
  entry,
  compact,
}: {
  term: GlossaryTermKey;
  g: GlossaryTerm;
  entry: GlossaryLocaleEntry;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex cursor-help items-center gap-1 rounded-full px-1.5 py-0.5 text-[12px] text-muted-foreground transition-colors hover:text-primary",
            open && "text-primary",
            compact && "px-1 text-[11.5px]",
          )}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <CircleHelp className="h-3 w-3" />
          {entry.real}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-80 p-3"
        // Keep the hover-to-peek behaviour symmetric: leaving the panel
        // closes it, so mouse users can travel trigger → panel freely.
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <div className="font-heading text-[13px] font-semibold text-brand">
          {entry.real}
        </div>
        <p className="mt-1 text-[13px] leading-relaxed text-foreground/80">
          {entry.plain}
        </p>
        <FactChips entry={entry} />
        <RateTable entry={entry} />
        <ExplainerLinks term={term} entry={entry} />
      </PopoverContent>
    </Popover>
  );
}

function FactChips({ entry }: { entry: GlossaryLocaleEntry }) {
  if (entry.facts.length === 0) return null;
  return (
    <div className="mt-1.5 flex flex-wrap gap-1.5">
      {entry.facts.map((f) => (
        <span
          key={f}
          className="inline-flex items-center gap-1 rounded-full border border-info-border bg-white px-2 py-0.5 text-[11.5px] tabular-nums text-foreground/70"
        >
          <Check className="h-3 w-3 shrink-0 text-success" />
          {f}
        </span>
      ))}
    </div>
  );
}

function ExplainerLinks({
  term,
  entry,
}: {
  term: GlossaryTermKey;
  entry: GlossaryLocaleEntry;
}) {
  const t = useTranslations("Guidance");
  const { openTalk } = useGuidance();

  return (
    <div className="mt-2 flex items-center gap-3 text-[12.5px]">
      {entry.more ? (
        <Link
          href={`/glossary#${term}`}
          className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
        >
          <BookOpen className="h-3 w-3" />
          {t("learn")}
        </Link>
      ) : null}
      <button
        type="button"
        onClick={() => openTalk(term)}
        className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-primary"
      >
        <MessageCircle className="h-3 w-3" />
        {t("talk")}
      </button>
    </div>
  );
}

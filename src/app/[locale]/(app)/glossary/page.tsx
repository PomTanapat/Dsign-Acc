import { Check, Flag, Globe } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { requireCompany } from "@/lib/queries/company";
import {
  GLOSSARY,
  GLOSSARY_KEYS,
  type GlossaryTermKey,
} from "@/lib/guidance/glossary";
import { SHOW_DRAFT_BADGES } from "@/lib/guidance/draft-mode";
import { RateTable } from "@/components/guidance/rate-table";
import { TalkLink } from "@/components/guidance/talk-link";

export default async function GlossaryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Glossary");
  const tg = await getTranslations("Guidance");
  const { company } = await requireCompany();

  const core = GLOSSARY_KEYS.filter((k) => !GLOSSARY[k].foreign);
  const foreign = GLOSSARY_KEYS.filter((k) => GLOSSARY[k].foreign);
  const showForeign = company?.foreignOwned ?? false;

  function Card({ termKey }: { termKey: GlossaryTermKey }) {
    const g = GLOSSARY[termKey];
    const entry = locale === "en" ? g.en : g.th;
    const Icon = g.icon;
    return (
      // Anchor target for the Explainer "Learn more" deep links.
      <div
        id={termKey}
        className="flex scroll-mt-20 flex-col rounded-lg border bg-card p-4"
      >
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-info-soft text-primary">
            <Icon className="h-4 w-4" />
          </span>
          <span className="font-heading text-[15px] font-semibold text-brand">
            {entry.real}
          </span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-foreground/80">
          {entry.plain}
        </p>
        {entry.facts.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
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
        ) : null}
        <RateTable entry={entry} />
        <div className="mt-auto flex items-center justify-between pt-3">
          {g.draft && SHOW_DRAFT_BADGES ? (
            <span className="inline-flex items-center gap-1 text-[11.5px] text-warning">
              <Flag className="h-3 w-3" />
              {tg("draft")}
            </span>
          ) : (
            <span />
          )}
          <TalkLink surface={termKey} />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("sub")}</p>
      </div>

      {SHOW_DRAFT_BADGES ? (
        <div className="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning-soft px-4 py-3 text-sm text-foreground/80">
          <Flag className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          {t("draftBanner")}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {core.map((k) => (
          <Card key={k} termKey={k} />
        ))}
      </div>

      {showForeign ? (
        <>
          <div className="flex items-center gap-2 pt-2">
            <Globe className="h-4 w-4 text-primary" />
            <h2 className="font-heading text-lg font-semibold">
              {t("foreignSection")}
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {foreign.map((k) => (
              <Card key={k} termKey={k} />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

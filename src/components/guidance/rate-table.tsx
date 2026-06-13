import { Info } from "lucide-react";
import { useTranslations } from "next-intl";

import type { GlossaryLocaleEntry } from "@/lib/guidance/glossary";

/**
 * Withholding rates by income type — renders only when the glossary entry
 * carries a `rates` array (currently `whtIssued` alone). No "use client":
 * works in both server and client trees.
 */
export function RateTable({ entry }: { entry: GlossaryLocaleEntry }) {
  const t = useTranslations("Guidance");
  if (!entry.rates || entry.rates.length === 0) return null;

  return (
    <div className="mt-2 overflow-hidden rounded-md border border-info-border bg-white">
      <div className="bg-info-soft px-3 py-1.5 font-heading text-[12px] font-semibold text-brand">
        {t("ratesHeading")}
      </div>
      <div className="divide-y divide-border/60">
        {entry.rates.map((r) => (
          <div key={r.rate} className="flex items-start gap-2 px-3 py-1.5">
            <span className="min-w-[52px] rounded-full bg-info-soft px-2 py-0.5 text-center text-[11.5px] font-semibold tabular-nums text-brand">
              {r.rate}
            </span>
            <span className="text-[12.5px] leading-relaxed text-foreground/75">
              {r.detail}
            </span>
          </div>
        ))}
      </div>
      {entry.notes && entry.notes.length > 0 ? (
        <div className="space-y-1 border-t bg-muted/40 px-3 py-2">
          {entry.notes.map((n) => (
            <div
              key={n}
              className="flex items-start gap-1.5 text-[12px] leading-relaxed text-muted-foreground"
            >
              <Info className="mt-0.5 h-3 w-3 shrink-0 text-warning" />
              <span>{n}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

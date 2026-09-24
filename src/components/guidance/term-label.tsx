"use client";

import type { ReactNode } from "react";

import type { GlossaryTermKey } from "@/lib/guidance/glossary";
import { useGuidance } from "@/components/guidance/guidance-provider";
import { Explainer } from "@/components/guidance/explainer";
import { Label } from "@/components/ui/label";

/**
 * A field label that carries its own Explainer.
 *
 * Guided mode: the coaching card renders right under the label. Fast mode:
 * just the label — the field's quiet "what's this?" affordance is added by
 * placing a separate <Explainer compact /> where the design wants it.
 */
export function TermLabel({
  term,
  htmlFor,
  children,
}: {
  term: GlossaryTermKey;
  htmlFor?: string;
  children: ReactNode;
}) {
  const { mode } = useGuidance();

  return (
    <div>
      <Label htmlFor={htmlFor}>{children}</Label>
      {mode === "guided" ? <Explainer term={term} /> : null}
    </div>
  );
}

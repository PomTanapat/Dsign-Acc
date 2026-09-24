"use client";

import { MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { useGuidance } from "@/components/guidance/guidance-provider";

/** "Not sure? Talk to us" — for server-rendered surfaces (glossary cards). */
export function TalkLink({ surface }: { surface: string }) {
  const t = useTranslations("Guidance");
  const { openTalk } = useGuidance();

  return (
    <button
      type="button"
      onClick={() => openTalk(surface)}
      className="inline-flex items-center gap-1 text-[12.5px] text-muted-foreground transition-colors hover:text-primary"
    >
      <MessageCircle className="h-3 w-3" />
      {t("talk")}
    </button>
  );
}

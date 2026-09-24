"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

import type { GuidanceMode } from "@/lib/db/schema";
import { logTalkOpen } from "@/app/actions/leads";
import { TalkToUs } from "@/components/guidance/talk-to-us";

type GuidanceContextValue = {
  mode: GuidanceMode;
  /**
   * Open the Talk-to-us dialog. `surface` says where the user got stuck —
   * a glossary term key or a screen id — and travels with the lead record
   * so the firm knows the context before calling back.
   */
  openTalk: (surface?: string) => void;
};

const GuidanceContext = createContext<GuidanceContextValue>({
  mode: "guided",
  openTalk: () => {},
});

export function useGuidance(): GuidanceContextValue {
  return useContext(GuidanceContext);
}

export function GuidanceProvider({
  mode,
  defaultContact,
  children,
}: {
  mode: GuidanceMode;
  /** Prefill for the contact field — company phone, falling back to email. */
  defaultContact?: string;
  children: ReactNode;
}) {
  const [talkOpen, setTalkOpen] = useState(false);
  const [surface, setSurface] = useState<string | undefined>(undefined);

  const openTalk = useCallback((s?: string) => {
    setSurface(s);
    setTalkOpen(true);
    // Fire-and-forget funnel signal — must never block the dialog.
    void logTalkOpen(s).catch(() => {});
  }, []);

  return (
    <GuidanceContext.Provider value={{ mode, openTalk }}>
      {children}
      <TalkToUs
        open={talkOpen}
        onOpenChange={setTalkOpen}
        surface={surface}
        defaultContact={defaultContact}
      />
    </GuidanceContext.Provider>
  );
}

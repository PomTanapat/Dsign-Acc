"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import {
  Bookmark,
  Check,
  Clock,
  Globe,
  Settings2,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import {
  buildQuestionList,
  sanitizeAnswers,
  type OnboardingAnswers,
  type OnboardingQuestion,
} from "@/lib/guidance/onboarding-questions";
import { skipOnboarding } from "@/app/actions/onboarding";
import { Explainer } from "@/components/guidance/explainer";
import { FinishReport } from "@/components/onboarding/finish-report";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const DRAFT_KEY = "dsign_onboarding_v1";

// A draft younger than this is a mid-flight locale flip (selecting
// "foreign" remounts the page under /en) — restore silently. Older drafts
// get the "pick up where you left off" card instead.
const SILENT_RESTORE_MS = 30_000;

type Draft = {
  version: 1;
  currentId: string;
  ans: OnboardingAnswers;
  savedAt: number;
};

function readDraft(): Draft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Draft>;
    const ans = sanitizeAnswers(parsed.ans);
    if (Object.keys(ans).length === 0) return null;
    return {
      version: 1,
      currentId:
        typeof parsed.currentId === "string" ? parsed.currentId : "industry",
      ans,
      savedAt: typeof parsed.savedAt === "number" ? parsed.savedAt : 0,
    };
  } catch {
    return null;
  }
}

function isAnswered(
  q: OnboardingQuestion,
  ans: OnboardingAnswers,
): boolean {
  const v = ans[q.id];
  if (q.kind === "multi") return Array.isArray(v) && v.length > 0;
  return typeof v === "string" && v.length > 0;
}

function firstUnansweredId(
  list: OnboardingQuestion[],
  ans: OnboardingAnswers,
): string {
  return (list.find((q) => !isAnswered(q, ans)) ?? list[list.length - 1]).id;
}

export function OnboardingWizard() {
  const t = useTranslations("Onboarding");
  const ti = useTranslations("Industries");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const [ans, setAns] = useState<OnboardingAnswers>({});
  const [currentId, setCurrentId] = useState("industry");
  const [done, setDone] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [resumeOffer, setResumeOffer] = useState<Draft | null>(null);
  const [skipping, startSkip] = useTransition();

  // ---- draft restore / resume offer ----
  useEffect(() => {
    const draft = readDraft();
    if (draft) {
      if (Date.now() - draft.savedAt < SILENT_RESTORE_MS) {
        setAns(draft.ans);
        setCurrentId(draft.currentId);
      } else {
        setResumeOffer(draft);
      }
    }
    setHydrated(true);
  }, []);

  // ---- draft persist ----
  useEffect(() => {
    if (!hydrated || done || Object.keys(ans).length === 0) return;
    const draft: Draft = { version: 1, currentId, ans, savedAt: Date.now() };
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // localStorage unavailable → resume support degrades, nothing breaks
    }
  }, [ans, currentId, hydrated, done]);

  const questions = buildQuestionList(ans);
  const safeId = questions.some((q) => q.id === currentId)
    ? currentId
    : firstUnansweredId(questions, ans);
  const idx = questions.findIndex((q) => q.id === safeId);
  const q = questions[idx];
  const total = questions.length;

  const advanceFrom = useCallback((id: string, a: OnboardingAnswers) => {
    const list = buildQuestionList(a);
    const i = list.findIndex((x) => x.id === id);
    if (i >= 0 && i < list.length - 1) setCurrentId(list[i + 1].id);
    else setDone(true);
  }, []);

  function choose(val: string) {
    if (q.kind === "multi") {
      const cur = Array.isArray(ans[q.id]) ? (ans[q.id] as string[]) : [];
      const next = cur.includes(val)
        ? cur.filter((x) => x !== val)
        : [...cur, val];
      setAns({ ...ans, [q.id]: next });
      return; // multi never auto-advances — explicit Next
    }

    const nextAns = { ...ans, [q.id]: val };
    setAns(nextAns);

    // Foreign owners get English-first (plan D12). The locale lives in the
    // URL, so this remounts the wizard — persist the draft first and let the
    // silent-restore window carry the answers across.
    if (q.id === "nationality") {
      const target = val === "foreign" ? "en" : "th";
      if (locale !== target) {
        const list = buildQuestionList(nextAns);
        const i = list.findIndex((x) => x.id === q.id);
        const draft: Draft = {
          version: 1,
          currentId: list[Math.min(i + 1, list.length - 1)].id,
          ans: nextAns,
          savedAt: Date.now(),
        };
        try {
          localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        } catch {}
        window.setTimeout(
          () => router.replace(pathname, { locale: target }),
          260,
        );
        return;
      }
    }

    // The prototype's 260ms auto-advance — recomputed against the NEW
    // answer set and navigated by id, so branch growth needs no hacks.
    window.setTimeout(() => advanceFrom(q.id, nextAns), 260);
  }

  function skipAll() {
    startSkip(async () => {
      const res = await skipOnboarding();
      if (res.success) {
        try {
          localStorage.removeItem(DRAFT_KEY);
        } catch {}
        router.replace("/dashboard");
      }
    });
  }

  if (!hydrated) return null;

  if (done) {
    return (
      <FinishReport
        answers={ans}
        onBack={() => setDone(false)}
        clearDraft={() => {
          try {
            localStorage.removeItem(DRAFT_KEY);
          } catch {}
        }}
      />
    );
  }

  // ---- resume card ----
  if (resumeOffer) {
    return (
      <div className="grid min-h-screen place-items-center p-6">
        <div className="w-full max-w-md rounded-xl border bg-card p-6 text-center shadow-sm">
          <Bookmark className="mx-auto h-8 w-8 text-primary" />
          <h2 className="mt-3 font-heading text-xl font-semibold">
            {t("resume.title")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("resume.sub")}
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Button
              className="flex-1"
              onClick={() => {
                setAns(resumeOffer.ans);
                setCurrentId(resumeOffer.currentId);
                setResumeOffer(null);
              }}
            >
              {t("resume.continue")}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                try {
                  localStorage.removeItem(DRAFT_KEY);
                } catch {}
                setResumeOffer(null);
              }}
            >
              {t("resume.startOver")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const answered = isAnswered(q, ans);
  const isLast = idx === total - 1;
  const foreign = ans.nationality === "foreign";

  return (
    <div className="flex min-h-screen">
      {/* ---- left rail: identity + stepper + reassurance ---- */}
      <aside className="hidden w-72 shrink-0 flex-col bg-gradient-to-b from-brand to-[hsl(190,75%,18%)] p-7 text-white lg:flex">
        <div className="font-heading text-xl font-semibold">Dsign</div>
        <h1 className="mt-6 font-heading text-lg font-medium leading-snug">
          {t("aside.title")}
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-white/70">
          {t("aside.intro")}
        </p>
        <ol className="mt-6 flex-1 space-y-1 overflow-y-auto">
          {questions.map((step, i) => {
            const stepDone = i < idx;
            const cur = i === idx;
            return (
              <li
                key={step.id}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px]",
                  cur ? "bg-white/15 font-medium" : "text-white/65",
                )}
              >
                <span
                  className={cn(
                    "grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[10.5px] tabular-nums",
                    stepDone
                      ? "border-transparent bg-white/90 text-brand"
                      : cur
                        ? "border-white"
                        : "border-white/40",
                  )}
                >
                  {stepDone ? <Check className="h-3 w-3" /> : i + 1}
                </span>
                {t(`stepLabels.${step.id}`)}
              </li>
            );
          })}
        </ol>
        <ul className="mt-6 space-y-2 text-[12.5px] text-white/70">
          {(
            [
              [Clock, "aside.reassure1"],
              [Bookmark, "aside.reassure2"],
              [Settings2, "aside.reassure3"],
            ] as const
          ).map(([Icon, key]) => (
            <li key={key} className="flex items-center gap-2">
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {t(key)}
            </li>
          ))}
        </ul>
      </aside>

      {/* ---- main: progress + question + options + footer ---- */}
      <div className="flex flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-5 py-8 sm:px-8">
          <div className="flex items-center justify-between text-[13px] text-muted-foreground">
            <span className="tabular-nums">
              {t("progress.counter", { current: idx + 1, total })}
            </span>
            {foreign ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-info-soft px-2.5 py-0.5 text-[12px] font-medium text-brand">
                <Globe className="h-3 w-3" />
                {t("foreignTag")}
              </span>
            ) : null}
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${((idx + 1) / total) * 100}%` }}
            />
          </div>

          <div className="mt-8 flex-1">
            <h2 className="font-heading text-xl font-semibold sm:text-2xl">
              {t(`q.${q.id}.q`)}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {t(`q.${q.id}.help`)}
            </p>

            {/* Foreign-branch heads-up before the language flips (D12) */}
            {q.id === "nationality" && ans.nationality === "foreign" ? (
              <div className="mt-3 rounded-lg border border-info-border bg-info-soft px-3 py-2 text-[13px] text-brand">
                {t("foreignNote")}
              </div>
            ) : null}

            <div
              className={cn(
                "mt-5 grid gap-2.5",
                q.cols === 2 ? "sm:grid-cols-2" : "grid-cols-1",
              )}
            >
              {q.options.map(({ val, icon: Icon, noSub }) => {
                const selected =
                  q.kind === "multi"
                    ? Array.isArray(ans[q.id]) &&
                      (ans[q.id] as string[]).includes(val)
                    : ans[q.id] === val;
                const hasSub =
                  q.id !== "industry" && q.kind !== "multi" && !noSub;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => choose(val)}
                    aria-pressed={selected}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg border bg-card p-3.5 text-left transition-all",
                      selected
                        ? "border-primary bg-info-soft shadow-sm"
                        : "hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-sm",
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-9 w-9 shrink-0 place-items-center rounded-md",
                        selected
                          ? "bg-primary text-primary-foreground"
                          : "bg-info-soft text-primary",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">
                        {q.id === "industry"
                          ? // industry labels live in the Industries namespace
                            // (shared with the sidebar/dashboard tailoring)
                            ti(`${val}.label`)
                          : t(`q.${q.id}.opts.${val}.label`)}
                      </span>
                      {hasSub ? (
                        <span className="block text-[12.5px] leading-snug text-muted-foreground">
                          {t(`q.${q.id}.opts.${val}.sub`)}
                        </span>
                      ) : null}
                    </span>
                    <span
                      className={cn(
                        "grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-opacity",
                        selected
                          ? "border-primary bg-primary text-primary-foreground opacity-100"
                          : "opacity-0",
                      )}
                    >
                      <Check className="h-3 w-3" />
                    </span>
                  </button>
                );
              })}
            </div>

            {q.kind === "multi" ? (
              <p className="mt-3 text-[12.5px] text-muted-foreground">
                {t("multiNote")}
              </p>
            ) : null}

            {q.term ? <Explainer term={q.term} /> : null}
          </div>

          <div className="mt-8 flex items-center justify-between border-t pt-4">
            <button
              type="button"
              onClick={skipAll}
              disabled={skipping}
              className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("nav.skipAll")}
            </button>
            <div className="flex items-center gap-2">
              {idx > 0 ? (
                <Button
                  variant="ghost"
                  onClick={() => setCurrentId(questions[idx - 1].id)}
                >
                  {t("nav.back")}
                </Button>
              ) : null}
              <Button
                onClick={() => advanceFrom(q.id, ans)}
                disabled={!answered}
              >
                {isLast ? t("nav.finish") : t("nav.next")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

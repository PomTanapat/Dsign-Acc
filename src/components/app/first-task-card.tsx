import {
  Building2,
  Check,
  FilePlus2,
  Sparkles,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

import type { DocType } from "@/lib/db/schema";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/**
 * "Start here" — the first-use fear reducer. Completion derives from REAL
 * data (a document exists / a customer exists / legal profile complete),
 * never manual toggles; the page hides the card once all three are true.
 * Step 3 doubles as the funnel into completing the legal company details
 * post-onboarding.
 */
export async function FirstTaskCard({
  primaryDocType,
  doneDoc,
  doneCustomer,
  doneLegal,
}: {
  primaryDocType: DocType;
  doneDoc: boolean;
  doneCustomer: boolean;
  doneLegal: boolean;
}) {
  const t = await getTranslations("App.dashboard.firstTask");
  const td = await getTranslations("App.dashboard.docNames");
  const doc = td(primaryDocType);

  const docStep = {
    icon: FilePlus2,
    title: t("step1", { doc }),
    sub: t("step1Sub"),
    href: `/${primaryDocType}s/new`,
    done: doneDoc,
  };
  const customerStep = {
    icon: UserPlus,
    title: t("step2"),
    sub: t("step2Sub"),
    href: "/customers",
    done: doneCustomer,
  };
  const legalStep = {
    icon: Building2,
    title: t("step3"),
    sub: t("step3Sub"),
    href: "/settings",
    done: doneLegal,
  };

  // Issuing a document requires legal details (isLegalComplete), so without
  // them "issue your first {doc}" silently bounces to Settings. Surface the
  // legal step FIRST until it's done — then it's the obvious next action,
  // not a surprise redirect.
  const steps: (typeof docStep)[] = doneLegal
    ? [docStep, customerStep, legalStep]
    : [legalStep, docStep, customerStep];

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="flex items-center gap-2 bg-gradient-to-r from-brand to-primary px-4 py-3 text-white">
        <Sparkles className="h-4 w-4" />
        <div>
          <div className="font-heading text-sm font-semibold">{t("title")}</div>
          <div className="text-[12px] text-white/75">{t("sub")}</div>
        </div>
      </div>
      <div className="divide-y">
        {steps.map(({ icon: Icon, title, sub, href, done }) => (
          <div key={title} className="flex items-center gap-3 px-4 py-3">
            <span
              className={cn(
                "grid h-8 w-8 shrink-0 place-items-center rounded-full",
                done
                  ? "bg-success-soft text-success"
                  : "bg-info-soft text-primary",
              )}
            >
              {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
            </span>
            <div className="min-w-0 flex-1">
              <div
                className={cn(
                  "text-sm font-medium",
                  done && "text-muted-foreground line-through",
                )}
              >
                {title}
              </div>
              <div className="text-[12.5px] text-muted-foreground">{sub}</div>
            </div>
            {done ? (
              <span className="rounded-full bg-success-soft px-2 py-0.5 text-[11.5px] font-medium text-success">
                {t("done")}
              </span>
            ) : (
              <Link
                href={href}
                className="rounded-md bg-primary px-3 py-1.5 text-[12.5px] font-medium text-primary-foreground transition-colors hover:bg-brand"
              >
                {t("start")}
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

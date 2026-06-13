import { getTranslations, setRequestLocale } from "next-intl/server";
import { Plus } from "lucide-react";

import { auth } from "@/lib/auth";
import { isLegalComplete, requireOnboarded } from "@/lib/queries/company";
import { industryConfig } from "@/lib/guidance/industry-config";
import { getVatThresholdStatus } from "@/lib/guidance/threshold-watch";
import {
  isVatNudgeArmed,
  type DismissedNudges,
} from "@/lib/guidance/threshold-logic";
import { FirstTaskCard } from "@/components/app/first-task-card";
import { VatThresholdNudge, WhtInfoCard } from "@/components/app/nudge-cards";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import {
  getDashboardStats,
  getMonthlyInvoiceTrend,
  getRecentDocuments,
  getTailoredStats,
  getTopCustomersThisMonth,
  getWorkspaceCounts,
} from "@/lib/queries/dashboard";
import type { DocType } from "@/lib/db/schema";

function fmtMoney(n: number): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function fmtInt(n: number): string {
  return n.toLocaleString("en-US");
}

const TYPE_PATH: Record<DocType | "wht", string> = {
  quotation: "/quotations",
  invoice: "/invoices",
  receipt: "/receipts",
  wht: "/wht",
};

const STATUS_CLASSES: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  issued: "bg-blue-100 text-blue-700",
  paid: "bg-emerald-100 text-emerald-700",
  void: "bg-rose-100 text-rose-700",
};

function monthLabel(yearMonth: string, locale: string): string {
  // "2026-05" → e.g. "May 2026" / "พ.ค. 2026" depending on locale.
  const [yStr, mStr] = yearMonth.split("-");
  const d = new Date(Date.UTC(Number(yStr), Number(mStr) - 1, 1));
  try {
    return new Intl.DateTimeFormat(locale === "th" ? "th-TH" : "en-US", {
      month: "short",
      year: "2-digit",
    }).format(d);
  } catch {
    return yearMonth;
  }
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { company } = await requireOnboarded(locale);

  const session = await auth();
  const t = await getTranslations("App.dashboard");
  const tDoc = await getTranslations("Documents");
  const [stats, tailored, counts, recent, topCustomers, trend] =
    await Promise.all([
      getDashboardStats(),
      getTailoredStats(),
      getWorkspaceCounts(),
      getRecentDocuments(10),
      getTopCustomersThisMonth(5),
      getMonthlyInvoiceTrend(6),
    ]);

  const cfg = industryConfig(company.industry);

  // KPI 1 follows the industry's emphasis; KPI 3 swaps between WHT-received
  // tracking and VAT depending on the profile (Pillar C). Every figure is a
  // real aggregate — receipt-primary industries read receipts, not the
  // invoice-only stats that would show them ฿0.
  const emphasisCard =
    cfg.dashboardEmphasis === "billing"
      ? {
          key: "kpiCollected",
          primary: fmtMoney(tailored.receiptsCollectedThisMonth),
          secondary: "THB",
        }
      : cfg.dashboardEmphasis === "projects"
        ? {
            key: "kpiOpenQuotations",
            primary: fmtInt(tailored.openQuotations),
            secondary: t("kpiOpenQuotationsSub"),
          }
        : {
            key: "kpiSales",
            primary: fmtMoney(stats.invoicesTotal),
            secondary: "THB",
          };

  const taxCard = cfg.showWhtIssuing
    ? {
        key: "whtWithheld",
        primary: fmtMoney(stats.whtWithheld),
        secondary: "THB",
      }
    : {
        key: "vatCollected",
        primary:
          company.vatRegistered === "yes" ? fmtMoney(stats.vatCollected) : "—",
        secondary: company.vatRegistered === "yes" ? "THB" : "",
      };

  const cards = [
    emphasisCard,
    {
      key: "kpiDocuments",
      primary: fmtInt(tailored.documentsThisMonth),
      secondary: "",
    },
    taxCard,
    {
      key: "outstanding",
      primary: fmtMoney(stats.outstanding),
      secondary: "THB",
    },
  ];

  const doneDoc =
    counts.quotation + counts.invoice + counts.receipt + counts.wht > 0;
  const doneCustomer = counts.customers > 0;
  const doneLegal = isLegalComplete(company);
  const showFirstTask = !(doneDoc && doneCustomer && doneLegal);

  // Proactive nudges (plan D9) — real trailing-12-month data, persistent
  // dismissals, legal-deadline re-arming.
  const vatStatus = await getVatThresholdStatus();
  const dismissed = (company.dismissedNudges ?? {}) as DismissedNudges;
  const showVatNudge =
    vatStatus.shouldNudge &&
    isVatNudgeArmed(dismissed.vatThreshold, vatStatus.ratio, new Date());
  // Educational card for industries whose clients withhold (the #1 fear
  // moment: "why is my money short 3%?"). Permanent dismissal.
  const showWhtInfo = cfg.showWhtIssuing && !dismissed.whtInfo;

  // Chart scale — guard against all-zero so empty months don't divide by 0.
  const maxTrend = Math.max(...trend.map((p) => p.total), 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-semibold">
          {t("welcome")}
          {session?.user?.email ? `, ${session.user.email}` : ""}
        </h1>
        <Link
          href={`/${cfg.primaryDocType}s/new`}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-brand"
        >
          <Plus className="h-4 w-4" />
          {t("newDoc", { doc: t(`docNames.${cfg.primaryDocType}`) })}
        </Link>
      </div>

      {showFirstTask ? (
        <FirstTaskCard
          primaryDocType={cfg.primaryDocType}
          doneDoc={doneDoc}
          doneCustomer={doneCustomer}
          doneLegal={doneLegal}
        />
      ) : null}

      {showVatNudge ? (
        <VatThresholdNudge
          revenue12m={vatStatus.revenue12m}
          ratio={vatStatus.ratio}
        />
      ) : null}
      {showWhtInfo ? <WhtInfoCard /> : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ key, primary, secondary }) => (
          <Card key={key}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t(key)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{primary}</p>
              <p className="text-xs text-muted-foreground">{secondary}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("trendTitle")}</CardTitle>
          <CardDescription>{t("trendSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          {trend.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("trendEmpty")}</p>
          ) : (
            <div className="flex items-end gap-3 h-40">
              {trend.map((p) => {
                const heightPct = (p.total / maxTrend) * 100;
                return (
                  <div
                    key={p.yearMonth}
                    className="flex flex-1 flex-col items-center gap-1"
                  >
                    <div className="flex w-full flex-1 items-end">
                      <div
                        className="w-full rounded-t-sm bg-primary/80 transition-all hover:bg-primary"
                        style={{
                          height: `${Math.max(heightPct, 2)}%`,
                        }}
                        title={`${fmtMoney(p.total)} THB`}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {monthLabel(p.yearMonth, locale)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("recentTitle")}</CardTitle>
            <CardDescription>{t("recentSubtitle")}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {recent.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-muted-foreground">
                {t("recentEmpty")}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{tDoc("table.runningNumber")}</TableHead>
                    <TableHead>{tDoc("table.customer")}</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      {t("type")}
                    </TableHead>
                    <TableHead className="text-right">
                      {tDoc("table.total")}
                    </TableHead>
                    <TableHead>{tDoc("table.status")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recent.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`${TYPE_PATH[r.type]}/${r.id}`}
                          className="hover:underline"
                        >
                          {r.runningNumber}
                        </Link>
                      </TableCell>
                      <TableCell>{r.customerName}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {tDoc(`types.${r.type}`)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {fmtMoney(r.total)} {r.currency}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-medium",
                            STATUS_CLASSES[r.status] ?? STATUS_CLASSES.draft,
                          )}
                        >
                          {tDoc(`status.${r.status}`)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("topCustomersTitle")}</CardTitle>
            <CardDescription>{t("topCustomersSubtitle")}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {topCustomers.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-muted-foreground">
                {t("topCustomersEmpty")}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{tDoc("table.customer")}</TableHead>
                    <TableHead className="text-right">
                      {t("invoiceCount")}
                    </TableHead>
                    <TableHead className="text-right">
                      {tDoc("table.total")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topCustomers.map((c) => (
                    <TableRow key={c.name}>
                      <TableCell>{c.name}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {fmtInt(c.invoiceCount)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {fmtMoney(c.total)} THB
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

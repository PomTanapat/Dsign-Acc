"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import type { DocType, DocumentRow } from "@/lib/db/schema";

type Props = {
  type: DocType;
  documents: DocumentRow[];
  /** This list is the user's industry-primary document type — its empty
      state gets the encouraging "your main document" line (Pillar C). */
  isPrimary?: boolean;
};

const STATUS_CLASSES: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  issued: "bg-blue-100 text-blue-700",
  paid: "bg-emerald-100 text-emerald-700",
  void: "bg-rose-100 text-rose-700",
};

function fmt(n: string | number): string {
  return Number(n).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

type StatusFilter = "all" | "issued" | "void" | "paid" | "draft";

export function DocumentsClient({ type, documents, isPrimary }: Props) {
  const t = useTranslations(
    type === "quotation"
      ? "Quotations"
      : type === "invoice"
        ? "Invoices"
        : "Receipts",
  );
  const tDoc = useTranslations("Documents");
  const tFilters = useTranslations("Documents.filters");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return documents.filter((d) => {
      if (status !== "all" && d.status !== status) return false;
      if (from && d.issueDate < from) return false;
      if (to && d.issueDate > to) return false;
      if (q) {
        const snap = d.customerSnapshot as { name?: string };
        const haystack =
          `${d.runningNumber} ${snap?.name ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [documents, search, status, from, to]);

  // Track whether any filter is active — drives a slightly different empty
  // message ("nothing matches" vs "no documents at all").
  const hasFilter =
    search.trim() !== "" || status !== "all" || from !== "" || to !== "";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button asChild>
          <Link href={`/${type}s/new`}>
            <Plus className="h-4 w-4" />
            <span className="ml-2">{t("newButton")}</span>
          </Link>
        </Button>
      </div>

      {documents.length === 0 ? (
        <div className="rounded-lg border bg-background p-12 text-center">
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
          {isPrimary ? (
            <p className="mt-1 text-sm text-primary">
              {tDoc("emptyPrimaryHint")}
            </p>
          ) : null}
        </div>
      ) : (
        <>
          <div className="grid gap-3 rounded-lg border bg-background p-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="docs-search" className="text-xs">
                {tFilters("search")}
              </Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="docs-search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={tFilters("searchPlaceholder")}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="docs-status" className="text-xs">
                {tFilters("status")}
              </Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as StatusFilter)}
              >
                <SelectTrigger id="docs-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{tFilters("statusAll")}</SelectItem>
                  <SelectItem value="issued">
                    {tDoc("status.issued")}
                  </SelectItem>
                  <SelectItem value="paid">{tDoc("status.paid")}</SelectItem>
                  <SelectItem value="void">{tDoc("status.void")}</SelectItem>
                  <SelectItem value="draft">{tDoc("status.draft")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="docs-from" className="text-xs">
                {tFilters("from")}
              </Label>
              <Input
                id="docs-from"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="docs-to" className="text-xs">
                {tFilters("to")}
              </Label>
              <Input
                id="docs-to"
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-lg border bg-background p-12 text-center">
              <p className="text-sm text-muted-foreground">
                {hasFilter ? tFilters("noMatches") : t("empty")}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border bg-background">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{tDoc("table.runningNumber")}</TableHead>
                    <TableHead>{tDoc("table.customer")}</TableHead>
                    <TableHead>{tDoc("table.issueDate")}</TableHead>
                    <TableHead className="text-right">
                      {tDoc("table.total")}
                    </TableHead>
                    <TableHead>{tDoc("table.status")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((d) => {
                    const snap = d.customerSnapshot as { name: string };
                    return (
                      <TableRow key={d.id} className="cursor-pointer">
                        <TableCell className="font-medium">
                          <Link
                            href={`/${type}s/${d.id}`}
                            className="hover:underline"
                          >
                            {d.runningNumber}
                          </Link>
                        </TableCell>
                        <TableCell>{snap?.name ?? "—"}</TableCell>
                        <TableCell>{d.issueDate}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {fmt(d.total)} {d.currency}
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-xs font-medium",
                              STATUS_CLASSES[d.status] ?? STATUS_CLASSES.draft,
                            )}
                          >
                            {tDoc(`status.${d.status}`)}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

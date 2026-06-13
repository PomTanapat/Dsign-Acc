"use client";

import { useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useForm, useFieldArray, type Resolver } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "@/i18n/routing";
import { createDocument } from "@/app/actions/documents";
import { calculateDocument } from "@/lib/documents/calc";
import type { DocType, Customer, Item } from "@/lib/db/schema";

type Props = {
  type: DocType;
  customers: Customer[];
  items: Item[];
};

// All-string form shape — HTML inputs only know strings. We convert at
// submit time. Keeping it stringy also lets us show empty inputs cleanly
// instead of forced zeroes.
type LineFormShape = {
  itemId: string | null;
  description: string;
  quantity: string;
  unitPrice: string;
  discountPercent: string;
  vatRate: string;
};

type FormShape = {
  customerId: string;
  issueDate: string;
  dueDate: string;
  whtRate: string; // "0" / "1" / "3" / "5"
  notes: string;
  lines: LineFormShape[];
};

function todayIso(): string {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function plusDaysIso(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function emptyLine(): LineFormShape {
  return {
    itemId: null,
    description: "",
    quantity: "1",
    unitPrice: "0.00",
    discountPercent: "0",
    vatRate: "7",
  };
}

function num(s: string): number {
  const v = parseFloat(s);
  return Number.isFinite(v) ? v : 0;
}

function fmt(n: number): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function DocumentForm({ type, customers, items }: Props) {
  const t = useTranslations("DocumentForm");
  const tCommon = useTranslations("Common");
  const tDoc = useTranslations("Documents");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  // useFieldArray on a stringy shape is fine — react-hook-form doesn't
  // try to validate types until the resolver runs (we don't pass one;
  // server action does final validation).
  const form = useForm<FormShape>({
    defaultValues: {
      customerId: "",
      issueDate: todayIso(),
      dueDate: type === "invoice" ? plusDaysIso(todayIso(), 30) : "",
      whtRate: "0",
      notes: "",
      lines: [emptyLine()],
    },
    // No zod resolver here — server action is the source of truth.
    resolver: undefined as unknown as Resolver<FormShape>,
  });
  const { control, register, handleSubmit, watch, setValue, getValues } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "lines" });

  const watchedLines = watch("lines");
  const watchedWht = watch("whtRate");

  // Live totals — recompute on every render. Cheap for handful of lines.
  const liveTotals = useMemo(() => {
    const parsed = watchedLines.map((l, i) => ({
      sortOrder: i,
      itemId: l.itemId,
      description: l.description,
      quantity: num(l.quantity),
      unitPrice: num(l.unitPrice),
      discountPercent: num(l.discountPercent),
      vatRate: num(l.vatRate),
    }));
    const whtRate = num(watchedWht);
    return calculateDocument(parsed, whtRate || null);
  }, [watchedLines, watchedWht]);

  function addFromItem(itemId: string) {
    const it = items.find((x) => x.id === itemId);
    if (!it) return;
    append({
      itemId: it.id,
      description: it.description || it.name,
      quantity: "1",
      unitPrice: it.unitPrice,
      discountPercent: "0",
      vatRate: it.vatApplicable ? "7" : "0",
    });
  }

  const onSubmit = handleSubmit(() => {
    setFormError(null);
    const v = getValues();
    if (!v.customerId) {
      setFormError(t("errors.customerRequired"));
      return;
    }
    if (v.lines.length === 0) {
      setFormError(t("errors.noLines"));
      return;
    }

    const payload = {
      type,
      customerId: v.customerId,
      issueDate: v.issueDate,
      dueDate: v.dueDate || null,
      notes: v.notes,
      lines: v.lines.map((l, i) => ({
        sortOrder: i,
        itemId: l.itemId || null,
        description: l.description,
        quantity: num(l.quantity),
        unitPrice: num(l.unitPrice),
        discountPercent: num(l.discountPercent),
        vatRate: num(l.vatRate),
      })),
      whtRate: type === "invoice" ? num(v.whtRate) : null,
    };

    startTransition(async () => {
      const res = await createDocument(payload);
      if (res.success && res.data) {
        router.push(`/${type}s/${res.data.documentId}`);
      } else {
        setFormError(res.success ? "generic" : res.error || "generic");
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      {formError ? (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="customerId">
            {t("customer")} <span className="text-destructive">*</span>
          </Label>
          <Select
            value={watch("customerId")}
            onValueChange={(v) => setValue("customerId", v)}
          >
            <SelectTrigger id="customerId">
              <SelectValue placeholder={t("customerPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {customers.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="issueDate">{t("issueDate")}</Label>
          <Input id="issueDate" type="date" {...register("issueDate")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dueDate">{t("dueDate")}</Label>
          <Input id="dueDate" type="date" {...register("dueDate")} />
        </div>
      </div>

      {/* Line items */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-medium">{t("lines")}</h2>
          <div className="flex flex-wrap gap-2">
            <Select onValueChange={(v) => addFromItem(v)}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder={t("addFromCatalog")} />
              </SelectTrigger>
              <SelectContent>
                {items
                  .filter((i) => i.isActive)
                  .map((i) => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              onClick={() => append(emptyLine())}
            >
              <Plus className="h-4 w-4" />
              <span className="ml-2">{t("addFreeText")}</span>
            </Button>
          </div>
        </div>

        <div className="rounded-md border bg-background">
          <div className="grid grid-cols-[1fr_70px_90px_70px_70px_90px_40px] gap-2 border-b bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground">
            <span>{t("table.description")}</span>
            <span className="text-right">{t("table.qty")}</span>
            <span className="text-right">{t("table.unitPrice")}</span>
            <span className="text-right">{t("table.discount")}</span>
            <span className="text-right">{t("table.vat")}</span>
            <span className="text-right">{t("table.amount")}</span>
            <span />
          </div>

          {fields.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              {t("noLinesYet")}
            </p>
          ) : (
            fields.map((f, idx) => {
              const l = liveTotals.computedLines[idx];
              return (
                <div
                  key={f.id}
                  className="grid grid-cols-[1fr_70px_90px_70px_70px_90px_40px] items-center gap-2 border-b px-3 py-2 last:border-b-0"
                >
                  <Input
                    placeholder={t("table.descriptionPlaceholder")}
                    {...register(`lines.${idx}.description`)}
                  />
                  <Input
                    className="text-right"
                    inputMode="decimal"
                    {...register(`lines.${idx}.quantity`)}
                  />
                  <Input
                    className="text-right"
                    inputMode="decimal"
                    {...register(`lines.${idx}.unitPrice`)}
                  />
                  <Input
                    className="text-right"
                    inputMode="decimal"
                    {...register(`lines.${idx}.discountPercent`)}
                  />
                  <Select
                    value={watch(`lines.${idx}.vatRate`)}
                    onValueChange={(v) =>
                      setValue(`lines.${idx}.vatRate`, v)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0%</SelectItem>
                      <SelectItem value="7">7%</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-right tabular-nums">
                    {l ? fmt(l.lineTotal) : "—"}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={tCommon("delete")}
                    onClick={() => remove(idx)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          {type === "invoice" ? (
            <div className="space-y-1.5">
              <Label htmlFor="whtRate">{t("whtRate")}</Label>
              <Select
                value={watch("whtRate")}
                onValueChange={(v) => setValue("whtRate", v)}
              >
                <SelectTrigger id="whtRate">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">{t("whtNone")}</SelectItem>
                  <SelectItem value="1">1%</SelectItem>
                  <SelectItem value="3">3%</SelectItem>
                  <SelectItem value="5">5%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="notes">{t("notes")}</Label>
            <Textarea id="notes" rows={4} {...register("notes")} />
          </div>
        </div>

        <div className="rounded-md border bg-muted/30 p-4 text-sm">
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">{tDoc("subtotal")}</span>
            <span className="tabular-nums">{fmt(liveTotals.totals.subtotal)}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">{tDoc("vat")}</span>
            <span className="tabular-nums">{fmt(liveTotals.totals.vatAmount)}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">{tDoc("total")}</span>
            <span className="tabular-nums">{fmt(liveTotals.totals.total)}</span>
          </div>
          {liveTotals.totals.whtAmount > 0 ? (
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">{tDoc("wht")}</span>
              <span className="tabular-nums">
                −{fmt(liveTotals.totals.whtAmount)}
              </span>
            </div>
          ) : null}
          <div className="mt-2 flex justify-between border-t pt-2 font-semibold">
            <span>{tDoc("netPayable")}</span>
            <span className="tabular-nums">{fmt(liveTotals.totals.netPayable)}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? tCommon("saving") : t("issue")}
        </Button>
      </div>
    </form>
  );
}

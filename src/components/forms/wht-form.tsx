"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
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
import { Explainer } from "@/components/guidance/explainer";
import { useRouter } from "@/i18n/routing";
import { createWhtCertificate } from "@/app/actions/wht";
import { calculateWhtLine, calculateWhtTotals } from "@/lib/documents/wht-calc";
import {
  WHT_INCOME_TYPES,
  WHT_INCOME_TYPE_CODES,
  type WhtIncomeTypeCode,
} from "@/lib/documents/wht-types";
import type { Customer } from "@/lib/db/schema";

export type InvoicePrefill = {
  invoiceId: string;
  runningNumber: string;
  customerId: string;
  customerName: string;
  subtotal: number;
  whtRate: number | null;
};

type Props = {
  customers: Customer[];
  prefill?: InvoicePrefill | null;
  // Locale only used to pick Thai vs English income-type labels.
  locale: string;
};

type LineFormShape = {
  code: WhtIncomeTypeCode;
  description: string;
  paymentDate: string;
  grossAmount: string;
  rate: string;
};

type FormShape = {
  customerId: string;
  invoiceId: string | null;
  formType: "pnd3" | "pnd53";
  paymentDate: string;
  paymentMethod: "withheld" | "paid_for_payee" | "other";
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

function emptyLine(): LineFormShape {
  return {
    code: "40_8",
    description: "",
    paymentDate: todayIso(),
    grossAmount: "0.00",
    // Default to the canonical rate for the default code.
    rate: String(WHT_INCOME_TYPES["40_8"].defaultRate),
  };
}

export function WhtForm({ customers, prefill, locale }: Props) {
  const t = useTranslations("WhtForm");
  const tCommon = useTranslations("Common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const useEnLabels = locale === "en";

  // If we arrived from an invoice, seed the form with a single line that
  // references the invoice number.
  const initialLines = useMemo<LineFormShape[]>(() => {
    if (!prefill) return [emptyLine()];
    const rate = prefill.whtRate ?? WHT_INCOME_TYPES["40_8"].defaultRate;
    return [
      {
        code: "40_8",
        description: `อ้างถึงใบกำกับภาษี ${prefill.runningNumber}`,
        paymentDate: todayIso(),
        grossAmount: prefill.subtotal.toFixed(2),
        rate: String(rate),
      },
    ];
  }, [prefill]);

  const initialCustomerId = prefill?.customerId ?? "";
  const initialFormType = useMemo<"pnd3" | "pnd53">(() => {
    if (!initialCustomerId) return "pnd3";
    const c = customers.find((x) => x.id === initialCustomerId);
    return c?.isJuristic ? "pnd53" : "pnd3";
  }, [initialCustomerId, customers]);

  const form = useForm<FormShape>({
    defaultValues: {
      customerId: initialCustomerId,
      invoiceId: prefill?.invoiceId ?? null,
      formType: initialFormType,
      paymentDate: todayIso(),
      paymentMethod: "withheld",
      notes: "",
      lines: initialLines,
    },
    // Server action is the source of truth for validation.
    resolver: undefined as unknown as Resolver<FormShape>,
  });
  const { control, register, handleSubmit, watch, setValue, getValues } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "lines" });

  const watchedCustomerId = watch("customerId");
  const watchedLines = watch("lines");

  // Auto-flip formType when the customer changes. Operators can still
  // override manually via the radios below.
  useEffect(() => {
    if (!watchedCustomerId) return;
    const c = customers.find((x) => x.id === watchedCustomerId);
    if (!c) return;
    setValue("formType", c.isJuristic ? "pnd53" : "pnd3");
  }, [watchedCustomerId, customers, setValue]);

  // Live totals — cheap to recompute on every keystroke.
  const liveTotals = useMemo(() => {
    const lines = watchedLines.map((l) => {
      const gross = num(l.grossAmount);
      const rate = num(l.rate);
      const { withheldAmount } = calculateWhtLine(gross, rate);
      return {
        code: l.code,
        description: l.description,
        paymentDate: l.paymentDate,
        grossAmount: gross,
        rate,
        withheldAmount,
      };
    });
    return { lines, totals: calculateWhtTotals(lines) };
  }, [watchedLines]);

  function onCodeChange(idx: number, code: WhtIncomeTypeCode) {
    setValue(`lines.${idx}.code`, code);
    // Auto-fill rate from the canonical table. Operator can still edit.
    setValue(`lines.${idx}.rate`, String(WHT_INCOME_TYPES[code].defaultRate));
  }

  function labelFor(code: WhtIncomeTypeCode): string {
    // i18n message keys can't contain dots → swap to `_dot_` in keys.
    return useEnLabels
      ? WHT_INCOME_TYPES[code].enLabel
      : WHT_INCOME_TYPES[code].thLabel;
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
      customerId: v.customerId,
      invoiceId: v.invoiceId,
      formType: v.formType,
      paymentDate: v.paymentDate,
      paymentMethod: v.paymentMethod,
      notes: v.notes,
      lines: v.lines.map((l) => {
        const gross = num(l.grossAmount);
        const rate = num(l.rate);
        const { withheldAmount } = calculateWhtLine(gross, rate);
        return {
          code: l.code,
          description: l.description,
          paymentDate: l.paymentDate,
          grossAmount: gross,
          rate,
          withheldAmount,
        };
      }),
    };

    startTransition(async () => {
      const res = await createWhtCertificate(payload);
      if (res.success && res.data) {
        router.push(`/wht/${res.data.certificateId}`);
      } else {
        // Map known server error keys to translations; fall back to a
        // generic message so users never see raw `formTypeMismatch`-style
        // strings in the UI.
        const known = [
          "formTypeMismatch",
          "customerNotFound",
          "invoiceNotFound",
          "noCompany",
          "validation",
        ] as const;
        const key = res.success
          ? undefined
          : (res.error as (typeof known)[number] | undefined);
        setFormError(
          key && (known as readonly string[]).includes(key)
            ? t(`errors.${key}`)
            : t("errors.generic"),
        );
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
            {t("payee")} <span className="text-destructive">*</span>
          </Label>
          <Select
            value={watch("customerId")}
            onValueChange={(v) => setValue("customerId", v)}
          >
            <SelectTrigger id="customerId">
              <SelectValue placeholder={t("payeePlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {customers.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name} {c.isJuristic ? "(นิติบุคคล)" : "(บุคคล)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Explainer term="juristic" compact />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="paymentDate">{t("paymentDate")}</Label>
          <Input
            id="paymentDate"
            type="date"
            {...register("paymentDate")}
          />
        </div>

        <div className="space-y-1.5">
          <Label>{t("formType")}</Label>
          <div className="flex gap-4 pt-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                value="pnd3"
                checked={watch("formType") === "pnd3"}
                onChange={() => setValue("formType", "pnd3")}
              />
              {t("formTypePnd3")}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                value="pnd53"
                checked={watch("formType") === "pnd53"}
                onChange={() => setValue("formType", "pnd53")}
              />
              {t("formTypePnd53")}
            </label>
          </div>
          <Explainer term="whtIssued" />
        </div>
      </div>

      {prefill ? (
        <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
          {t("fromInvoice", { number: prefill.runningNumber })}
        </div>
      ) : null}

      {/* Income lines */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-medium">{t("lines")}</h2>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (fields.length >= 8) return;
              append(emptyLine());
            }}
            disabled={fields.length >= 8}
          >
            <Plus className="h-4 w-4" />
            <span className="ml-2">{t("addLine")}</span>
          </Button>
        </div>

        <div className="overflow-hidden rounded-md border bg-background">
          <div className="grid grid-cols-[1.5fr_1.4fr_110px_90px_70px_100px_40px] gap-2 border-b bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground">
            <span>{t("table.code")}</span>
            <span>{t("table.description")}</span>
            <span>{t("table.paymentDate")}</span>
            <span className="text-right">{t("table.gross")}</span>
            <span className="text-right">{t("table.rate")}</span>
            <span className="text-right">{t("table.withheld")}</span>
            <span />
          </div>

          {fields.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              {t("noLinesYet")}
            </p>
          ) : (
            fields.map((f, idx) => {
              const computed = liveTotals.lines[idx];
              return (
                <div
                  key={f.id}
                  className="grid grid-cols-[1.5fr_1.4fr_110px_90px_70px_100px_40px] items-center gap-2 border-b px-3 py-2 last:border-b-0"
                >
                  <Select
                    value={watch(`lines.${idx}.code`)}
                    onValueChange={(v) =>
                      onCodeChange(idx, v as WhtIncomeTypeCode)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WHT_INCOME_TYPE_CODES.map((code) => (
                        <SelectItem key={code} value={code}>
                          {labelFor(code)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder={t("table.descriptionPlaceholder")}
                    {...register(`lines.${idx}.description`)}
                  />
                  <Input
                    type="date"
                    {...register(`lines.${idx}.paymentDate`)}
                  />
                  <Input
                    className="text-right"
                    inputMode="decimal"
                    {...register(`lines.${idx}.grossAmount`)}
                  />
                  <Input
                    className="text-right"
                    inputMode="decimal"
                    {...register(`lines.${idx}.rate`)}
                  />
                  <span className="text-right tabular-nums text-sm">
                    {computed ? fmt(computed.withheldAmount) : "—"}
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
          <div className="space-y-1.5">
            <Label>{t("paymentMethod")}</Label>
            <div className="space-y-1 pt-1 text-sm">
              {(["withheld", "paid_for_payee", "other"] as const).map((m) => (
                <label key={m} className="flex items-center gap-2">
                  <input
                    type="radio"
                    value={m}
                    checked={watch("paymentMethod") === m}
                    onChange={() => setValue("paymentMethod", m)}
                  />
                  {t(`paymentMethodOptions.${m}`)}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">{t("notes")}</Label>
            <Textarea id="notes" rows={4} {...register("notes")} />
          </div>
        </div>

        <div className="rounded-md border bg-muted/30 p-4 text-sm">
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">{t("totalGross")}</span>
            <span className="tabular-nums">
              {fmt(liveTotals.totals.totalGross)}
            </span>
          </div>
          <div className="mt-2 flex justify-between border-t pt-2 font-semibold">
            <span>{t("totalWithheld")}</span>
            <span className="tabular-nums">
              {fmt(liveTotals.totals.totalWithheld)}
            </span>
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

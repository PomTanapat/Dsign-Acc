"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Explainer } from "@/components/guidance/explainer";
import { createItem, updateItem } from "@/app/actions/items";
import { itemSchema } from "@/lib/validation/item";
import type { Item } from "@/lib/db/schema";

type Props = {
  initialValues: Item | null;
  onSuccess: () => void;
  onCancel: () => void;
};

type FormShape = {
  name: string;
  description: string;
  unit: string;
  unitPrice: string;
  vatApplicable: boolean;
  whtRate: "" | "1.00" | "3.00" | "5.00";
  isActive: boolean;
};

function toFormShape(i: Item | null): FormShape {
  let wht: FormShape["whtRate"] = "";
  if (i?.whtRate === "1.00" || i?.whtRate === "3.00" || i?.whtRate === "5.00") {
    wht = i.whtRate;
  }
  return {
    name: i?.name ?? "",
    description: i?.description ?? "",
    unit: i?.unit ?? "ชิ้น",
    unitPrice: i?.unitPrice ?? "",
    vatApplicable: i?.vatApplicable ?? true,
    whtRate: wht,
    isActive: i?.isActive ?? true,
  };
}

export function ItemForm({ initialValues, onSuccess, onCancel }: Props) {
  const t = useTranslations("Items");
  const tCommon = useTranslations("Common");
  const [pending, startTransition] = useTransition();

  const form = useForm<FormShape>({
    resolver: zodResolver(itemSchema),
    defaultValues: toFormShape(initialValues),
    mode: "onBlur",
  });

  const onSubmit = form.handleSubmit(() => {
    const formEl = document.getElementById(
      "item-form",
    ) as HTMLFormElement | null;
    if (!formEl) return;
    const fd = new FormData(formEl);
    fd.set("vatApplicable", form.getValues("vatApplicable") ? "true" : "false");
    fd.set("isActive", form.getValues("isActive") ? "true" : "false");

    startTransition(async () => {
      const result = initialValues
        ? await updateItem(initialValues.id, fd)
        : await createItem(fd);

      if (result.success) {
        onSuccess();
      } else if (result.fieldErrors) {
        for (const [field, errs] of Object.entries(result.fieldErrors)) {
          if (errs && errs.length > 0) {
            form.setError(field as keyof FormShape, {
              type: "server",
              message: errs[0],
            });
          }
        }
      } else {
        form.setError("root", { type: "server", message: result.error });
      }
    });
  });

  const errors = form.formState.errors;
  const vatApplicable = form.watch("vatApplicable");
  const isActive = form.watch("isActive");

  return (
    <form id="item-form" onSubmit={onSubmit} className="space-y-4" noValidate>
      {errors.root?.message && (
        <Alert variant="destructive">
          <AlertDescription>{t("saveError")}</AlertDescription>
        </Alert>
      )}

      <Field
        id="name"
        label={t("fields.name")}
        required
        error={errors.name?.message}
      >
        <Input id="name" {...form.register("name")} />
      </Field>

      <Field
        id="description"
        label={t("fields.description")}
        error={errors.description?.message}
      >
        <Textarea id="description" rows={2} {...form.register("description")} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="unit"
          label={t("fields.unit")}
          required
          error={errors.unit?.message}
        >
          <Input id="unit" {...form.register("unit")} />
        </Field>
        <Field
          id="unitPrice"
          label={t("fields.unitPrice")}
          required
          error={errors.unitPrice?.message}
        >
          <Input
            id="unitPrice"
            type="number"
            step="0.01"
            min="0"
            {...form.register("unitPrice")}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="whtRate"
          label={t("fields.whtRate")}
          error={errors.whtRate?.message}
          hint={t("fields.whtRateHint")}
        >
          <select
            id="whtRate"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            {...form.register("whtRate")}
          >
            <option value="">{t("fields.whtNone")}</option>
            <option value="1.00">1%</option>
            <option value="3.00">3%</option>
            <option value="5.00">5%</option>
          </select>
          <Explainer term="whtIssued" compact />
        </Field>
        <div className="space-y-2">
          <div className="flex items-center gap-2 pt-7">
            <Checkbox
              id="vatApplicable"
              checked={vatApplicable}
              onCheckedChange={(v) =>
                form.setValue("vatApplicable", v === true)
              }
            />
            <Label htmlFor="vatApplicable" className="cursor-pointer">
              {t("fields.vatApplicable")}
            </Label>
          </div>
          <Explainer term="vat" compact />
          <div className="flex items-center gap-2">
            <Checkbox
              id="isActive"
              checked={isActive}
              onCheckedChange={(v) => form.setValue("isActive", v === true)}
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              {t("fields.isActive")}
            </Label>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          {tCommon("cancel")}
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? tCommon("saving") : tCommon("save")}
        </Button>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  required,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      {children}
      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

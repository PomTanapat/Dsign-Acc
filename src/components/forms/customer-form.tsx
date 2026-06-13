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
import {
  createCustomer,
  updateCustomer,
} from "@/app/actions/customers";
import { customerSchema } from "@/lib/validation/customer";
import type { Customer } from "@/lib/db/schema";

type Props = {
  initialValues: Customer | null;
  onSuccess: () => void;
  onCancel: () => void;
};

type FormShape = {
  name: string;
  tin: string;
  branchCode: string;
  isJuristic: boolean;
  address: string;
  email: string;
  phone: string;
  notes: string;
};

function toFormShape(c: Customer | null): FormShape {
  return {
    name: c?.name ?? "",
    tin: c?.tin ?? "",
    branchCode: c?.branchCode ?? "",
    isJuristic: c?.isJuristic ?? false,
    address: c?.address ?? "",
    email: c?.email ?? "",
    phone: c?.phone ?? "",
    notes: c?.notes ?? "",
  };
}

export function CustomerForm({ initialValues, onSuccess, onCancel }: Props) {
  const t = useTranslations("Customers");
  const tCommon = useTranslations("Common");
  const [pending, startTransition] = useTransition();

  const form = useForm<FormShape>({
    resolver: zodResolver(customerSchema),
    defaultValues: toFormShape(initialValues),
    mode: "onBlur",
  });

  const isJuristic = form.watch("isJuristic");

  const onSubmit = form.handleSubmit(() => {
    const formEl = document.getElementById(
      "customer-form",
    ) as HTMLFormElement | null;
    if (!formEl) return;
    const fd = new FormData(formEl);
    // Translate checkbox state explicitly so the action gets a stable boolean.
    fd.set("isJuristic", form.getValues("isJuristic") ? "true" : "false");

    startTransition(async () => {
      const result = initialValues
        ? await updateCustomer(initialValues.id, fd)
        : await createCustomer(fd);

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

  return (
    <form id="customer-form" onSubmit={onSubmit} className="space-y-4" noValidate>
      {errors.root?.message && (
        <Alert variant="destructive">
          <AlertDescription>{t("saveError")}</AlertDescription>
        </Alert>
      )}

      <div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="isJuristic"
            checked={isJuristic}
            onCheckedChange={(v) => form.setValue("isJuristic", v === true)}
          />
          <Label htmlFor="isJuristic" className="cursor-pointer">
            {t("fields.isJuristic")}
          </Label>
        </div>
        <Explainer term="juristic" />
      </div>

      <Field
        id="name"
        label={t("fields.name")}
        required
        error={errors.name?.message}
      >
        <Input id="name" {...form.register("name")} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="tin"
          label={t("fields.tin")}
          error={errors.tin?.message}
          hint={tCommon("hintDigits", { count: 13 })}
        >
          <Input id="tin" inputMode="numeric" {...form.register("tin")} />
        </Field>
        <Field
          id="branchCode"
          label={t("fields.branchCode")}
          error={errors.branchCode?.message}
        >
          <Input
            id="branchCode"
            inputMode="numeric"
            {...form.register("branchCode")}
          />
        </Field>
      </div>

      <Field
        id="address"
        label={t("fields.address")}
        error={errors.address?.message}
      >
        <Textarea id="address" rows={3} {...form.register("address")} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="email"
          label={t("fields.email")}
          error={errors.email?.message}
        >
          <Input id="email" type="email" {...form.register("email")} />
        </Field>
        <Field
          id="phone"
          label={t("fields.phone")}
          error={errors.phone?.message}
        >
          <Input id="phone" {...form.register("phone")} />
        </Field>
      </div>

      <Field id="notes" label={t("fields.notes")} error={errors.notes?.message}>
        <Textarea id="notes" rows={2} {...form.register("notes")} />
      </Field>

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

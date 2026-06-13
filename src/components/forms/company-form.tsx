"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Explainer } from "@/components/guidance/explainer";
import { saveCompany } from "@/app/actions/company";
import { companySchema } from "@/lib/validation/company";
import type { Company } from "@/lib/db/schema";

type Props = {
  initialValues: Company | null;
};

// react-hook-form's raw form values are strings (HTML inputs). The Zod schema
// transforms them to the stored shape; we deliberately resolve against the
// schema so we get the same validation server actions enforce.
type FormShape = {
  nameTh: string;
  nameEn: string;
  tin: string;
  branchCode: string;
  addressTh: string;
  addressEn: string;
  phone: string;
  email: string;
  logoUrl: string;
  signatureUrl: string;
  defaultVatRate: string;
  defaultCurrency: string;
};

function toFormShape(c: Company | null): FormShape {
  return {
    nameTh: c?.nameTh ?? "",
    nameEn: c?.nameEn ?? "",
    tin: c?.tin ?? "",
    branchCode: c?.branchCode ?? "00000",
    addressTh: c?.addressTh ?? "",
    addressEn: c?.addressEn ?? "",
    phone: c?.phone ?? "",
    email: c?.email ?? "",
    logoUrl: c?.logoUrl ?? "",
    signatureUrl: c?.signatureUrl ?? "",
    defaultVatRate: c?.defaultVatRate ?? "7.00",
    defaultCurrency: c?.defaultCurrency ?? "THB",
  };
}

export function CompanyForm({ initialValues }: Props) {
  const t = useTranslations("Settings");
  const tCommon = useTranslations("Common");
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<FormShape>({
    resolver: zodResolver(companySchema),
    defaultValues: toFormShape(initialValues),
    mode: "onBlur",
  });

  const onSubmit = form.handleSubmit(() => {
    setServerError(null);
    setSuccess(false);

    // Build FormData from the raw form element so server-side validation sees
    // exactly the strings the user typed.
    const formEl = document.getElementById(
      "company-form",
    ) as HTMLFormElement | null;
    if (!formEl) return;
    const fd = new FormData(formEl);

    startTransition(async () => {
      const result = await saveCompany(fd);
      if (result.success) {
        setSuccess(true);
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
        setServerError(result.error);
      }
    });
  });

  const errors = form.formState.errors;

  return (
    <form
      id="company-form"
      onSubmit={onSubmit}
      className="space-y-6"
      noValidate
    >
      {success && (
        <Alert variant="success">
          <AlertDescription>{t("savedSuccess")}</AlertDescription>
        </Alert>
      )}
      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{t("savedError")}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="nameTh"
          label={t("fields.nameTh")}
          required
          error={errors.nameTh?.message}
        >
          <Input id="nameTh" {...form.register("nameTh")} />
        </Field>
        <Field
          id="nameEn"
          label={t("fields.nameEn")}
          error={errors.nameEn?.message}
        >
          <Input id="nameEn" {...form.register("nameEn")} />
        </Field>
        <Field
          id="tin"
          label={t("fields.tin")}
          required
          error={errors.tin?.message}
          hint={tCommon("hintDigits", { count: 13 })}
        >
          <Input id="tin" inputMode="numeric" {...form.register("tin")} />
          <Explainer term="tin" compact />
        </Field>
        <Field
          id="branchCode"
          label={t("fields.branchCode")}
          error={errors.branchCode?.message}
          hint={t("fields.branchCodeHint")}
        >
          <Input
            id="branchCode"
            inputMode="numeric"
            {...form.register("branchCode")}
          />
          <Explainer term="branch" compact />
        </Field>
      </div>

      <Field
        id="addressTh"
        label={t("fields.addressTh")}
        required
        error={errors.addressTh?.message}
      >
        <Textarea id="addressTh" rows={3} {...form.register("addressTh")} />
      </Field>
      <Field
        id="addressEn"
        label={t("fields.addressEn")}
        error={errors.addressEn?.message}
      >
        <Textarea id="addressEn" rows={3} {...form.register("addressEn")} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="phone"
          label={t("fields.phone")}
          error={errors.phone?.message}
        >
          <Input id="phone" {...form.register("phone")} />
        </Field>
        <Field
          id="email"
          label={t("fields.email")}
          error={errors.email?.message}
        >
          <Input id="email" type="email" {...form.register("email")} />
        </Field>
        <Field
          id="logoUrl"
          label={t("fields.logoUrl")}
          error={errors.logoUrl?.message}
          hint={t("fields.uploadComingSoon")}
        >
          <Input id="logoUrl" type="url" {...form.register("logoUrl")} />
        </Field>
        <Field
          id="signatureUrl"
          label={t("fields.signatureUrl")}
          error={errors.signatureUrl?.message}
          hint={t("fields.uploadComingSoon")}
        >
          <Input
            id="signatureUrl"
            type="url"
            {...form.register("signatureUrl")}
          />
        </Field>
        <Field
          id="defaultVatRate"
          label={t("fields.defaultVatRate")}
          error={errors.defaultVatRate?.message}
        >
          <Input
            id="defaultVatRate"
            type="number"
            step="0.01"
            {...form.register("defaultVatRate")}
          />
          <Explainer term="vat" compact />
        </Field>
        <Field
          id="defaultCurrency"
          label={t("fields.defaultCurrency")}
          error={errors.defaultCurrency?.message}
        >
          <Input id="defaultCurrency" {...form.register("defaultCurrency")} />
        </Field>
      </div>

      <div className="flex justify-end">
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

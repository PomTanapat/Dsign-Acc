import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";

import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

export function Hero() {
  const t = useTranslations("Hero");
  const tTrust = useTranslations("Trust");

  return (
    <section className="border-b bg-gradient-to-b from-muted/40 to-background">
      <div className="container py-20 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-full border bg-background px-4 py-1.5 text-sm shadow-sm transition-colors hover:bg-accent"
          >
            <span>{t("badge")}</span>
            <span className="font-medium text-primary">
              {t("badgeCta")}
            </span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <h1 className="mt-8 font-heading text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground md:text-xl">
            {t("subtitle")}
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <a href="#contact">{t("ctaConsult")}</a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#services">{t("ctaServices")}</a>
            </Button>
          </div>

          <dl className="mt-12 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
            <div className="rounded-lg border bg-background p-4">
              <dt className="font-medium">{tTrust("experience")}</dt>
            </div>
            <div className="rounded-lg border bg-background p-4">
              <dt className="font-medium">{tTrust("cpa")}</dt>
            </div>
            <div className="rounded-lg border bg-background p-4">
              <dt className="font-medium">{tTrust("clients")}</dt>
            </div>
            <div className="rounded-lg border bg-background p-4">
              <dt className="font-medium">{tTrust("support")}</dt>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { LocaleSwitcher } from "@/components/locale-switcher";

export function Navbar() {
  const t = useTranslations("Nav");

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-heading text-lg font-semibold">
            Dsign Accounting
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <a href="#services" className="text-sm font-medium hover:text-primary">
            {t("services")}
          </a>
          <a href="#about" className="text-sm font-medium hover:text-primary">
            {t("about")}
          </a>
          <a href="#faq" className="text-sm font-medium hover:text-primary">
            {t("faq")}
          </a>
          <a href="#contact" className="text-sm font-medium hover:text-primary">
            {t("contact")}
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <Button asChild size="sm" variant="outline">
            <Link href="/login">{t("login")}</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/signup">{t("signup")}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

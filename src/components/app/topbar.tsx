import { getTranslations } from "next-intl/server";
import { LogOut, Sparkles } from "lucide-react";

import { signOut } from "@/lib/auth";
import type { Industry } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { LocaleSwitcher } from "@/components/locale-switcher";

export async function Topbar({
  email,
  industry,
}: {
  email: string | null | undefined;
  industry?: Industry | null;
}) {
  const t = await getTranslations("App.topbar");
  const ti = await getTranslations("Industries");

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      {/* "It understands me" — the visible product of the onboarding answers */}
      {industry ? (
        <span className="hidden items-center gap-1.5 rounded-full border border-info-border bg-info-soft px-2.5 py-1 text-[12px] font-medium text-brand lg:inline-flex">
          <Sparkles className="h-3 w-3" />
          {t("tailoredFor", { industry: ti(`${industry}.label`) })}
        </span>
      ) : (
        <div />
      )}
      <div className="flex items-center gap-3">
        {email && (
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {email}
          </span>
        )}
        <LocaleSwitcher />
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <Button type="submit" size="sm" variant="outline">
            <LogOut className="h-4 w-4" />
            <span className="ml-2">{t("signOut")}</span>
          </Button>
        </form>
      </div>
    </header>
  );
}

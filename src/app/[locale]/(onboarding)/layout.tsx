import type { ReactNode } from "react";
import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { GuidanceProvider } from "@/components/guidance/guidance-provider";
import { LocaleSwitcher } from "@/components/locale-switcher";

// Own route group, NOT nested under (app): the wizard replaces the
// sidebar/topbar shell with its full-screen split layout. It still mounts
// GuidanceProvider (mode pinned to guided — no profile exists yet) because
// the questions embed <Explainer> and mid-wizard confusion is exactly when
// "Talk to us" matters most (plan D18).
export default async function OnboardingLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  return (
    <GuidanceProvider
      mode="guided"
      defaultContact={session.user.email ?? undefined}
    >
      <div className="relative">
        <div className="absolute right-4 top-4 z-10">
          <LocaleSwitcher />
        </div>
        {children}
      </div>
    </GuidanceProvider>
  );
}

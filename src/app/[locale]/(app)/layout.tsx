import type { ReactNode } from "react";
import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { requireCompany } from "@/lib/queries/company";
import { GuidanceProvider } from "@/components/guidance/guidance-provider";
import { Sidebar } from "@/components/app/sidebar";
import { Topbar } from "@/components/app/topbar";

export default async function AppLayout({
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

  // Guidance mode + Talk-to-us live at the layout so every screen —
  // including the sidebar — can reach them. requireCompany() is memoized
  // per request (React cache), so pages re-using it cost nothing extra.
  const { company } = await requireCompany();

  return (
    <GuidanceProvider
      mode={company?.guidanceMode ?? "guided"}
      defaultContact={company?.phone ?? session.user.email ?? undefined}
    >
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Topbar email={session.user.email} />
          <main className="flex-1 bg-muted/20 p-6">{children}</main>
        </div>
      </div>
    </GuidanceProvider>
  );
}

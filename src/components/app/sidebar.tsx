"use client";

import {
  LayoutDashboard,
  FileText,
  ReceiptText,
  Receipt,
  Percent,
  Calculator,
  Users,
  Package,
  Settings,
  BookOpen,
  BadgeCheck,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

import type { Industry, TriState } from "@/lib/db/schema";
import {
  buildDocNav,
  industryConfig,
  showWhtNav,
  type DocNavCounts,
} from "@/lib/guidance/industry-config";
import { cn } from "@/lib/utils";
import { Link, usePathname } from "@/i18n/routing";
import { useGuidance } from "@/components/guidance/guidance-provider";

export type SidebarProfile = {
  industry: Industry;
  paysOthers: TriState;
};

const DOC_ICONS: Record<string, LucideIcon> = {
  quotations: FileText,
  invoices: ReceiptText,
  receipts: Receipt,
};

export function Sidebar({
  profile,
  counts,
}: {
  profile: SidebarProfile;
  counts: DocNavCounts;
}) {
  const t = useTranslations("App.sidebar");
  const tg = useTranslations("Guidance");
  const pathname = usePathname();
  const { openTalk } = useGuidance();

  const cfg = industryConfig(profile.industry);
  const docNav = buildDocNav(cfg, counts);
  const whtVisible = showWhtNav(cfg, profile.paysOthers, counts.wht);

  function Item({
    nav,
    badge,
  }: {
    nav: { key: string; href: string; icon: LucideIcon };
    badge?: boolean;
  }) {
    const active =
      pathname === nav.href || pathname.startsWith(`${nav.href}/`);
    const Icon = nav.icon;
    return (
      <Link
        href={nav.href}
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          active
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        )}
      >
        <Icon className="h-4 w-4" />
        <span className="flex-1">{t(nav.key as never)}</span>
        {badge ? (
          <span
            className={cn(
              "rounded-full px-1.5 py-px text-[10.5px] font-semibold",
              active
                ? "bg-white/20 text-primary-foreground"
                : "bg-info-soft text-brand",
            )}
          >
            {t("mainBadge")}
          </span>
        ) : null}
      </Link>
    );
  }

  function GroupLabel({ children }: { children: string }) {
    return (
      <div className="px-3 pb-1 pt-4 font-heading text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
        {children}
      </div>
    );
  }

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r bg-muted/30 md:flex">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="font-heading text-lg font-semibold">
          Dsign
        </Link>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        <Item
          nav={{ key: "dashboard", href: "/dashboard", icon: LayoutDashboard }}
        />

        <GroupLabel>{t("groups.documents")}</GroupLabel>
        {docNav.map((d) => (
          <Item
            key={d.key}
            nav={{ key: d.key, href: `/${d.key}`, icon: DOC_ICONS[d.key] }}
            badge={d.primary}
          />
        ))}
        {whtVisible ? (
          <Item nav={{ key: "wht", href: "/wht", icon: Percent }} />
        ) : null}

        <GroupLabel>{t("groups.tools")}</GroupLabel>
        <Item
          nav={{
            key: "taxEstimator",
            href: "/tax-estimator",
            icon: Calculator,
          }}
        />

        <GroupLabel>{t("groups.data")}</GroupLabel>
        <Item nav={{ key: "customers", href: "/customers", icon: Users }} />
        <Item nav={{ key: "items", href: "/items", icon: Package }} />

        <GroupLabel>{t("groups.guidance")}</GroupLabel>
        <Item nav={{ key: "glossary", href: "/glossary", icon: BookOpen }} />

        <div className="pt-4">
          <Item nav={{ key: "settings", href: "/settings", icon: Settings }} />
        </div>
      </nav>
      {/* The persistent "a real firm stands behind this" cue — and a
          one-click path into Talk-to-us from anywhere. */}
      <button
        type="button"
        onClick={() => openTalk("sidebar")}
        className="m-3 rounded-lg border bg-card p-3 text-left transition-colors hover:border-primary/50"
      >
        <span className="flex items-center gap-1.5 font-heading text-sm font-semibold text-brand">
          <BadgeCheck className="h-4 w-4 shrink-0 text-success" />
          {tg("managedTitle")}
        </span>
        <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
          {tg("managedSub")}
        </span>
      </button>
    </aside>
  );
}

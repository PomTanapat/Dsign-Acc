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

import { cn } from "@/lib/utils";
import { Link, usePathname } from "@/i18n/routing";
import { useGuidance } from "@/components/guidance/guidance-provider";

type NavItem = {
  key:
    | "dashboard"
    | "quotations"
    | "invoices"
    | "receipts"
    | "wht"
    | "taxEstimator"
    | "customers"
    | "items"
    | "glossary"
    | "settings";
  href: string;
  icon: LucideIcon;
};

const ITEMS: NavItem[] = [
  { key: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { key: "quotations", href: "/quotations", icon: FileText },
  { key: "invoices", href: "/invoices", icon: ReceiptText },
  { key: "receipts", href: "/receipts", icon: Receipt },
  { key: "wht", href: "/wht", icon: Percent },
  { key: "taxEstimator", href: "/tax-estimator", icon: Calculator },
  { key: "customers", href: "/customers", icon: Users },
  { key: "items", href: "/items", icon: Package },
  { key: "glossary", href: "/glossary", icon: BookOpen },
  { key: "settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const t = useTranslations("App.sidebar");
  const tg = useTranslations("Guidance");
  const pathname = usePathname();
  const { openTalk } = useGuidance();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r bg-muted/30 md:flex">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="font-heading text-lg font-semibold">
          Dsign
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {ITEMS.map(({ key, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={key}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {t(key)}
            </Link>
          );
        })}
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

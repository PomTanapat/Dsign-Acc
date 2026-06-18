import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

// Routes that live under /[locale] and require an authenticated user.
// We check session cookie *presence* only — real session validation runs
// inside each (app) route via `auth()` from a server component. This keeps
// middleware Edge-runtime compatible (no postgres-js, no bcryptjs).
const PROTECTED_SEGMENTS = [
  "dashboard",
  "quotations",
  "invoices",
  "receipts",
  "wht",
  "tax-estimator",
  "customers",
  "items",
  "settings",
  "onboarding",
  "glossary",
];

// Auth.js v5 cookie names — checked in order; first hit wins.
const SESSION_COOKIES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
];

function stripLocale(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return { locale: routing.defaultLocale, rest: "" };
  const maybeLocale = parts[0];
  if ((routing.locales as readonly string[]).includes(maybeLocale)) {
    return { locale: maybeLocale, rest: parts.slice(1).join("/") };
  }
  return { locale: routing.defaultLocale, rest: parts.join("/") };
}

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Let Auth.js handle its own routes.
  if (pathname.startsWith("/api/auth")) return NextResponse.next();

  const { locale, rest } = stripLocale(pathname);
  const firstSegment = rest.split("/")[0] ?? "";
  const isProtected = PROTECTED_SEGMENTS.includes(firstSegment);

  if (isProtected) {
    const hasSessionCookie = SESSION_COOKIES.some((name) =>
      Boolean(req.cookies.get(name)?.value),
    );
    if (!hasSessionCookie) {
      const loginUrl = new URL(`/${locale}/login`, req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return intlMiddleware(req);
}

export const config = {
  // Skip Next internals and static assets. Run on everything else.
  matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};

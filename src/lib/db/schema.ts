import {
  pgTable,
  text,
  timestamp,
  primaryKey,
  unique,
  integer,
  uuid,
  numeric,
  boolean,
  date,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import type { AdapterAccount } from "next-auth/adapters";

// Auth.js v5 required tables (Postgres) — shape lifted from @auth/drizzle-adapter docs.

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  // Credentials provider — null for OAuth-only accounts.
  hashedPassword: text("hashedPassword"),
  // Preferred UI locale. Default Thai.
  locale: text("locale").notNull().default("th"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);

// -------------------- Phase 1: foundations --------------------

// companies — solo workspace model: exactly one company per user.
//
// Phase 7: the row is created at onboarding Finish (before legal details
// exist), so the legal columns nameTh/tin/addressTh are nullable. Two
// orthogonal predicates in src/lib/queries/company.ts decide what a user
// can do: isOnboarded() (interview done) gates the whole workspace;
// isLegalComplete() (legal fields present) gates document issuance.
export const companies = pgTable("companies", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("userId")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  nameTh: text("nameTh"),
  nameEn: text("nameEn"),
  // 13-digit Thai taxpayer id.
  tin: text("tin"),
  // Head office is "00000"; physical branches use their own code.
  branchCode: text("branchCode").notNull().default("00000"),
  addressTh: text("addressTh"),
  addressEn: text("addressEn"),
  phone: text("phone"),
  email: text("email"),
  logoUrl: text("logoUrl"),
  signatureUrl: text("signatureUrl"),
  defaultVatRate: numeric("defaultVatRate", { precision: 5, scale: 2 })
    .notNull()
    .default("7.00"),
  defaultCurrency: text("defaultCurrency").notNull().default("THB"),
  // ---------- Phase 7: business profile + guidance ----------
  industry: text("industry").$type<Industry>().notNull().default("other"),
  entityType: text("entityType")
    .$type<EntityType>()
    .notNull()
    .default("individual"),
  revenueBand: text("revenueBand").$type<RevenueBand>(),
  // Tri-state on purpose — "unsure" behaves like "no" everywhere (safe
  // default) but routes the user to help instead of a dead end.
  vatRegistered: text("vatRegistered").$type<TriState>().notNull().default("no"),
  paysOthers: text("paysOthers").$type<TriState>().notNull().default("no"),
  guidanceMode: text("guidanceMode")
    .$type<GuidanceMode>()
    .notNull()
    .default("guided"),
  foreignOwned: boolean("foreignOwned").notNull().default(false),
  ownershipStructure: text("ownershipStructure"),
  workPermitNeed: text("workPermitNeed"),
  // Raw onboarding answers (versioned) — Phase 8 lead context and Phase 10
  // assessment prefill read this; never used for app behavior directly.
  onboardingAnswers: jsonb("onboardingAnswers"),
  onboardingCompletedAt: timestamp("onboardingCompletedAt", { mode: "date" }),
  // { [nudgeId]: dismissedAtISO } — threshold nudges re-arm, see plan D9.
  dismissedNudges: jsonb("dismissedNudges"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
});

// customers — many per company. Either juristic (company w/ TIN) or natural.
export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("companyId")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  // Individuals often don't have a TIN — optional.
  tin: text("tin"),
  branchCode: text("branchCode").default("00000"),
  isJuristic: boolean("isJuristic").notNull().default(false),
  address: text("address"),
  email: text("email"),
  phone: text("phone"),
  notes: text("notes"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
});

// items — services or goods sold by the company.
export const items = pgTable("items", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("companyId")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  unit: text("unit").notNull().default("ชิ้น"),
  unitPrice: numeric("unitPrice", { precision: 14, scale: 2 }).notNull(),
  vatApplicable: boolean("vatApplicable").notNull().default(true),
  // null = no WHT applies; otherwise 1, 3, or 5 percent.
  whtRate: numeric("whtRate", { precision: 5, scale: 2 }),
  isActive: boolean("isActive").notNull().default(true),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
});

// -------------------- Phase 7: lead events --------------------

// Every "Not sure? Talk to us" request and warm-lead signal. Keyed by user
// (not company) because the most valuable requests happen mid-onboarding,
// before any companies row exists. Phase 8's back-office leads/triggers
// table evolves from this.
export const leadEvents = pgTable("lead_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  companyId: uuid("companyId").references(() => companies.id, {
    onDelete: "set null",
  }),
  // "talk_request" | "talk_open" | "incorporation_interest" | "vat_threshold_cta"
  kind: text("kind").$type<LeadEventKind>().notNull(),
  // Where it came from: a glossary term key or a screen identifier.
  surface: text("surface"),
  message: text("message"),
  // "phone" | "line" | "email" — plus the actual value to reach them with.
  contactChannel: text("contactChannel"),
  contactValue: text("contactValue"),
  // Set when the notification email to the firm was sent successfully —
  // null rows are leads nobody has been told about (the daily digest's job).
  emailedAt: timestamp("emailedAt", { mode: "date" }),
  status: text("status").$type<LeadEventStatus>().notNull().default("new"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

// -------------------- Phase 2: documents --------------------

// Per-(company, docType, year) atomic counter for running numbers.
// Bumped via an UPSERT-with-RETURNING — no FOR UPDATE needed because
// Postgres serializes ON CONFLICT writes on the conflicting tuple.
export const documentCounters = pgTable(
  "document_counters",
  {
    companyId: uuid("companyId")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    docType: text("docType").notNull(),
    year: integer("year").notNull(),
    nextValue: integer("nextValue").notNull().default(1),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.companyId, t.docType, t.year] }),
  }),
);

// documents — polymorphic table for quotation / invoice / receipt.
// customerSnapshot + companySnapshot + jsonPayload freeze the payload at
// issuance so the PDF remains reproducible even if upstream records change.
export const documents = pgTable(
  "documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("companyId")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    runningNumber: text("runningNumber").notNull(),
    year: integer("year").notNull(),
    // Soft-link to customer — no cascade. If a customer is deleted later
    // the document keeps its snapshot but loses the live link.
    customerId: uuid("customerId").references(() => customers.id),
    issueDate: date("issueDate", { mode: "string" }).notNull(),
    dueDate: date("dueDate", { mode: "string" }),
    status: text("status").notNull().default("draft"),
    customerSnapshot: jsonb("customerSnapshot").notNull(),
    companySnapshot: jsonb("companySnapshot").notNull(),
    notes: text("notes"),
    subtotal: numeric("subtotal", { precision: 14, scale: 2 }).notNull(),
    vatAmount: numeric("vatAmount", { precision: 14, scale: 2 })
      .notNull()
      .default("0.00"),
    whtAmount: numeric("whtAmount", { precision: 14, scale: 2 })
      .notNull()
      .default("0.00"),
    total: numeric("total", { precision: 14, scale: 2 }).notNull(),
    netPayable: numeric("netPayable", { precision: 14, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("THB"),
    jsonPayload: jsonb("jsonPayload").notNull(),
    issuedAt: timestamp("issuedAt", { mode: "date" }),
    // Phase 5: email send tracking. `sentAt` is the most-recent successful
    // send; `lastSentTo` keeps the recipient string so the UI can show
    // "Sent to alice@x.com on 2026-01-02" without a separate audit table.
    sentAt: timestamp("sentAt", { mode: "date" }),
    lastSentTo: text("lastSentTo"),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => ({
    // Same running number can never be reused within (company, type, year).
    uniqRunning: unique("documents_uniq_running").on(
      t.companyId,
      t.type,
      t.runningNumber,
    ),
  }),
);

export const documentLines = pgTable("document_lines", {
  id: uuid("id").primaryKey().defaultRandom(),
  documentId: uuid("documentId")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  sortOrder: integer("sortOrder").notNull(),
  // Null for free-text lines. Soft-link — items can be deleted later.
  itemId: uuid("itemId").references(() => items.id),
  description: text("description").notNull(),
  quantity: numeric("quantity", { precision: 14, scale: 3 }).notNull(),
  unitPrice: numeric("unitPrice", { precision: 14, scale: 2 }).notNull(),
  discountPercent: numeric("discountPercent", { precision: 5, scale: 2 })
    .notNull()
    .default("0.00"),
  vatRate: numeric("vatRate", { precision: 5, scale: 2 })
    .notNull()
    .default("0.00"),
  lineTotal: numeric("lineTotal", { precision: 14, scale: 2 }).notNull(),
});

// -------------------- Phase 3: WHT certificates --------------------

// One table for ภ.ง.ด. 3 / ภ.ง.ด. 53 certificates. Uses the same
// `document_counters` machinery as Phase 2 by passing docType="wht".
//
// Snapshots (customer + company) freeze identifying info at issue time so
// the cert stays reproducible if the underlying records change later.
//
// `incomeTypes` is a small jsonb array (1–8 rows per form) — we deliberately
// don't normalize it into a child table because each row is metadata-only
// and never queried independently.
export const whtCertificates = pgTable(
  "wht_certificates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("companyId")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    // Soft link — if the customer is deleted later the cert keeps its
    // snapshot but loses the live FK.
    customerId: uuid("customerId").references(() => customers.id),
    // Optional link to the invoice that triggered the WHT. Enables the
    // "issue WHT cert from invoice" workflow without coupling lifecycles.
    invoiceId: uuid("invoiceId").references(() => documents.id),
    runningNumber: text("runningNumber").notNull(),
    year: integer("year").notNull(),
    // "pnd3" | "pnd53"
    formType: text("formType").notNull(),
    customerSnapshot: jsonb("customerSnapshot").notNull(),
    companySnapshot: jsonb("companySnapshot").notNull(),
    // WhtIncomeLine[] — see src/lib/documents/wht-types.ts
    incomeTypes: jsonb("incomeTypes").notNull(),
    paymentDate: date("paymentDate", { mode: "string" }).notNull(),
    // "withheld" | "paid_for_payee" | "other"
    paymentMethod: text("paymentMethod").notNull().default("withheld"),
    totalGross: numeric("totalGross", { precision: 14, scale: 2 }).notNull(),
    totalWithheld: numeric("totalWithheld", {
      precision: 14,
      scale: 2,
    }).notNull(),
    notes: text("notes"),
    status: text("status").notNull().default("issued"),
    issuedAt: timestamp("issuedAt", { mode: "date" }),
    // Phase 5: mirrors `documents.sentAt` / `lastSentTo` — see comment there.
    sentAt: timestamp("sentAt", { mode: "date" }),
    lastSentTo: text("lastSentTo"),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => ({
    // Running number is unique per company across all years — the prefix
    // already encodes the year, and Phase 2 enforces same constraint for
    // documents via (companyId, type, runningNumber).
    uniqRunning: unique("wht_certificates_uniq_running").on(
      t.companyId,
      t.runningNumber,
    ),
  }),
);

// -------------------- Relations --------------------

export const usersRelations = relations(users, ({ one }) => ({
  company: one(companies, {
    fields: [users.id],
    references: [companies.userId],
  }),
}));

export const companiesRelations = relations(companies, ({ one, many }) => ({
  user: one(users, {
    fields: [companies.userId],
    references: [users.id],
  }),
  customers: many(customers),
  items: many(items),
  documents: many(documents),
  whtCertificates: many(whtCertificates),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
  company: one(companies, {
    fields: [customers.companyId],
    references: [companies.id],
  }),
  documents: many(documents),
  whtCertificates: many(whtCertificates),
}));

export const itemsRelations = relations(items, ({ one }) => ({
  company: one(companies, {
    fields: [items.companyId],
    references: [companies.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  company: one(companies, {
    fields: [documents.companyId],
    references: [companies.id],
  }),
  customer: one(customers, {
    fields: [documents.customerId],
    references: [customers.id],
  }),
  lines: many(documentLines),
  whtCertificates: many(whtCertificates),
}));

export const whtCertificatesRelations = relations(
  whtCertificates,
  ({ one }) => ({
    company: one(companies, {
      fields: [whtCertificates.companyId],
      references: [companies.id],
    }),
    customer: one(customers, {
      fields: [whtCertificates.customerId],
      references: [customers.id],
    }),
    invoice: one(documents, {
      fields: [whtCertificates.invoiceId],
      references: [documents.id],
    }),
  }),
);

export const documentLinesRelations = relations(documentLines, ({ one }) => ({
  document: one(documents, {
    fields: [documentLines.documentId],
    references: [documents.id],
  }),
  item: one(items, {
    fields: [documentLines.itemId],
    references: [items.id],
  }),
}));

// -------------------- Inferred types --------------------

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;

// -------------------- Phase 7 profile + lead types --------------------

export type Industry =
  | "freelance"
  | "online"
  | "food"
  | "retail"
  | "prof"
  | "contractor"
  | "salon"
  | "other";

export type EntityType = "individual" | "juristic" | "thinking";

export type RevenueBand = "under" | "near" | "over" | "unsure";

export type TriState = "yes" | "no" | "unsure";

export type GuidanceMode = "guided" | "fast";

export type LeadEventKind =
  | "talk_request"
  | "talk_open"
  | "incorporation_interest"
  | "vat_threshold_cta";

export type LeadEventStatus = "new" | "handled";

export type LeadEvent = typeof leadEvents.$inferSelect;
export type NewLeadEvent = typeof leadEvents.$inferInsert;

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;

export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;

// Note: `DocType` (canonical) lives in `src/lib/documents/types.ts` and is
// the single source of truth used by numbering + counter machinery. This
// alias is kept narrow (no "wht") because it represents *document rows*
// in the `documents` table — WHT certs live in their own table.
export type DocType = "quotation" | "invoice" | "receipt";

export type DocumentRow = typeof documents.$inferSelect;
export type NewDocumentRow = typeof documents.$inferInsert;

export type DocumentLineRow = typeof documentLines.$inferSelect;
export type NewDocumentLineRow = typeof documentLines.$inferInsert;

export type DocumentCounterRow = typeof documentCounters.$inferSelect;

// -------------------- Phase 3 inferred types --------------------

export type WhtCertificateRow = typeof whtCertificates.$inferSelect;
export type NewWhtCertificateRow = typeof whtCertificates.$inferInsert;

export type WhtFormType = "pnd3" | "pnd53";

export type WhtIncomeTypeCode =
  | "40_1"
  | "40_2"
  | "40_3"
  | "40_4_a"
  | "40_4_b"
  | "40_5"
  | "40_6"
  | "40_7"
  | "40_8";

export type WhtIncomeLine = {
  code: WhtIncomeTypeCode;
  description: string;
  paymentDate: string;
  grossAmount: number;
  rate: number;
  withheldAmount: number;
};

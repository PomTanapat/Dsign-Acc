CREATE TABLE IF NOT EXISTS "account" (
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text NOT NULL,
	"nameTh" text NOT NULL,
	"nameEn" text,
	"tin" text NOT NULL,
	"branchCode" text DEFAULT '00000' NOT NULL,
	"addressTh" text NOT NULL,
	"addressEn" text,
	"phone" text,
	"email" text,
	"logoUrl" text,
	"signatureUrl" text,
	"defaultVatRate" numeric(5, 2) DEFAULT '7.00' NOT NULL,
	"defaultCurrency" text DEFAULT 'THB' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "companies_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"companyId" uuid NOT NULL,
	"name" text NOT NULL,
	"tin" text,
	"branchCode" text DEFAULT '00000',
	"isJuristic" boolean DEFAULT false NOT NULL,
	"address" text,
	"email" text,
	"phone" text,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "document_counters" (
	"companyId" uuid NOT NULL,
	"docType" text NOT NULL,
	"year" integer NOT NULL,
	"nextValue" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "document_counters_companyId_docType_year_pk" PRIMARY KEY("companyId","docType","year")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "document_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"documentId" uuid NOT NULL,
	"sortOrder" integer NOT NULL,
	"itemId" uuid,
	"description" text NOT NULL,
	"quantity" numeric(14, 3) NOT NULL,
	"unitPrice" numeric(14, 2) NOT NULL,
	"discountPercent" numeric(5, 2) DEFAULT '0.00' NOT NULL,
	"vatRate" numeric(5, 2) DEFAULT '0.00' NOT NULL,
	"lineTotal" numeric(14, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"companyId" uuid NOT NULL,
	"type" text NOT NULL,
	"runningNumber" text NOT NULL,
	"year" integer NOT NULL,
	"customerId" uuid,
	"issueDate" date NOT NULL,
	"dueDate" date,
	"status" text DEFAULT 'draft' NOT NULL,
	"customerSnapshot" jsonb NOT NULL,
	"companySnapshot" jsonb NOT NULL,
	"notes" text,
	"subtotal" numeric(14, 2) NOT NULL,
	"vatAmount" numeric(14, 2) DEFAULT '0.00' NOT NULL,
	"whtAmount" numeric(14, 2) DEFAULT '0.00' NOT NULL,
	"total" numeric(14, 2) NOT NULL,
	"netPayable" numeric(14, 2) NOT NULL,
	"currency" text DEFAULT 'THB' NOT NULL,
	"jsonPayload" jsonb NOT NULL,
	"issuedAt" timestamp,
	"sentAt" timestamp,
	"lastSentTo" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "documents_uniq_running" UNIQUE("companyId","type","runningNumber")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"companyId" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"unit" text DEFAULT 'ชิ้น' NOT NULL,
	"unitPrice" numeric(14, 2) NOT NULL,
	"vatApplicable" boolean DEFAULT true NOT NULL,
	"whtRate" numeric(5, 2),
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"emailVerified" timestamp,
	"image" text,
	"hashedPassword" text,
	"locale" text DEFAULT 'th' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "wht_certificates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"companyId" uuid NOT NULL,
	"customerId" uuid,
	"invoiceId" uuid,
	"runningNumber" text NOT NULL,
	"year" integer NOT NULL,
	"formType" text NOT NULL,
	"customerSnapshot" jsonb NOT NULL,
	"companySnapshot" jsonb NOT NULL,
	"incomeTypes" jsonb NOT NULL,
	"paymentDate" date NOT NULL,
	"paymentMethod" text DEFAULT 'withheld' NOT NULL,
	"totalGross" numeric(14, 2) NOT NULL,
	"totalWithheld" numeric(14, 2) NOT NULL,
	"notes" text,
	"status" text DEFAULT 'issued' NOT NULL,
	"issuedAt" timestamp,
	"sentAt" timestamp,
	"lastSentTo" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "wht_certificates_uniq_running" UNIQUE("companyId","runningNumber")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "companies" ADD CONSTRAINT "companies_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "customers" ADD CONSTRAINT "customers_companyId_companies_id_fk" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "document_counters" ADD CONSTRAINT "document_counters_companyId_companies_id_fk" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "document_lines" ADD CONSTRAINT "document_lines_documentId_documents_id_fk" FOREIGN KEY ("documentId") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "document_lines" ADD CONSTRAINT "document_lines_itemId_items_id_fk" FOREIGN KEY ("itemId") REFERENCES "public"."items"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "documents" ADD CONSTRAINT "documents_companyId_companies_id_fk" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "documents" ADD CONSTRAINT "documents_customerId_customers_id_fk" FOREIGN KEY ("customerId") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "items" ADD CONSTRAINT "items_companyId_companies_id_fk" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "wht_certificates" ADD CONSTRAINT "wht_certificates_companyId_companies_id_fk" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "wht_certificates" ADD CONSTRAINT "wht_certificates_customerId_customers_id_fk" FOREIGN KEY ("customerId") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "wht_certificates" ADD CONSTRAINT "wht_certificates_invoiceId_documents_id_fk" FOREIGN KEY ("invoiceId") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

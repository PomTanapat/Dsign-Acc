CREATE TABLE IF NOT EXISTS "lead_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text NOT NULL,
	"companyId" uuid,
	"kind" text NOT NULL,
	"surface" text,
	"message" text,
	"contactChannel" text,
	"contactValue" text,
	"emailedAt" timestamp,
	"status" text DEFAULT 'new' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "companies" ALTER COLUMN "nameTh" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "companies" ALTER COLUMN "tin" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "companies" ALTER COLUMN "addressTh" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "industry" text DEFAULT 'other' NOT NULL;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "entityType" text DEFAULT 'individual' NOT NULL;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "revenueBand" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "vatRegistered" text DEFAULT 'no' NOT NULL;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "paysOthers" text DEFAULT 'no' NOT NULL;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "guidanceMode" text DEFAULT 'guided' NOT NULL;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "foreignOwned" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "ownershipStructure" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "workPermitNeed" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "onboardingAnswers" jsonb;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "onboardingCompletedAt" timestamp;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "dismissedNudges" jsonb;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lead_events" ADD CONSTRAINT "lead_events_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lead_events" ADD CONSTRAINT "lead_events_companyId_companies_id_fk" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

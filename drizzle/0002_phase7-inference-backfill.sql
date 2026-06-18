-- Phase 7 inference backfill (plan D2) — runs in the SAME deploy that flips
-- the workspace gate to "onboarding completed".
--
-- Pre-Phase-7 companies (and any row created through the legacy /settings
-- flow before the gate flip) have onboardingCompletedAt IS NULL. They must
-- NEVER get bare column defaults: a VAT-issuing user marked vatRegistered
-- ='no' would be blocked from their own core workflow by the new server-
-- side safety gate. Infer from real data instead:
--
--   vatRegistered  'yes'  where non-void documents carry VAT
--                  'unsure' otherwise (never 'no' — unsure routes to help)
--   paysOthers     'yes'  where WHT certificates exist
--   guidanceMode   'fast' — these users already operate the raw tool;
--                  defaulting them to guided would add confirm dialogs to
--                  every issuance on deploy day (Persona B regression)
--   onboardingCompletedAt = createdAt, stamped LAST so the statements
--                  above can key on IS NULL
--
-- Idempotent: wizard-created rows always carry onboardingCompletedAt, so
-- after the first run no row matches the predicate and re-runs are no-ops.

UPDATE "companies" c
SET "vatRegistered" = CASE
  WHEN EXISTS (
    SELECT 1 FROM "documents" d
    WHERE d."companyId" = c."id"
      AND d."status" <> 'void'
      AND d."vatAmount" > 0
  ) THEN 'yes'
  ELSE 'unsure'
END
WHERE c."onboardingCompletedAt" IS NULL;
--> statement-breakpoint
UPDATE "companies" c
SET "paysOthers" = 'yes'
WHERE c."onboardingCompletedAt" IS NULL
  AND EXISTS (
    SELECT 1 FROM "wht_certificates" w WHERE w."companyId" = c."id"
  );
--> statement-breakpoint
UPDATE "companies" c
SET "guidanceMode" = 'fast'
WHERE c."onboardingCompletedAt" IS NULL;
--> statement-breakpoint
UPDATE "companies" c
SET "onboardingCompletedAt" = c."createdAt"
WHERE c."onboardingCompletedAt" IS NULL;

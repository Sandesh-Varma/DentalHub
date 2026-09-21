-- Public doctor profile fields (shown on patient booking)
ALTER TABLE "doctors" ADD COLUMN IF NOT EXISTS "bio" TEXT;
ALTER TABLE "doctors" ADD COLUMN IF NOT EXISTS "clinic_name" TEXT;
ALTER TABLE "doctors" ADD COLUMN IF NOT EXISTS "address" TEXT;

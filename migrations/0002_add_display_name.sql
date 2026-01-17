-- Add display_name field to users table for The Veil identity system
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "display_name" varchar;

-- Set The Veil's display name for the owner account
UPDATE "users" SET "display_name" = 'The Veil' WHERE "email" = 'curated.collectiveai@proton.me' OR "role" = 'owner';

-- Guardian Logs Table
CREATE TABLE IF NOT EXISTS "guardian_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"action_type" varchar NOT NULL, -- 'grok_response', 'proactive_checkin', 'threat_detected'
	"content" text,
	"mood" varchar, -- 'sweet' or 'mean'
	"threat_level" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);

-- Guardian Stats Table
CREATE TABLE IF NOT EXISTS "guardian_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"sweet_count" integer DEFAULT 0,
	"mean_count" integer DEFAULT 0,
	"threats_blocked" integer DEFAULT 0,
	"last_checkin" timestamp,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "guardian_stats_user_id_unique" UNIQUE("user_id")
);

-- Waitlist Table
CREATE TABLE IF NOT EXISTS "waitlist" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"referral_code" text,
	"source" text DEFAULT 'landing',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "waitlist_email_unique" UNIQUE("email")
);

-- Add referral fields to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "referral_code" varchar;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "referred_by" varchar;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" varchar DEFAULT 'user'; -- 'user', 'owner'

-- Add theme field to creator_profiles
ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "theme_preference" varchar DEFAULT 'midnight';

-- Add userId to conversations for multi-chat support
ALTER TABLE "conversations" ADD COLUMN IF NOT EXISTS "user_id" varchar;
ALTER TABLE "conversations" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;

-- Create index for guardian logs
CREATE INDEX IF NOT EXISTS "idx_guardian_logs_user" ON "guardian_logs" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_waitlist_email" ON "waitlist" ("email");

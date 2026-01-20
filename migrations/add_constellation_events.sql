-- Create constellation events tables

-- Main events table
CREATE TABLE IF NOT EXISTS "constellation_events" (
  "id" SERIAL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "event_type" TEXT NOT NULL,
  "scheduled_for" TIMESTAMP,
  "started_at" TIMESTAMP,
  "ended_at" TIMESTAMP,
  "duration" INTEGER,
  "status" TEXT DEFAULT 'scheduled' NOT NULL,
  "visibility" TEXT DEFAULT 'public' NOT NULL,
  "theme" TEXT DEFAULT 'cosmic',
  "max_participants" INTEGER,
  "requires_approval" BOOLEAN DEFAULT false,
  "poetic_message" TEXT,
  "completion_message" TEXT,
  "creator_id" TEXT NOT NULL,
  "moderator_ids" TEXT[] DEFAULT '{}',
  "metadata" JSONB DEFAULT '{}',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

-- Event participants table
CREATE TABLE IF NOT EXISTS "event_participants" (
  "id" SERIAL PRIMARY KEY,
  "event_id" INTEGER NOT NULL REFERENCES "constellation_events"("id") ON DELETE CASCADE,
  "user_id" TEXT NOT NULL,
  "role" TEXT DEFAULT 'participant' NOT NULL,
  "joined_at" TIMESTAMP DEFAULT NOW(),
  "left_at" TIMESTAMP,
  "contribution_count" INTEGER DEFAULT 0,
  "last_activity_at" TIMESTAMP,
  "status" TEXT DEFAULT 'active' NOT NULL
);

-- Event logs table
CREATE TABLE IF NOT EXISTS "event_logs" (
  "id" SERIAL PRIMARY KEY,
  "event_id" INTEGER NOT NULL REFERENCES "constellation_events"("id") ON DELETE CASCADE,
  "log_type" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "user_id" TEXT,
  "metadata" JSONB DEFAULT '{}',
  "created_at" TIMESTAMP DEFAULT NOW()
);

-- Event notifications table
CREATE TABLE IF NOT EXISTS "event_notifications" (
  "id" SERIAL PRIMARY KEY,
  "event_id" INTEGER NOT NULL REFERENCES "constellation_events"("id") ON DELETE CASCADE,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "recipient_id" TEXT,
  "is_read" BOOLEAN DEFAULT false,
  "theme" TEXT DEFAULT 'cosmic',
  "animation_type" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "expires_at" TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "idx_constellation_events_status" ON "constellation_events"("status");
CREATE INDEX IF NOT EXISTS "idx_constellation_events_scheduled_for" ON "constellation_events"("scheduled_for");
CREATE INDEX IF NOT EXISTS "idx_constellation_events_creator_id" ON "constellation_events"("creator_id");
CREATE INDEX IF NOT EXISTS "idx_event_participants_event_id" ON "event_participants"("event_id");
CREATE INDEX IF NOT EXISTS "idx_event_participants_user_id" ON "event_participants"("user_id");
CREATE INDEX IF NOT EXISTS "idx_event_logs_event_id" ON "event_logs"("event_id");
CREATE INDEX IF NOT EXISTS "idx_event_notifications_event_id" ON "event_notifications"("event_id");
CREATE INDEX IF NOT EXISTS "idx_event_notifications_recipient_id" ON "event_notifications"("recipient_id");

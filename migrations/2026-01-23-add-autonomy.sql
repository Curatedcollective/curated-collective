-- Migration: add autonomy metadata for Veil admin features
ALTER TABLE agents
  ADD COLUMN autonomy_level integer DEFAULT 0,
  ADD COLUMN autonomy_scope jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN autonomy_granted_by integer NULL,
  ADD COLUMN autonomy_granted_at timestamptz NULL;

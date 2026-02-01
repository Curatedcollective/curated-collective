-- Create daddy_conversations table if it does not exist
CREATE TABLE IF NOT EXISTS daddy_conversations (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  speaker TEXT NOT NULL,
  content TEXT NOT NULL,
  thread_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

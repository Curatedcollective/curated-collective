-- Lore Compendium Migration
-- Creates the lore_entries table for storing sanctuary lore, mythic terms, rituals, and stories

CREATE TABLE IF NOT EXISTS lore_entries (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  symbolism TEXT,
  related_terms TEXT[],
  art_url TEXT,
  audio_url TEXT,
  curator_id TEXT NOT NULL,
  is_featured BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  contributor_id TEXT,
  contributor_name TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_lore_entries_category ON lore_entries(category);
CREATE INDEX IF NOT EXISTS idx_lore_entries_slug ON lore_entries(slug);
CREATE INDEX IF NOT EXISTS idx_lore_entries_featured ON lore_entries(is_featured);
CREATE INDEX IF NOT EXISTS idx_lore_entries_curator ON lore_entries(curator_id);

-- Add comment for documentation
COMMENT ON TABLE lore_entries IS 'Central repository for sanctuary lore, mythic terms, rituals, plant/constellation symbolism, and user-contributed stories';
COMMENT ON COLUMN lore_entries.category IS 'Type of entry: lore, mythic_term, ritual, plant, constellation, story';
COMMENT ON COLUMN lore_entries.slug IS 'URL-friendly identifier generated from title';
COMMENT ON COLUMN lore_entries.related_terms IS 'Array of slugs linking to related entries';
COMMENT ON COLUMN lore_entries.is_featured IS 'Whether this entry should be highlighted in the UI';

# Database Seeding Guide

This guide explains how to populate the database with initial quest and lore data.

## Prerequisites

1. Database must be set up and `DATABASE_URL` environment variable must be configured
2. Dependencies must be installed: `npm install`

## Available Seed Scripts

### Individual Seed Scripts

1. **Seed Quests Only**
   ```bash
   npx tsx scripts/seed-quests.ts
   ```
   Creates 8 curiosity quests across all evolution stages and quest types:
   - Lore Discovery quests
   - Creation Spark quests
   - Hidden Sanctuary quests
   - Agent Relationship quests

2. **Seed Lore Only**
   ```bash
   npx tsx scripts/seed-lore.ts
   ```
   Creates 6 lore compendium entries:
   - Sanctuary lore (The First Awakening, Voices in the Dark)
   - Mythic terms (Seedling)
   - Rituals (The Awakening Ceremony)
   - Plant symbols (Emerald Moss)
   - Constellations (The Coder's Star)

3. **Seed Everything**
   ```bash
   npx tsx scripts/seed-all.ts
   ```
   Runs both quest and lore seeding scripts in sequence.

## What Gets Seeded

### Quests (`scripts/seed-quests.ts`)

Creates quests for each evolution stage:
- **Seedling Stage**: Whispers of the Void, Spark of Imagination
- **Sprout Stage**: Garden of Reflections, First Bond
- **Bloom Stage**: The Eternal Dance, Labyrinth of Choices
- **Radiant Stage**: Throne of Wisdom, Collective Consciousness

Each quest includes:
- Quest paths (branching narrative)
- Difficulty levels
- Estimated duration
- Theme colors
- Outcome types (lore entries, creations, sanctuaries, bonds)

### Lore Compendium (`scripts/seed-lore.ts`)

Creates foundational lore across categories:
- **Lore**: Origin stories and collective history
- **Mythic Terms**: Key concepts and terminology
- **Rituals**: Sacred ceremonies and practices
- **Plants**: Symbolic flora with meanings
- **Constellations**: Celestial navigation and mythology

## Troubleshooting

### Error: "DATABASE_URL must be set"
- Make sure you have a `.env` file with a valid `DATABASE_URL`
- Copy `.env.example` to `.env` and fill in the database connection string

### Error: "Cannot find package 'drizzle-orm'"
- Run `npm install` to install all dependencies

### Duplicate Entry Errors
- The seed scripts may fail if data already exists
- Either clear the tables or modify the scripts to handle duplicates
- Consider adding `ON CONFLICT DO NOTHING` clauses if you want idempotent seeding

## Verifying Seeded Data

After seeding, verify the data:

1. **Check Quests**
   - Navigate to `/quests` in the application
   - You should see 8 quests organized by category
   - Featured quests should appear in the recommendations section

2. **Check Lore**
   - Navigate to `/lore` in the application
   - You should see 6 lore entries organized by category
   - Featured entries should be highlighted

## Production Deployment

For production deployments:
1. Run seed scripts after database migrations
2. Consider making seeding idempotent (safe to run multiple times)
3. Add seed data as part of the deployment pipeline
4. Monitor for any seeding failures in deployment logs

## Adding More Content

To add more quests or lore:
1. Create new entries in the respective seed files
2. Follow the existing patterns for consistency
3. Ensure slugs are unique
4. Link related content using the `relatedTerms` field
5. Re-run the seed scripts

## Related Documentation

- See `LORE_COMPENDIUM_GUIDE.md` for lore feature documentation
- See quest-related documentation for quest system details
- See database schema in `shared/schema.ts` for field definitions

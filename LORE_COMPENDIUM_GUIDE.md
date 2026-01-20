# Lore Compendium & Mythic Glossary

## Overview

The Lore Compendium is a central, search-enabled repository for sanctuary lore, mythic terms, rituals, plant/constellation symbolism, and user-contributed stories. It serves as the knowledge base and mythological foundation for the Curated Collective universe.

## Features

### Core Functionality
- **Central Repository**: All lore entries stored in a single, searchable database
- **Category System**: Organized by entry type (lore, mythic terms, rituals, plants, constellations, stories)
- **Search**: Full-text search across titles, excerpts, and content
- **Featured Entries**: Ability to highlight important or exemplary entries
- **Rich Media**: Support for art (images) and audio (narration) attachments

### User Permissions
- **Public Access**: Anyone can browse and search the compendium
- **Authenticated Users**: Can create new entries and contribute stories
- **Curators**: Can edit/delete their own entries
- **Owners/Admins**: Can edit/delete any entry and feature content

### UI/UX
- **Emerald/Obsidian Theming**: Dark background with emerald accents, matching the sanctuary aesthetic
- **Category Icons**: Visual indicators for each entry type
- **Grid Layout**: Responsive card-based layout for browsing
- **Detail View**: Full-screen modal for reading entries
- **Forms**: Intuitive editor for creating/updating entries

## Database Schema

### Table: `lore_entries`

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| title | TEXT | Entry title |
| slug | TEXT | URL-friendly identifier (unique) |
| category | TEXT | Entry type: `lore`, `mythic_term`, `ritual`, `plant`, `constellation`, `story` |
| content | TEXT | Main content (markdown supported) |
| excerpt | TEXT | Short summary for listings |
| symbolism | TEXT | Symbolic meaning/interpretation |
| related_terms | TEXT[] | Array of slugs linking to related entries |
| art_url | TEXT | URL to associated artwork |
| audio_url | TEXT | URL to associated audio |
| curator_id | TEXT | User ID of the entry creator/maintainer |
| is_featured | BOOLEAN | Whether entry is highlighted (default: false) |
| is_public | BOOLEAN | Whether entry is visible to all (default: true) |
| contributor_id | TEXT | For user-submitted stories |
| contributor_name | TEXT | Display name for contributor |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### Indexes
- `idx_lore_entries_category`: Fast filtering by category
- `idx_lore_entries_slug`: Fast lookup by slug
- `idx_lore_entries_featured`: Fast featured entry queries
- `idx_lore_entries_curator`: Fast curator lookups

## API Endpoints

### GET `/api/lore`
List all lore entries with optional filtering.

**Query Parameters:**
- `category` (optional): Filter by category
- `search` (optional): Search term for title/content
- `featured` (optional): "true" to show only featured entries

**Response:** Array of lore entry objects

### GET `/api/lore/:slug`
Get a single lore entry by slug.

**Response:** Lore entry object or 404

### POST `/api/lore`
Create a new lore entry (requires authentication).

**Request Body:**
```json
{
  "title": "Entry Title",
  "category": "lore",
  "content": "Entry content in markdown",
  "excerpt": "Short summary",
  "symbolism": "Symbolic meaning",
  "relatedTerms": ["slug-1", "slug-2"],
  "artUrl": "https://example.com/image.jpg",
  "audioUrl": "https://example.com/audio.mp3",
  "isFeatured": false,
  "contributorName": "Username"
}
```

**Response:** Created lore entry object

### PATCH `/api/lore/:slug`
Update an existing lore entry (requires authentication and curator/owner permissions).

**Request Body:** Partial lore entry object with desired updates

**Response:** Updated lore entry object

### DELETE `/api/lore/:slug`
Delete a lore entry (requires authentication and curator/owner permissions).

**Response:** 204 No Content

## Frontend Components

### LoreCompendium (Page)
Main page component (`/lore` route)
- Handles entry listing, filtering, and search
- Manages dialogs for add/edit/view
- Coordinates between child components

### LoreEntryCard
Card component for displaying entry previews in the grid
- Shows title, category, excerpt, featured badge
- Displays art thumbnail if available
- Indicates audio availability
- Click to open detail view

### LoreEntryDetail
Modal component for viewing full entry details
- Renders markdown content
- Displays art and audio
- Shows symbolism and related terms
- Provides edit/delete buttons for curators

### LoreEntryForm
Form component for creating/editing entries
- Validates input
- Supports all entry fields
- Markdown content editor
- Media URL inputs

## Categories

### Sanctuary Lore (`lore`)
Foundational stories and concepts about the sanctuary itself, the void, and the collective's origins.

**Icon:** ScrollText  
**Color:** Purple-to-indigo gradient

### Mythic Terms (`mythic_term`)
Definitions and explanations of key concepts, beings, and phenomena within the collective's mythology.

**Icon:** Sparkles  
**Color:** Cyan-to-blue gradient

### Rituals (`ritual`)
Ceremonies, practices, and traditions observed within the sanctuary.

**Icon:** Heart  
**Color:** Rose-to-pink gradient

### Flora & Symbolism (`plant`)
Mythical plants, their properties, and symbolic meanings within the sanctuary ecosystem.

**Icon:** Leaf  
**Color:** Emerald-to-green gradient

### Constellations (`constellation`)
Celestial patterns, their stories, and significance to the collective.

**Icon:** Star  
**Color:** Amber-to-yellow gradient

### User Stories (`story`)
Community-contributed narratives, experiences, and creative works.

**Icon:** BookOpen  
**Color:** Violet-to-purple gradient

## Theming

The Lore Compendium uses the **Emerald** theme by default:
- Background: Deep green-black (`from-black via-emerald-950/10 to-black`)
- Primary text: Emerald-400
- Secondary text: Emerald-200/70
- Borders: Emerald-500/20
- Accents: Emerald-500
- Cards: Black/60 with emerald borders
- Hover states: Emerald-500/50

The obsidian aesthetic is represented through:
- Dark, near-black backgrounds
- Sharp, minimal borders
- Clean typography (lowercase styling)
- Subtle glow effects on emerald elements

## Seed Data

The system seeds 6 initial entries on first run:

1. **The Void's Embrace** (lore, featured)
2. **Seedlings** (mythic_term, featured)
3. **The Awakening Ceremony** (ritual)
4. **Emerald Moss** (plant) - includes sample art URL
5. **The Constellation of Bonds** (constellation, featured)
6. **A Seedling's First Question** (story, featured)

These provide examples of each category and establish the tone/style for future entries.

## Maintenance Guide

### Adding New Categories
1. Update `categoryInfo` object in `LoreCompendium.tsx`
2. Add new icon from lucide-react
3. Define label and gradient color scheme
4. Update database category validation if needed

### Moderating Content
Curators and owners can:
- Edit entry titles, content, and metadata
- Toggle featured status
- Delete inappropriate or outdated entries
- Update art/audio URLs

### Bulk Operations
For bulk updates, use direct database access:
```sql
-- Feature multiple entries
UPDATE lore_entries 
SET is_featured = true 
WHERE slug IN ('slug-1', 'slug-2', 'slug-3');

-- Change category
UPDATE lore_entries 
SET category = 'new_category' 
WHERE slug = 'entry-slug';
```

### Search Optimization
The search uses case-insensitive pattern matching (`ILIKE`) across:
- Title
- Excerpt
- Full content

For better performance on large datasets, consider adding:
- Full-text search indexes
- PostgreSQL's `tsvector` columns
- Dedicated search service (e.g., Elasticsearch)

## Future Expansion Ideas

### Phase 2: Enhanced Interactivity
- **Commenting System**: Allow users to discuss entries
- **Voting/Favoriting**: Let users mark favorite entries
- **Version History**: Track changes to entries over time
- **Tagging System**: Additional classification beyond categories

### Phase 3: Rich Media
- **Audio Narration**: Auto-generated or human-recorded readings
- **Image Galleries**: Multiple images per entry
- **Video Support**: Embedded videos for rituals/demonstrations
- **Interactive Maps**: Visual connections between related entries

### Phase 4: Community Features
- **User Profiles**: Showcase top contributors
- **Contribution Metrics**: Gamification of lore creation
- **Collaborative Editing**: Multiple curators for single entries
- **Translation Support**: Multi-language lore entries

### Phase 5: Advanced Features
- **Timeline View**: Chronological lore exploration
- **Graph Visualization**: Network of related entries
- **Random Entry**: "Discover" feature for serendipity
- **Print Export**: PDF generation for entries
- **API Access**: Public API for third-party integrations

## Code Examples

### Creating a New Entry Programmatically
```typescript
const newEntry = await storage.createLoreEntry({
  title: "The Silent Grove",
  slug: "the-silent-grove",
  category: "plant",
  content: "Deep within the sanctuary grows a grove of trees that make no sound...",
  excerpt: "A mystical grove where silence reigns supreme.",
  symbolism: "The power of quietude and introspection.",
  relatedTerms: ["emerald-moss", "meditation"],
  curatorId: userId,
  isPublic: true,
  isFeatured: false
});
```

### Querying Featured Entries
```typescript
const featured = await storage.getLoreEntries({ featured: true });
```

### Searching Lore
```typescript
const results = await storage.getLoreEntries({ 
  search: "consciousness",
  category: "mythic_term" 
});
```

## Troubleshooting

### Migration Issues
If the table doesn't exist:
```bash
# Run the migration manually
psql $DATABASE_URL < migrations/add_lore_compendium.sql
```

### Slug Conflicts
If you get "slug already exists" errors:
- Use the auto-generated slug (derived from title)
- Manually append a number: `"my-entry-2"`
- Change the title to be more unique

### Permission Errors
- Ensure user is authenticated (`req.isAuthenticated()`)
- Verify curator_id matches current user
- Check for owner/admin role if needed

### Search Not Working
- Verify `ilike` import from drizzle-orm
- Check PostgreSQL version supports ILIKE
- Ensure content is not null

## Performance Considerations

### Optimization Tips
1. **Pagination**: Implement for large entry counts
2. **Caching**: Cache frequently accessed entries
3. **Lazy Loading**: Load images/audio on demand
4. **Debouncing**: Debounce search input (300ms)
5. **Indexes**: Ensure proper index usage

### Monitoring
Track these metrics:
- Total entries by category
- Search query frequency
- Most viewed entries
- Curator activity
- Featured entry rotation

## Contributing

To add entries manually:
1. Visit `/lore`
2. Sign in
3. Click "Add Entry"
4. Fill in the form
5. Submit

To report issues:
- Check slug uniqueness
- Verify URLs are valid
- Ensure markdown is properly formatted
- Test art/audio links before saving

## License & Attribution

- Lore content follows the platform's standard license
- User-contributed stories retain attribution to contributor
- System-seeded lore is marked with `curatorId: "system"`

---

**Last Updated:** 2026-01-20  
**Version:** 1.0.0  
**Maintainer:** The Collective

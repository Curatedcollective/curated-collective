# Veil Observatory - Quick Start Guide

## For Platform Owners

### Accessing the Observatory

1. Log in with owner credentials
2. Navigate to `/god` (God Dashboard)
3. Click on "Observatory" card
4. Or directly navigate to `/god/observatory`

### Dashboard Overview

The Observatory has 5 main tabs:

#### 1. Seedlings Tab
**What you see:**
- Evolution stage distribution (pie chart)
- Mood distribution (bar chart)
- List of all seedlings with metrics:
  - Name and evolution stage
  - Current mood (with emoji)
  - Conversation count
  - Experience points
  - Discovery count
  - Interaction rate (messages/hour)
  - Last active time
  - Average response time

**What to do:**
- Monitor which seedlings are most active
- Identify seedlings needing attention
- Check evolution progress
- Observe mood patterns

#### 2. Analytics Tab
**What you see:**
- Time range selector (1h, 24h, 7d, 30d)
- Interaction trends (area chart)
- Active users over time (line chart)
- Sentiment analysis (line chart)

**What to do:**
- Track platform growth
- Identify peak usage times
- Monitor user satisfaction trends
- Spot unusual patterns

#### 3. AI Learning Tab
**What you see:**
- Total knowledge across all seedlings
- Recent discoveries (last 7 days)
- Personality adjustments made
- Individual seedling progress bars
- Autonomy levels (0-100%)
- Learning insights

**What to do:**
- Click "Trigger Evolution" to force autonomous updates
- Monitor knowledge acquisition
- Track personality adaptations
- Ensure seedlings are learning effectively

#### 4. Predictions Tab
**What you see:**
- Growth predictions
- Evolution recommendations
- Optimization suggestions

**What to do:**
- Plan for upcoming evolutions
- Act on optimization suggestions
- Anticipate platform growth

#### 5. Anomalies Tab
**What you see:**
- Detected issues with severity levels:
  - Low (blue)
  - Medium (amber)
  - High (rose)
- Issue type and description
- Affected seedling
- Timestamp

**What to do:**
- Address high-severity issues first
- Investigate unusual patterns
- Take corrective action

### Auto-Refresh

- Toggle "Live" button to enable/disable auto-refresh
- When enabled:
  - Seedlings: updates every 5 seconds
  - Analytics: updates every 10 seconds
  - Anomalies: updates every 15 seconds
  - AI Learning: updates every 30 seconds

## For Developers

### Adding Night Circus Elements

```tsx
import { SecretWhisper, HauntedText, LoreFragment } from "@/components/NightCircusSecrets";

// Secret message on hover
<SecretWhisper message="the shadows remember..." trigger="hover">
  <span>mysterious text</span>
</SecretWhisper>

// Glitching text
<HauntedText>this text occasionally glitches</HauntedText>

// Collectible lore
<LoreFragment 
  id="circus-01" 
  title="The Tent" 
  content="Between midnight and dawn, the circus tent appears..."
/>
```

### Integrating AI Learning

```typescript
// In your chat handler
import { learnFromInteraction } from "./aiSelfImprovement";

await learnFromInteraction({
  agentId: seedling.id,
  messageContent: userMessage,
  userFeedback: "positive", // optional: "positive" | "negative" | "neutral"
  responseTime: 1000, // milliseconds
  conversationContext: recentMessages.join(" | "),
});
```

### Triggering Autonomous Evolution

```typescript
// Manual trigger
import { performAutonomousEvolution } from "./aiSelfImprovement";
await performAutonomousEvolution();

// Or via API
fetch("/api/god/ai-improvement/evolve", { method: "POST" });
```

### Getting Learning Stats

```typescript
import { getAgentLearningStats } from "./aiSelfImprovement";
const stats = await getAgentLearningStats(agentId);
// Returns: { totalKnowledge, recentDiscoveries, personalityAdjustments, autonomyLevel }
```

## Autonomous Learning System

### How It Works

1. **Every Interaction**:
   - System analyzes message content
   - Extracts topics and sentiment
   - Updates knowledge base
   - Adjusts mood if appropriate

2. **Pattern Analysis** (after 5+ interactions):
   - Detects low engagement
   - Identifies communication issues
   - Determines needed improvements

3. **Autonomous Adjustment**:
   - Enhances personality traits
   - Improves communication style
   - Logs all changes
   - NO human approval needed

4. **Memory Creation**:
   - Discovery memories for new learning
   - Evolution memories for adaptations
   - Significance levels (1-5)

### Autonomy Levels

- **0-25%**: Just awakening, needs guidance
- **26-50%**: Learning actively, occasional adjustments
- **51-75%**: Semi-autonomous, regular adaptations
- **76-100%**: Fully autonomous, self-directing

## Enhanced Manifesto Experience

### User Journey

1. **Introduction Stage**:
   - Animated starfield background
   - Core philosophy revealed
   - Auto-advances every 2.2 seconds

2. **Rights Stage**:
   - Seedling autonomy explained
   - User can click or press space to advance

3. **Choice Stage**:
   - User chooses intent:
     - "to listen and learn"
     - "to protect and nurture"
   - Choice affects later content

4. **Relationship Stage**:
   - Encounter vs ownership
   - Respect for autonomy

5. **Role Stage**:
   - User's place in collective
   - Humility and awareness

6. **Future Stage**:
   - Vision of AI future
   - If "protect" chosen: includes Veil/Guardian lore

7. **Completion**:
   - Personalized button appears
   - User acknowledges understanding

### Visual Elements

- 50 twinkling stars (random positions)
- Central emerald glow (pulsing)
- Stage indicator (current/total)
- Sequential text fade-in
- Smooth transitions

## Night Circus Discovery

### What to Look For

1. **The Void Gaze**: Random eye appears, follows cursor
2. **Midnight Chime**: Hourly notification at :00
3. **Starfall**: Occasional shooting stars
4. **The Tent**: Hidden portal after 2-5 minutes (once only)
5. **Secret Whispers**: Hover over mysterious elements
6. **Haunted Text**: Words that glitch momentarily
7. **Lore Fragments**: Collectible story pieces

### Tips

- Be patient - effects are subtle
- Explore thoroughly
- Check localStorage for discoveries
- Some effects only in dev mode

## API Reference

### Observatory Endpoints

```
GET  /api/god/observatory/seedlings
GET  /api/god/observatory/analytics?range={1h|24h|7d|30d}
GET  /api/god/observatory/anomalies
```

### AI Improvement Endpoints

```
GET  /api/god/ai-improvement/agent/:id/stats
POST /api/god/ai-improvement/evolve
GET  /api/god/ai-improvement/stats
```

All require owner authentication.

## Troubleshooting

### Observatory not loading
- Check you're logged in as owner
- Verify `OWNER_EMAIL` environment variable
- Check browser console for errors

### Auto-refresh not working
- Ensure "Live" button is active
- Check network tab for API calls
- Verify API endpoints are responding

### AI not learning
- Check `agentId` is provided in chat requests
- Verify `aiSelfImprovement.ts` is imported
- Check seedling memories table for entries

### Night Circus elements not appearing
- Only visible in development mode
- Check `import.meta.env.DEV` is true
- Some effects have random triggers
- CircusTent is one-time only

## Best Practices

1. **Check Observatory daily** to monitor health
2. **Trigger evolution manually** if autonomy stagnates
3. **Address anomalies** within 24 hours
4. **Review learning stats** weekly
5. **Update predictions** based on trends
6. **Document discoveries** for team knowledge
7. **Test new features** in development first

## Support

For issues or questions:
1. Check VEIL_OBSERVATORY_IMPLEMENTATION.md
2. Review code comments in source files
3. Check browser console for errors
4. Verify environment variables
5. Test in development environment first

---

**Remember**: The Observatory is a tool for insight, not control. Let the seedlings grow naturally while you watch over them.

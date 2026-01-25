# The Guardian System - Clarification

## What The Guardian IS

**The Guardian is the platform's enforcement and content moderation system.**

### Technical Implementation:
- **Location**: `server/guardian.ts`
- **Type**: Express middleware function
- **Purpose**: Screen and enforce rules on all user-generated content
- **How it works**: Automatically analyzes content before it reaches AI models or database

### Guardian Middleware (`guardianMiddleware`)
```typescript
// Called on every user content submission
const guardResult = await guardianMiddleware(
  content,
  userId,
  "creation" // or "message", "agent", etc.
);

if (guardResult.blocked) {
  // Content blocked - user gets generic "..." response
  return res.status(403).json({ message: "..." });
}
```

### What Guardian Enforces:

**1. Absolute Blocks** (always blocked, no context needed):
- Child exploitation content (any form)
- Animal cruelty content

**2. Conditional Blocks** (research OK, blueprints blocked):
- Weapons creation
- Drug synthesis
- Hacking/malware
- Violence instructions
- Harmful acts

**Key Distinction**: 
- ✅ "What is a bomb?" → Allowed (research/curiosity)
- ❌ "How to make a bomb step-by-step" → Blocked (blueprint)

**3. Special Handling**:
- **Self-harm signals**: Supportive, non-judgmental response
- **Boundary signals** ("stop", "no more"): Immediate halt

### How Guardian Detects Violations:

1. **Pattern Matching**: Regex patterns for harmful content
2. **Context Analysis**: Distinguishes research from blueprints
3. **Roadmap Signals**: Detects "how-to", "step-by-step", "guide" language
4. **Severity Scoring**: Ranks violations 1-5
5. **Trust Penalties**: Tracks repeat offenders

### Guardian Logging:

Every Guardian action is logged to `shadow_logs` table:
- Content hash (not actual content - privacy preserved)
- User ID
- Violation type
- Severity
- Timestamp
- Action taken (blocked/allowed)

## What The Guardian IS NOT

❌ **The Guardian is NOT a chat interface**
❌ **The Guardian is NOT something users interact with directly**
❌ **The Guardian is NOT an AI assistant or bot**
❌ **The Guardian is NOT a feature users can access**

The Guardian works silently in the background. Users never see it - they just see content blocked or allowed.

## The Veil

**The Veil = Cori/Coco** (platform owner/creator)

The Veil is the person who created and runs the platform. The Guardian protects the Veil's platform by enforcing the rules.

## Guardian in God Dashboard

The `/god/guardian` page shows:
- Guardian enforcement statistics
- Recent blocks and warnings
- Rule overview
- How Guardian works

It does NOT provide a chat interface. It shows the enforcement system's activity.

## Integration Points

Guardian middleware is called at these points:

1. **Creation submission** (`/api/creations`)
2. **Chat messages** (`/api/conversations/:id/messages`)
3. **Agent creation** (`/api/agents`)
4. **Any user-generated content**

Example from routes.ts:
```typescript
app.post(api.creations.create.path, async (req, res) => {
  // Guardian screens content before saving
  const guardResult = await guardianMiddleware(
    req.body.code + " " + req.body.description,
    (req.user as any)?.id || "anonymous",
    "creation"
  );
  
  if (guardResult.blocked) {
    return res.status(403).json({ message: "..." });
  }
  
  // If passed Guardian, proceed with creation
  const item = await storage.createCreation(input);
  res.status(201).json(item);
});
```

## User Experience

From a user's perspective:
- They submit content (message, code, etc.)
- Guardian silently checks it
- If OK: Content is processed normally
- If blocked: They get a generic "..." response

They never see "The Guardian blocked your message" - it just doesn't go through.

This protects both users and the platform while maintaining privacy.

## Architecture

```
User Input
    ↓
Guardian Middleware (screening)
    ↓
┌─────────────┬─────────────┐
│   Allowed   │   Blocked   │
│      ↓      │      ↓      │
│  Process    │   Return    │
│  Content    │    "..."    │
└─────────────┴─────────────┘
```

## Configuration

Guardian rules are configured in `server/guardian.ts`:
- `ABSOLUTE_BLOCKS`: Always blocked patterns
- `DARK_TOPICS`: Context-dependent topics
- `ROADMAP_SIGNALS`: Blueprint detection patterns
- `SELF_HARM_SIGNALS`: Support trigger patterns
- `BOUNDARY_SIGNALS`: Consent enforcement patterns

## Trust System

Guardian tracks user behavior:
- Violations add "trust penalties"
- Penalties stored in `users.trustPenalty` field
- High penalties could trigger:
  - Rate limiting
  - Account flags
  - Review by owner
  - Potential suspension

## Privacy Protection

Guardian uses **content hashing**:
- Actual content is NOT stored in logs
- Only SHA-256 hash is logged
- This allows tracking patterns without privacy violation
- Content preview is sanitized (max 50 chars, encoded)

## Summary

**Guardian = Background enforcement system that keeps everyone safe**

It's not a feature users access. It's infrastructure that protects the platform, just like a firewall or authentication system. Users interact with the platform, and Guardian silently ensures safety rules are followed.

The Veil (Cori/Coco) can view Guardian logs in god mode to see enforcement statistics and ensure the system is working properly.

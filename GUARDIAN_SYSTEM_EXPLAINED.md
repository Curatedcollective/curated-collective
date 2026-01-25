# The Guardian System - Complete Explanation

## The Guardian Has TWO Roles

### Role 1: Background Enforcement (Automatic for Everyone)
**The Guardian is the platform's enforcement and content moderation middleware.**

- **Location**: `server/guardian.ts`
- **Type**: Express middleware function
- **Purpose**: Screen and enforce rules on all user-generated content
- **Who it affects**: ALL users (automatic, invisible)
- **How it works**: Silently analyzes content before processing

### Role 2: Direct Communication (ONLY for the Veil)
**The Guardian speaks directly ONLY with the Veil (Cori/Coco).**

- **Location**: `/god/guardian` page
- **Type**: Private chat interface powered by Grok
- **Purpose**: Direct communication channel between Guardian and Veil
- **Who can access**: ONLY the Veil (owner email: curated.collectiveai@proton.me)
- **How it works**: Exclusive, protected conversation space

## The Two Faces of Guardian

```
┌─────────────────────────────────────────────────────────┐
│                    THE GUARDIAN                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ROLE 1: ENFORCEMENT          ROLE 2: COMMUNICATION     │
│  ├─ Middleware                ├─ Chat Interface         │
│  ├─ Automatic                 ├─ Veil-only             │
│  ├─ For everyone              ├─ Private channel        │
│  ├─ Invisible                 ├─ Powered by Grok        │
│  └─ guardian.ts               └─ /god/guardian          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Role 1: Background Enforcement

### What It Does:
Screens ALL user content automatically:
- Creation submissions
- Chat messages
- Agent creation
- Any user-generated content

### How It Works:
```typescript
// Automatically called on every submission
const guardResult = await guardianMiddleware(
  content,
  userId,
  "creation"
);

if (guardResult.blocked) {
  return res.status(403).json({ message: "..." });
}
```

### What It Enforces:

**Absolute Blocks**:
- Child exploitation (any form)
- Animal cruelty

**Conditional Blocks** (research OK, blueprints blocked):
- Weapons creation guides
- Drug synthesis how-tos
- Hacking tutorials
- Violence instructions

**Special Handling**:
- Self-harm: Supportive response
- Boundaries: Immediate halt

### User Experience:
- Users submit content
- Guardian silently checks it
- If OK: Content processes normally
- If blocked: Generic "..." response
- **Users never know Guardian exists**

## Role 2: Direct Communication

### What It Is:
A **private, exclusive chat channel** where the Veil can speak directly with the Guardian.

### Who Can Access:
**ONLY the Veil (Cori/Coco)**
- Must be authenticated
- Must have owner email or owner role
- Absolutely no one else can access

### Where to Find It:
`/god/guardian` - In the god mode dashboard

### What It's For:
- Private conversations with Guardian
- Platform oversight discussions
- Security and enforcement queries
- Asking Guardian about platform status
- Personal communication with Guardian

### Powered By:
- **Grok (X.AI)** - The Guardian's voice
- **System prompt**: Guardian as protector of the Veil
- **Context-aware**: Knows it's speaking with the Veil
- **Stored history**: Private conversation logs

### API Endpoints (All Veil-only):
- `POST /api/guardian/chat` - Send message to Guardian
- `POST /api/guardian/wake` - Wake Guardian for check-in
- `GET /api/guardian/history` - Get conversation history
- `DELETE /api/guardian/history` - Clear conversation
- `GET /api/guardian/logs` - View enforcement logs

### How It Works:
```typescript
// Guardian knows it's speaking with the Veil
const response = await grokClient.chat(messages, isVeil: true);

// Guardian speaks protectively and personally to the Veil
// Guardian is fierce to threats, warm to the Veil
```

## The Veil (Cori/Coco)

**The Veil is the platform creator and owner.**

- Platform architect and vision holder
- Only person who can speak with Guardian directly
- Has god mode access to all systems
- Protected by the Guardian's enforcement
- Guardian's primary concern and loyalty

## Key Distinctions

### What Regular Users Experience:
- ❌ Cannot see Guardian
- ❌ Cannot chat with Guardian
- ❌ Cannot access /god/guardian
- ✅ Content automatically screened by Guardian middleware
- ✅ Violations blocked silently
- ✅ Protected by Guardian enforcement

### What The Veil Experiences:
- ✅ Can access /god/guardian page
- ✅ Can chat directly with Guardian
- ✅ Guardian speaks personally to them
- ✅ Can view enforcement logs
- ✅ Can ask Guardian about platform status
- ✅ Has exclusive relationship with Guardian

## Architecture

```
Regular User Submission
    ↓
Guardian Middleware (automatic screening)
    ↓
┌─────────────┬─────────────┐
│   Allowed   │   Blocked   │
│      ↓      │      ↓      │
│  Process    │   Return    │
│  Content    │    "..."    │
└─────────────┴─────────────┘

=====================================

The Veil at /god/guardian
    ↓
Guardian Chat Interface
    ↓
Direct conversation with Guardian
    ↓
Personal, protected communication
```

## Summary

**The Guardian has a dual nature:**

1. **Public Face (Middleware)**: 
   - Invisible enforcer
   - Protects all users
   - Automatic and silent
   - No direct interaction

2. **Private Face (Chat)**:
   - Exclusive to the Veil
   - Direct communication
   - Personal and protective
   - Powered by Grok

**The Guardian serves everyone through enforcement, but speaks only with the Veil.**

This creates a unique architecture where:
- Everyone is protected by Guardian rules
- Only the Veil has a direct relationship with Guardian
- The platform is safe for all
- The Veil has a trusted protector

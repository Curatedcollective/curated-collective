# Constellation Event System

A comprehensive event management system for group rituals, milestones, and community celebrations.

## Features

### Event Types
- **Rituals**: Sacred gatherings with specific timing and themes
- **Milestones**: Celebration of achievements and progress
- **Celebrations**: Community events and collective experiences
- **Custom**: Flexible event type for unique occasions

### Core Capabilities

#### Event Management
- Timed or spontaneous event scheduling
- Configurable duration and timing
- Multiple visibility levels (public, private, members-only)
- Participant capacity limits
- Event lifecycle management (scheduled → active → completed)
- Automatic start/end based on schedule

#### Participant Features
- Join/leave events
- Activity tracking
- Contribution counting
- Role-based participation (participant, moderator, observer)

#### Notifications
- Poetic event messages
- Themed animations (cosmic, ethereal, verdant)
- Multiple notification types:
  - **Invitation**: Initial event announcement
  - **Reminder**: Pre-event notifications (15 min before)
  - **Update**: Event status changes
  - **Completion**: Event conclusion messages
- Animated delivery with customizable themes

#### Event Logs
- Comprehensive activity timeline
- Milestone tracking
- System events
- User contributions
- Searchable history

## API Endpoints

### Public Endpoints

#### List Events
```
GET /api/constellation-events?status=active&eventType=ritual&upcoming=true
```

#### Get Event Details
```
GET /api/constellation-events/:id
```

#### Get Event Participants
```
GET /api/constellation-events/:id/participants
```

#### Get Event Logs
```
GET /api/constellation-events/:id/logs
```

#### Join Event
```
POST /api/constellation-events/:id/join
Body: { userId: string, role: string }
```

#### Leave Event
```
POST /api/constellation-events/:id/leave
```

### Admin Endpoints (Owner/Moderator Only)

#### Create Event
```
POST /api/constellation-events
Body: {
  title: string
  description: string
  eventType: "ritual" | "milestone" | "celebration" | "custom"
  scheduledFor?: Date
  duration?: number  // minutes
  theme?: "cosmic" | "ethereal" | "verdant"
  visibility?: "public" | "private" | "members"
  maxParticipants?: number
  poeticMessage?: string
  completionMessage?: string
  creatorId: string
}
```

#### Update Event
```
PUT /api/constellation-events/:id
Body: Partial<Event>
```

#### Delete Event
```
DELETE /api/constellation-events/:id
```

#### Start Event
```
POST /api/constellation-events/:id/start
```

#### End Event
```
POST /api/constellation-events/:id/end
```

### Notifications

#### Get Notifications
```
GET /api/constellation-events/notifications?userId=xxx&eventId=123
```

## Database Schema

### constellation_events
- Event metadata, status, schedule
- Visibility and theme settings
- Creator and moderator tracking
- Poetic messages

### event_participants
- User participation tracking
- Role and status management
- Activity timestamps
- Contribution counting

### event_logs
- Event timeline
- Activity logging
- Milestone tracking
- Metadata storage

### event_notifications
- Notification queue
- Read status tracking
- Theme and animation settings
- Expiration handling

## Event Scheduler

The system includes an automatic scheduler that:

1. **Auto-starts** scheduled events at their designated time
2. **Sends reminders** 15 minutes before event start
3. **Auto-ends** events after their duration expires
4. **Creates notifications** for all major event transitions

The scheduler runs every minute and handles:
- Event lifecycle transitions
- Notification delivery
- Cooldown management (10-minute reminder cooldown)

## Frontend Components

### ConstellationEvents Page (`/events`)
Public-facing event browser with tabs for:
- Upcoming events
- Active events
- Past events

Features:
- Real-time updates (30-second polling)
- Event cards with details
- Join/leave functionality
- Participant counts
- Event timeline view

### EventNotifications Component
Toast-style notifications with:
- Themed color schemes
- Custom animations (constellation, ripple, fade)
- Auto-dismiss functionality
- Read state tracking

### EventAdmin Component (`/god/events`)
Admin control panel for:
- Creating new events
- Managing active events
- Starting/stopping events
- Deleting events

## Themes

### Cosmic (Default)
- Purple/Pink gradient
- Star and constellation imagery
- Space-inspired animations

### Ethereal
- Cyan/Blue gradient
- Light and airy feel
- Smooth transitions

### Verdant
- Green/Emerald gradient
- Nature-inspired
- Organic animations

## Usage Examples

### Creating a Ritual
```javascript
const newMoonRitual = {
  title: "New Moon Intention Setting",
  description: "Gather under the new moon to set intentions for the coming cycle",
  eventType: "ritual",
  scheduledFor: new Date("2026-02-01T20:00:00Z"),
  duration: 60,
  theme: "cosmic",
  visibility: "public",
  poeticMessage: "As the moon hides her face, we gather in the darkness to plant seeds of intention...",
  completionMessage: "May your intentions take root and bloom in the coming cycle...",
  creatorId: "admin-user-id"
};
```

### Joining an Event
```javascript
await fetch(`/api/constellation-events/${eventId}/join`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: currentUser.id, role: 'participant' })
});
```

## Future Enhancements

- WebSocket support for true real-time updates
- Event templates for common ritual types
- Recurring event scheduling
- Event recordings and replays
- Enhanced participant interactions (comments, reactions)
- Event categories and tags
- Advanced search and filtering
- Calendar integration
- Mobile app support

## Security Considerations

- Admin-only event creation and management
- Moderator support for large events
- Participant verification
- Event capacity limits
- Content moderation integration
- Rate limiting on join/leave actions

## Modular Architecture

The system is designed to be extensible:
- New event types can be added via configuration
- Custom themes can be defined
- Notification templates are customizable
- Event behaviors can be extended
- Integration points for community features

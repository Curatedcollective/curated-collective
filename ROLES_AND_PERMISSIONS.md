# Roles and Permissions System

## Overview

The Curated Collective platform now features a comprehensive, modular roles and permissions system that enables fine-grained access control across all sanctuary features.

## Architecture

### Database Schema

#### Tables

1. **roles** - Defines roles with their permissions
   - Modular permission structure stored as JSONB
   - System roles (cannot be deleted)
   - Priority system for permission conflicts
   - Poetic descriptions aligned with sanctuary design

2. **user_roles** - Junction table for user-role assignments
   - Many-to-many relationship
   - Supports role expiration
   - Tracks assignment context and metadata
   - Can be activated/deactivated

3. **role_invites** - Invite-based onboarding system
   - Unique invite codes
   - Optional email restriction
   - Usage limits and tracking
   - Expiration support

4. **role_audit_logs** - Complete audit trail
   - All role operations logged
   - Tracks previous and new values
   - Includes IP address and user agent
   - Searchable and filterable

### Default Roles

#### The Veil (Admin)
- **Priority**: 1000
- **Color**: Purple
- **Icon**: Crown
- Full access to all system features including role management, user administration, and system configuration.

#### Moderator
- **Priority**: 500
- **Color**: Emerald
- **Icon**: Shield Check
- Guardians of harmony. Can moderate content, manage events, view audit logs, and curate lore/agents.

#### Architect
- **Priority**: 300
- **Color**: Blue
- **Icon**: Compass
- Creators and builders. Can author ceremonies, create/edit agents and creations, manage events, and contribute to lore.

#### Storyteller
- **Priority**: 200
- **Color**: Amber
- **Icon**: Book Open
- Weavers of narrative. Can create agents, creations, and lore entries. Focus on content contribution.

#### Guest
- **Priority**: 50
- **Color**: Gray
- **Icon**: Eye
- Wanderers at the threshold. Read-only access to public content.

## Permission Structure

Permissions are organized by resource and action:

```typescript
{
  dashboard: { view, edit },
  users: { view, edit, delete, assignRoles },
  agents: { view, create, edit, delete, curate },
  creations: { view, create, edit, delete, curate },
  lore: { view, create, edit, delete, curate },
  chat: { access, moderate },
  messaging: { send, moderate },
  events: { view, create, edit, delete, moderate },
  audit: { view },
  settings: { view, edit },
  roles: { view, create, edit, delete, assign },
  ceremonies: { view, author, edit, delete },
  guardian: { view, configure }
}
```

## Backend API

### Endpoints

#### Role Management
- `GET /api/roles` - List all roles
- `GET /api/roles/:id` - Get specific role
- `POST /api/roles` - Create new role (requires `roles.create`)
- `PUT /api/roles/:id` - Update role (requires `roles.edit`)
- `DELETE /api/roles/:id` - Delete role (requires `roles.delete`)

#### User Role Assignment
- `POST /api/roles/assign` - Assign role to user (requires `roles.assign`)
- `POST /api/roles/revoke` - Revoke role from user (requires `roles.assign`)
- `POST /api/roles/bulk-assign` - Assign role to multiple users
- `GET /api/roles/user/:userId` - Get user's roles

#### Invites
- `POST /api/roles/invites` - Create invite (requires `roles.assign`)
- `GET /api/roles/invites` - List invites (requires `roles.view`)
- `POST /api/roles/invites/:code/use` - Use invite code (public)

#### Audit
- `GET /api/roles/audit` - Get audit logs (requires `audit.view`)
  - Query params: `roleId`, `userId`, `action`, `limit`

### Middleware

#### `requirePermission(resource, action)`
Protects routes by checking user permissions:

```typescript
app.post('/api/roles', requirePermission('roles', 'create'), async (req, res) => {
  // Only users with roles.create permission can access
});
```

#### `requireAnyPermission([{resource, action}, ...])`
Checks if user has any of the specified permissions:

```typescript
app.get('/api/manage', requireAnyPermission([
  { resource: 'roles', action: 'view' },
  { resource: 'users', action: 'view' }
]), async (req, res) => {
  // User needs either permission
});
```

#### `loadPermissions`
Loads user permissions into `req.userPermissions` for use in route handlers.

### Storage Layer

The `roleStorage` module provides:

```typescript
// Roles
getRoles()
getRole(id)
getRoleByName(name)
createRole(data)
updateRole(id, data)
deleteRole(id)

// User Roles
getUserRoles(userId)
assignRoleToUser(data)
revokeRoleFromUser(userId, roleId)
bulkAssignRole(userIds, roleId, assignedBy, context)

// Invites
createInvite(data)
getInvites()
getInviteByCode(code)
useInvite(code)

// Audit
createAuditLog(data)
getAuditLogs(filters)

// Permission Helpers
getUserPermissions(userId)
hasPermission(userId, resource, action)
```

## Frontend Components

### Admin Pages

#### Role Management (`/god/roles`)
- Create and edit roles
- Configure permissions with visual editor
- Activate/deactivate roles
- Delete non-system roles
- Beautiful poetic UI with role colors and icons

#### User Role Assignment (`/god/user-roles`)
- Single and bulk role assignment
- Search user roles
- Revoke roles
- Create invite codes
- View assignment history

#### Audit Log Viewer (`/god/audit`)
- Filter by action, user, role
- View complete change history
- See previous and new values
- Track IP addresses and user agents
- Paginated results

### React Hooks

#### `usePermissions()`
Hook for accessing user permissions:

```typescript
const { 
  permissions,      // User's combined permissions
  userRoles,        // User's active roles
  loading,          // Loading state
  isOwner,          // Is owner check
  hasPermission,    // Check single permission
  hasAnyPermission, // Check any of multiple
  hasAllPermissions,// Check all of multiple
  getPrimaryRole,   // Get highest priority role
  refresh           // Reload permissions
} = usePermissions();
```

#### `useHasPermission(resource, action)`
Simple permission check hook:

```typescript
const canCreate = useHasPermission('roles', 'create');

if (canCreate) {
  // Show create button
}
```

### Components

#### `<Protected>`
Conditionally render based on permissions:

```tsx
<Protected resource="roles" action="create">
  <Button>Create Role</Button>
</Protected>

// Or with multiple permissions
<Protected requireAny={[
  { resource: "roles", action: "create" },
  { resource: "roles", action: "edit" }
]}>
  <Button>Manage Roles</Button>
</Protected>
```

#### `withPermission(Component, permission)`
Higher-order component for protecting entire pages:

```typescript
export default withPermission(MyPage, { 
  resource: "dashboard", 
  action: "view" 
});
```

## Usage Examples

### Backend: Protect a Route

```typescript
import { requirePermission } from "./roleMiddleware";

app.post("/api/agents/:id/curate", 
  requirePermission('agents', 'curate'),
  async (req, res) => {
    // Only users with agents.curate permission can access
    const agent = await storage.updateAgent(req.params.id, {
      isCurated: true
    });
    res.json(agent);
  }
);
```

### Frontend: Conditional UI

```tsx
import { Protected } from "@/components/Protected";

function AgentCard({ agent }) {
  return (
    <Card>
      <CardContent>
        <h3>{agent.name}</h3>
        
        <Protected resource="agents" action="edit">
          <Button onClick={() => editAgent(agent)}>
            Edit
          </Button>
        </Protected>
        
        <Protected resource="agents" action="curate">
          <Button onClick={() => curateAgent(agent)}>
            Curate
          </Button>
        </Protected>
      </CardContent>
    </Card>
  );
}
```

### Frontend: Permission-based Logic

```tsx
import { usePermissions } from "@/hooks/use-permissions";

function Dashboard() {
  const { hasPermission, getPrimaryRole } = usePermissions();
  
  const canManageUsers = hasPermission('users', 'edit');
  const primaryRole = getPrimaryRole();
  
  return (
    <div>
      <h1>Welcome, {primaryRole?.role.displayName}</h1>
      
      {canManageUsers && (
        <UserManagementPanel />
      )}
    </div>
  );
}
```

## Seeding Initial Roles

Run the seed script to create default roles:

```bash
npx tsx scripts/seed-roles.ts
```

This creates the five default roles (Veil, Moderator, Architect, Storyteller, Guest) with appropriate permissions.

## Security Considerations

1. **Owner Override**: Users with `role: 'owner'` or the configured owner email always have all permissions.

2. **System Roles**: Roles marked as `isSystem: true` cannot be deleted to prevent accidental removal of critical roles.

3. **Priority System**: When a user has multiple roles, permissions are merged with higher priority roles taking precedence.

4. **Audit Trail**: All role operations are logged with IP address, user agent, and full change history.

5. **Immediate Enforcement**: Permission changes take effect immediately - no caching or session refresh required.

## Future Enhancements

- [ ] Role inheritance/hierarchy
- [ ] Time-based role assignments (temporary permissions)
- [ ] Role templates for common use cases
- [ ] Permission groups for easier management
- [ ] Email notifications for role changes
- [ ] Self-service role requests
- [ ] Advanced audit log analytics
- [ ] Permission presets for different sanctuary types

## Migration from Old System

The old system used a simple `role` field on users (`user` or `owner`). The new system:

1. Maintains backward compatibility - owner email/role still works
2. Adds granular permissions on top
3. Allows multiple roles per user
4. Provides audit trail for all changes
5. Enables future expansion without schema changes

To migrate existing users:
1. Run the seed script to create default roles
2. Assign appropriate roles to existing users via the admin UI
3. Old owner checks continue to work alongside new permissions
